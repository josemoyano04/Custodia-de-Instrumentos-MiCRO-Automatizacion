import { supabase } from "./supabaseClient";
import { callApi } from "./dataService";

export interface SyncResult {
  ok: boolean;
  totalInstrumentos: number;
  totalVencimientos: number;
  mensaje: string;
  error?: string;
}

function normalizarFechaISO(raw: any): string | null {
  if (!raw || typeof raw !== "string" && !(raw instanceof Date)) return null;
  if (raw instanceof Date) {
    if (isNaN(raw.getTime())) return null;
    return raw.toISOString().split("T")[0];
  }
  const str = String(raw).trim();
  if (!str) return null;
  // Si ya viene como YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  // Si viene como DD/MM/YYYY
  const partes = str.split("/");
  if (partes.length === 3) {
    const d = partes[0].padStart(2, "0");
    const m = partes[1].padStart(2, "0");
    const y = partes[2].length === 2 ? `20${partes[2]}` : partes[2];
    return `${y}-${m}-${d}`;
  }
  return null;
}

function calcularDiasRestantes(fechaISO: string | null): number | null {
  if (!fechaISO) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const target = new Date(`${fechaISO}T00:00:00`);
  if (isNaN(target.getTime())) return null;
  return Math.round((target.getTime() - hoy.getTime()) / 86400000);
}

/**
 * Servicio dedicado para sincronizar los datos de Google Sheets hacia Supabase PostgreSQL.
 * Realiza un UPSERT (INSERT si no existe, UPDATE si ya existe) basado en la clave primaria `codigo`.
 */
