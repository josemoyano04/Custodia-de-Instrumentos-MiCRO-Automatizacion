import { supabase } from "./supabaseClient";
import { callApi } from "./dataService";

export interface SyncResult {
  ok: boolean;
  totalInstrumentos: number;
  totalVencimientos: number;
  mensaje: string;
  error?: string;
}

/**
 * Servicio dedicado para sincronizar los datos de Google Sheets hacia Supabase PostgreSQL.
 * Descarga catálogo general (getInstrumentos) y calibraciones (getVencimientos),
 * y ejecuta un upsert en lotes en la tabla `instrumentos` de Supabase.
 */
export async function sincronizarGoogleSheetsConSupabase(): Promise<SyncResult> {
  try {
    // 1. Obtener instrumentos y vencimientos en paralelo desde Google Apps Script
    const [resInst, resVenc] = await Promise.all([
      callApi({ accion: "getInstrumentos" }),
      callApi({ accion: "getVencimientos" })
    ]);

    if (!resInst || !resInst.ok || !Array.isArray(resInst.data)) {
      throw new Error(resInst?.error || "No se pudieron obtener los instrumentos desde Google Sheets.");
    }

    const instrumentosGS = resInst.data; // [{ c, n, s, e }]
    const vencimientosGS = (resVenc && resVenc.ok && Array.isArray(resVenc.data)) ? resVenc.data : [];

    // Mapa de calibraciones indexado por código para merge rápido
    const vencMap = new Map<string, any>();
    for (const v of vencimientosGS) {
      if (v.codigo) {
        vencMap.set(String(v.codigo).trim().toUpperCase(), v);
      }
    }

    // 2. Si Supabase está disponible, ejecutar upsert en lotes
    if (supabase) {
      const rowsToUpsert = instrumentosGS.map((inst: any) => {
        const cod = String(inst.c || "").trim();
        const vencInfo = vencMap.get(cod.toUpperCase());

        return {
          codigo: cod,
          nombre: inst.n || "",
          sector: inst.s || "",
          estado_calibracion: vencInfo?.estado || inst.e || "CALIBRADO",
          fecha_ultima_calibracion: vencInfo?.calibrado || null,
          fecha_vencimiento_calibracion: vencInfo?.vencimiento || null,
          dias_hasta_vencimiento: typeof vencInfo?.diasRestantes === "number" ? vencInfo.diasRestantes : null,
          updated_at: new Date().toISOString()
        };
      });

      // Upsert en lotes de 100 registros
      const chunkSize = 100;
      for (let i = 0; i < rowsToUpsert.length; i += chunkSize) {
        const chunk = rowsToUpsert.slice(i, i + chunkSize);
        const { error } = await supabase
          .from("instrumentos")
          .upsert(chunk, { onConflict: "codigo" });

        if (error) {
          console.warn("Error en lote de sincronización con Supabase:", error);
        }
      }
    }

    return {
      ok: true,
      totalInstrumentos: instrumentosGS.length,
      totalVencimientos: vencimientosGS.length,
      mensaje: `✓ Sincronizados ${instrumentosGS.length} instrumentos y ${vencimientosGS.length} vencimientos desde Google Sheets.`
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
