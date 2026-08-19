export type DataSourceMode = "AUTO" | "GOOGLE_SHEETS" | "SUPABASE";

export interface AppConfig {
  /**
   * Modo de fuente de datos:
   * - "AUTO": Intenta Supabase si hay credenciales; si no, conmuta a Google Sheets.
   * - "GOOGLE_SHEETS": Usa exclusivamente el Webhook de Google Apps Script.
   * - "SUPABASE": Usa exclusivamente Supabase PostgreSQL.
   */
  dataSourceMode: DataSourceMode;
  scriptUrl: string;
  adminPass: string;
  autoRefreshIntervalMs: number;
  /**
   * Si true, permite retirar instrumentos con calibración VENCIDA,
   * mostrando una advertencia visible en la modal de confirmación de retiro.
   * Si false, bloquea el retiro e informa al operario.
   */
  allowRetiroVencido: boolean;
}

const STORAGE_KEY_ALLOW_RETIRO_VENCIDO = "micro_allow_retiro_vencido";

export function getAllowRetiroVencido(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ALLOW_RETIRO_VENCIDO);
    if (stored !== null) {
      return stored === "true";
    }
  } catch (e) {
    console.warn("Error leyendo localStorage para allowRetiroVencido:", e);
  }
  return import.meta.env.VITE_ALLOW_RETIRO_VENCIDO === "true";
}

export function setAllowRetiroVencido(val: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_ALLOW_RETIRO_VENCIDO, String(val));
  } catch (e) {
    console.warn("Error guardando localStorage para allowRetiroVencido:", e);
  }
  APP_CONFIG.allowRetiroVencido = val;
}

export const APP_CONFIG: AppConfig = {
  dataSourceMode: (import.meta.env.VITE_DATA_SOURCE_MODE as DataSourceMode) || "AUTO",
  scriptUrl: import.meta.env.VITE_SCRIPT_URL || "",
  adminPass: import.meta.env.VITE_ADMIN_PASS || "",
  autoRefreshIntervalMs: 10 * 60 * 1000, // 10 minutos
  allowRetiroVencido: getAllowRetiroVencido()
};
