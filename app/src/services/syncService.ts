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
  try {
    // 1. Obtener datos desde Google Apps Script
    // Intenta primero la llamada unificada getInstrumentos
    let resInst: any = null;
    let resVenc: any = null;

    try {
      resInst = await callApi({ accion: "getInstrumentos" });
    } catch (e) {
      console.warn("Error al llamar getInstrumentos:", e);
    }

    if (!resInst || !resInst.ok || !Array.isArray(resInst.data)) {
      throw new Error(resInst?.error || "No se pudieron obtener los datos maestros desde Google Sheets.");
    }

    const instrumentosGS = resInst.data;

    // Verificar si el script ya devuelve el formato unificado con calibrado/vencimiento
    const tieneFechasUnificadas = instrumentosGS.some((i: any) => i.calibrado || i.vencimiento);

    let vencMap = new Map<string, any>();
    if (!tieneFechasUnificadas) {
      // Si es el script anterior, hacer fallback para obtener getVencimientos
      try {
        resVenc = await callApi({ accion: "getVencimientos" });
        if (resVenc && resVenc.ok && Array.isArray(resVenc.data)) {
          for (const v of resVenc.data) {
            if (v.codigo) vencMap.set(String(v.codigo).trim().toUpperCase(), v);
          }
        }
      } catch (_) {}
    }

    // 2. Si Supabase está disponible, ejecutar UPSERT (INSERT si es nuevo, UPDATE si ya existe)
    if (supabase) {
      const rowsToUpsert = instrumentosGS.map((inst: any) => {
        const cod = String(inst.codigo || inst.c || "").trim();
        const nom = String(inst.nombre || inst.n || "").trim();
        const sec = String(inst.sector || inst.s || "").trim();
        
        const vencInfo = vencMap.get(cod.toUpperCase());
        const fechaCalibRaw = inst.calibrado || vencInfo?.calibrado;
        const fechaVencRaw = inst.vencimiento || vencInfo?.vencimiento;
        
        const fechaCalib = normalizarFechaISO(fechaCalibRaw);
        const fechaVenc = normalizarFechaISO(fechaVencRaw);
        const diasRestantes = typeof vencInfo?.diasRestantes === "number" 
          ? vencInfo.diasRestantes 
          : calcularDiasRestantes(fechaVenc);

        let estadoCalib = inst.estado || vencInfo?.estado || inst.e || "CALIBRADO";
        if (diasRestantes !== null) {
          if (diasRestantes < 0) estadoCalib = "VENCIDO";
          else if (diasRestantes <= 30) estadoCalib = "PROXIMO A CALIBRAR";
        }

        return {
          codigo: cod,
          nombre: nom,
          sector: sec,
          estado_calibracion: estadoCalib,
          fecha_ultima_calibracion: fechaCalib,
          fecha_vencimiento_calibracion: fechaVenc,
          dias_hasta_vencimiento: diasRestantes,
          updated_at: new Date().toISOString()
        };
      }).filter((row: any) => row.codigo && row.nombre);

      // UPSERT en lotes de 100 registros con control ON CONFLICT (codigo)
      const chunkSize = 100;
      for (let i = 0; i < rowsToUpsert.length; i += chunkSize) {
        const chunk = rowsToUpsert.slice(i, i + chunkSize);
        const { error } = await supabase
          .from("instrumentos")
          .upsert(chunk, { onConflict: "codigo" });

        if (error) {
          console.error("Error en lote de UPSERT con Supabase:", error);
          throw new Error(`Error en Supabase UPSERT: ${error.message}`);
        }
      }
    }

    return {
      ok: true,
      totalInstrumentos: instrumentosGS.length,
      totalVencimientos: vencMap.size || instrumentosGS.filter((i: any) => i.vencimiento).length,
      mensaje: `✓ Sincronización exitosa: ${instrumentosGS.length} instrumentos actualizados en Supabase.`
    };
  } catch (err: any) {
    console.error("Error en sincronizarGoogleSheetsConSupabase:", err);
    return {
      ok: false,
      totalInstrumentos: 0,
      totalVencimientos: 0,
      mensaje: `Error al sincronizar: ${err.message || err}`,
      error: err.message || String(err)
    };
  }
}