export async function sincronizarGoogleSheetsConSupabase(): Promise<SyncResult> {
  console.group("🔄 [SYNC] Iniciando proceso de sincronización (Google Sheets ➔ Supabase)");
  const tiempoInicio = performance.now();
  console.log("⏱️ [SYNC] Timestamp inicio:", new Date().toLocaleTimeString("es-AR"));

  try {
    // 1. Obtener datos desde Google Apps Script (1 sola llamada unificada)
    console.log("📡 [SYNC-GS] Solicitando catálogo maestro (accion='getInstrumentos') a Google Apps Script...");
    const tiempoGSInicio = performance.now();

    let resInst: any = null;

    try {
      resInst = await callApi({ accion: "getInstrumentos" });
      const tiempoGSFin = performance.now();
      console.log(`⏱️ [SYNC-GS] Respuesta recibida en ${(tiempoGSFin - tiempoGSInicio).toFixed(0)} ms`);
    } catch (e: any) {
      console.error("❌ [SYNC-GS] Error de red al invocar getInstrumentos:", e);
      throw new Error(`Error de conexión con Google Apps Script: ${e.message || e}`);
    }

    if (!resInst || !resInst.ok || !Array.isArray(resInst.data)) {
      console.error("❌ [SYNC-GS] Respuesta no válida de Google Apps Script:", resInst);
      throw new Error(resInst?.error || "Respuesta inválida desde Google Sheets (res.data no es un array).");
    }

    console.log(`✅ [SYNC-GS] getInstrumentos exitoso. ${resInst.data.length} registros brutos recibidos de Google Sheets.`);

    const instrumentosGS = resInst.data;

    // =========================================================================
    // 🔍 DEPURAÇÃO: ANÁLISIS DE CÓDIGOS DUPLICADOS EN LA RESPUESTA DE GOOGLE SHEETS
    // =========================================================================
    console.group("🔍 [DEBUG-ANÁLISIS] Verificación de duplicados en datos crudos de Google Sheets");
    const conteoCodigos = new Map<string, { veces: number; indices: number[]; registros: any[] }>();

    instrumentosGS.forEach((item: any, idx: number) => {
      const codRaw = String(item.codigo || item.c || "").trim();
      const codKey = codRaw.toUpperCase();
      if (!codKey) return;

      if (!conteoCodigos.has(codKey)) {
        conteoCodigos.set(codKey, { veces: 1, indices: [idx + 1], registros: [item] });
      } else {
        const info = conteoCodigos.get(codKey)!;
        info.veces++;
        info.indices.push(idx + 1);
        info.registros.push(item);
      }
    });

    const listaDuplicados: any[] = [];
    conteoCodigos.forEach((info, codigo) => {
      if (info.veces > 1) {
        listaDuplicados.push({
          codigo,
          repeticiones: info.veces,
          filasGoogleSheetsAprox: info.indices.join(", "),
          nombres: info.registros.map(r => r.nombre || r.n).join("  ||  ")
        });
      }
    });

    if (listaDuplicados.length === 0) {
      console.log("✅ [DEBUG-ANÁLISIS] No se detectó ningún código repetido en los 897 registros.");
    } else {
      console.warn(`🚨 [DEBUG-ANÁLISIS] Se encontraron ${listaDuplicados.length} CÓDIGOS DUPLICADOS en la respuesta de Google Sheets:`);
      console.table(listaDuplicados);
      console.log("Detalle completo de objetos duplicados:", listaDuplicados);
    }
    console.groupEnd();

    // 2. Normalizar, estructurar y asegurar unicidad por clave compuesta (codigo + nombre)
    console.log("⚙️ [SYNC-PROCESS] Normalizando y estructurando instrumentos con Clave Compuesta (codigo + nombre)...");
    
    const uniqueRowsMap = new Map<string, any>();
    let duplicadosExactos = 0;
    const fusionadosList: { codigo: string; nombre: string; sector: string }[] = [];

    for (const inst of instrumentosGS) {
      const cod = String(inst.codigo || inst.c || "").trim();
      const nom = String(inst.nombre || inst.n || "").trim();
      const sec = String(inst.sector || inst.s || "").trim();
      
      if (!cod || !nom) continue;

      // Clave primaria compuesta: CODIGO + NOMBRE
      const compositeKey = `${cod.toUpperCase()}|||${nom.toUpperCase()}`;
      const fechaCalibRaw = inst.calibrado || null;
      const fechaVencRaw = inst.vencimiento || null;
      
      const fechaCalib = normalizarFechaISO(fechaCalibRaw);
      const fechaVenc = normalizarFechaISO(fechaVencRaw);
      const diasRestantes = calcularDiasRestantes(fechaVenc);

      let estadoCalib = inst.estado || inst.e || "CALIBRADO";
      if (diasRestantes !== null) {
        if (diasRestantes < 0) estadoCalib = "VENCIDO";
        else if (diasRestantes <= 30) estadoCalib = "PROXIMO A CALIBRAR";
      }

      const row = {
        codigo: cod,
        nombre: nom,
        sector: sec,
        estado_calibracion: estadoCalib,
        fecha_ultima_calibracion: fechaCalib,
        fecha_vencimiento_calibracion: fechaVenc,
        dias_hasta_vencimiento: diasRestantes,
        updated_at: new Date().toISOString()
      };

      if (uniqueRowsMap.has(compositeKey)) {
        duplicadosExactos++;
        fusionadosList.push({ codigo: cod, nombre: nom, sector: sec });
        const prev = uniqueRowsMap.get(compositeKey);
        if (!prev.fecha_vencimiento_calibracion && row.fecha_vencimiento_calibracion) {
          uniqueRowsMap.set(compositeKey, row);
        }
      } else {
        uniqueRowsMap.set(compositeKey, row);
      }
    }

    const rowsToUpsert = Array.from(uniqueRowsMap.values());

    if (duplicadosExactos > 0) {
      console.warn(
        `⚠️ [SYNC-PROCESS] Se fusionaron ${duplicadosExactos} filas que tenían exactamente el mismo (código + nombre) repetido:`,
        fusionadosList
      );
      console.table(fusionadosList);
    }

    console.log(`📊 [SYNC-PROCESS] Total registros listos para persistir en Supabase: ${rowsToUpsert.length}`);
    console.log("📊 [SYNC-PROCESS] Desglose de estados:", {
      conFechaCalibracion: rowsToUpsert.filter((r: any) => r.fecha_ultima_calibracion).length,
      conFechaVencimiento: rowsToUpsert.filter((r: any) => r.fecha_vencimiento_calibracion).length,
      vencidos: rowsToUpsert.filter((r: any) => r.estado_calibracion === "VENCIDO").length,
      proximosACalibrar: rowsToUpsert.filter((r: any) => r.estado_calibracion === "PROXIMO A CALIBRAR").length,
      calibrados: rowsToUpsert.filter((r: any) => r.estado_calibracion === "CALIBRADO").length
    });

    // =========================================================================
    // 3. PERSISTENCIA EN SUPABASE CON UPSERT (ON CONFLICT 'codigo,nombre')
    // =========================================================================
    if (!supabase) {
      console.warn("⚠️ [SYNC-SUPABASE] Cliente Supabase no disponible.");
    } else {
      const chunkSize = 100;
      const totalChunks = Math.ceil(rowsToUpsert.length / chunkSize);
      console.log(`🚀 [SYNC-SUPABASE] Iniciando UPSERT en Supabase: ${rowsToUpsert.length} filas divididas en ${totalChunks} lotes de ${chunkSize}...`);

      for (let i = 0; i < rowsToUpsert.length; i += chunkSize) {
        const batchNum = Math.floor(i / chunkSize) + 1;
        const chunk = rowsToUpsert.slice(i, i + chunkSize);
        
        console.log(`⏳ [SYNC-SUPABASE] Enviando Lote ${batchNum}/${totalChunks} (Códigos: '${chunk[0].codigo}' a '${chunk[chunk.length - 1].codigo}', ${chunk.length} items)...`);
        const tiempoLoteInicio = performance.now();

        const { error } = await supabase
          .from("instrumentos")
          .upsert(chunk, { onConflict: "codigo,nombre" });

        const tiempoLoteFin = performance.now();

        if (error) {
          console.error(`❌ [SYNC-SUPABASE] Error en Lote ${batchNum}/${totalChunks}:`, error);
          console.error("Detalle del error Supabase:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw new Error(`Error en Supabase UPSERT (Lote ${batchNum}): ${error.message}`);
        } else {
          console.log(`✅ [SYNC-SUPABASE] Lote ${batchNum}/${totalChunks} completado con éxito en ${(tiempoLoteFin - tiempoLoteInicio).toFixed(0)} ms.`);
        }
      }
      console.log(`🎉 [SYNC-SUPABASE] Todos los ${totalChunks} lotes se insertaron/actualizaron correctamente en Supabase.`);
    }

    const tiempoTotal = ((performance.now() - tiempoInicio) / 1000).toFixed(2);
    console.log(`🏁 [SYNC] Proceso de sincronización completado con éxito en ${tiempoTotal} segundos.`);
    console.groupEnd();

    return {
      ok: true,
      totalInstrumentos: rowsToUpsert.length,
      totalVencimientos: rowsToUpsert.filter((i: any) => i.fecha_vencimiento_calibracion).length,
      mensaje: `✓ Sincronización exitosa: ${rowsToUpsert.length} instrumentos actualizados en Supabase.`
    };
  } catch (err: any) {
    const tiempoTotal = ((performance.now() - tiempoInicio) / 1000).toFixed(2);
    console.error(`💥 [SYNC] Falla en la sincronización tras ${tiempoTotal} segundos:`, err);
    console.groupEnd();

    return {
      ok: false,
      totalInstrumentos: 0,
      totalVencimientos: 0,
      mensaje: `Error al sincronizar: ${err.message || err}`,
      error: err.message || String(err)
    };
  }
}
