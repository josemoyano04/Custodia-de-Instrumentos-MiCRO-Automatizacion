import type { Operario, Instrumento, Maquina, Movimiento, VencimientoCalibracion, PinRegistro } from "../types";

import { supabase } from "./supabaseClient";
import { APP_CONFIG } from "../config/appConfig";

export const SCRIPT_URL = APP_CONFIG.scriptUrl;
export const ADMIN_PASS = APP_CONFIG.adminPass;

export const LEGAJOS: Operario[] = [
  { leg: 175, nombre: "DIAS MAURO DAVID", sector: "CALIDAD" },
  { leg: 405, nombre: "GONZALEZ VIRGINIA INES", sector: "CALIDAD" },
  { leg: 516, nombre: "PEÑA GABRIELA INES", sector: "CALIDAD" },
  { leg: 95, nombre: "TORRES MARIA", sector: "ELECTRICA" },
  { leg: 16, nombre: "ESTRADA MARIO", sector: "FRL" },
  { leg: 36, nombre: "PEREIRA AMELIA", sector: "FRL" },
  { leg: 93, nombre: "IBARRA MARIA", sector: "FRL" },
  { leg: 161, nombre: "BRAVO ADRIANA", sector: "FRL" },
  { leg: 169, nombre: "PAZ ANALIA", sector: "FRL" },
  { leg: 183, nombre: "VICENTE LILIANA", sector: "FRL" },
  { leg: 185, nombre: "ORTEGA CLAUDIO", sector: "FRL" },
  { leg: 197, nombre: "ACEVEDO MARIO", sector: "FRL" },
  { leg: 216, nombre: "IGLESIAS FERNANDO", sector: "FRL" },
  { leg: 329, nombre: "RODRIGUEZ GLADYS", sector: "FRL" },
  { leg: 330, nombre: "DE LOS SANTOS PAOLA", sector: "FRL" },
  { leg: 409, nombre: "CASTELO MIRIAM", sector: "FRL" },
  { leg: 3092, nombre: "YAÑEY MACIEL SHAHA AILEN", sector: "MANT" },
  { leg: 3102, nombre: "DYLAN GABRIEL ENRIQUEZ", sector: "MANT" },
  { leg: 394, nombre: "AHUMADA JOSE LUIS JONATAN", sector: "MANT" },
  { leg: 432, nombre: "VAZQUEZ ANTONIO GABRIEL", sector: "MANT" },
  { leg: 440, nombre: "LAFORCADA SEBASTIAN IGNACIO", sector: "MANT" },
  { leg: 2, nombre: "ALFA MIGUEL", sector: "MATRICERIA" },
  { leg: 12, nombre: "MARGELIS MARCELO", sector: "MATRICERIA" },
  { leg: 75, nombre: "APONTE LUCIANO ANGEL", sector: "MATRICERIA" },
  { leg: 77, nombre: "BRAVO RUBEN", sector: "MATRICERIA" },
  { leg: 99, nombre: "PISANI ERNESTO FELIX", sector: "MATRICERIA" },
  { leg: 114, nombre: "FERRERO ALBERTO", sector: "MATRICERIA" },
  { leg: 143, nombre: "CALLEGARIS DANIEL VICTOR", sector: "MATRICERIA" },
  { leg: 170, nombre: "RAMUNDO DANIEL RODOLFO", sector: "MATRICERIA" },
  { leg: 3040, nombre: "CACERES CESAR DAVID", sector: "MATRICERIA" },
  { leg: 3052, nombre: "ALGUACIL MATIAS JOEL", sector: "MATRICERIA" },
  { leg: 3059, nombre: "ALVEAR JULIAN MATIAS", sector: "MATRICERIA" },
  { leg: 3096, nombre: "CROCE GERMAN MATIAS", sector: "MATRICERIA" },
  { leg: 3104, nombre: "COLLI JOEL FACUNDO", sector: "MATRICERIA" },
  { leg: 201, nombre: "GUEDE RODOLFO", sector: "MATRICERIA" },
  { leg: 500, nombre: "AYALA MAURO RAUL", sector: "MATRICERIA" },
  { leg: 514, nombre: "GENNARO JUAN", sector: "MATRICERIA" },
  { leg: 552, nombre: "AGUILERA NICOLAS", sector: "MATRICERIA" },
  { leg: 20, nombre: "SACAYAN VIVIANA", sector: "PMPP" },
  { leg: 27, nombre: "FALCONE JUAN", sector: "PMPP" },
  { leg: 49, nombre: "LAPROVITERA VICTOR", sector: "PMPP" },
  { leg: 54, nombre: "LEDESMA MARCELO", sector: "PMPP" },
  { leg: 71, nombre: "MORALES AGUSTIN", sector: "PMPP" },
  { leg: 73, nombre: "BARZOLA GUSTAVO", sector: "PMPP" },
  { leg: 74, nombre: "PEREZ WALTER", sector: "PMPP" },
  { leg: 80, nombre: "LINO GUSTAVO", sector: "PMPP" },
  { leg: 83, nombre: "AGUIRRE ANALIA", sector: "PMPP" },
  { leg: 85, nombre: "GAY BEATRIZ", sector: "PMPP" },
  { leg: 92, nombre: "GOMEZ JUAN", sector: "PMPP" },
  { leg: 97, nombre: "SANTOBONUONO DANIEL", sector: "PMPP" },
  { leg: 109, nombre: "AJAMIL SEBASTIAN GUILLERMO", sector: "PMPP" },
  { leg: 121, nombre: "BERNARDI CLAUDIO", sector: "PMPP" },
  { leg: 122, nombre: "MAISTRUK ALEXIS LEANDRO", sector: "PMPP" },
  { leg: 127, nombre: "CUESTA ROBERTO NAHUEL", sector: "PMPP" },
  { leg: 150, nombre: "GIMENEZ JORGE", sector: "PMPP" },
  { leg: 153, nombre: "PAZ VIGNOLY SILVIA", sector: "PMPP" },
  { leg: 156, nombre: "RODRIGUEZ ESTEBAN", sector: "PMPP" },
  { leg: 166, nombre: "FLEITAS ALEJANDRA", sector: "PMPP" },
  { leg: 172, nombre: "PARTARRIEU CARLOS ROBERTO", sector: "PMPP" },
  { leg: 181, nombre: "FERNANDEZ JONATAN EZEQUIEL", sector: "PMPP" },
  { leg: 184, nombre: "ABELANDO PATRICIA", sector: "PMPP" },
  { leg: 186, nombre: "TOLEDO MONICA", sector: "PMPP" },
  { leg: 189, nombre: "BOGADO ABEL", sector: "PMPP" },
  { leg: 3002, nombre: "ALVARO DAMIAN DAVID", sector: "PMPP" },
  { leg: 3004, nombre: "HARDOY HECTOR FABIAN", sector: "PMPP" },
  { leg: 3005, nombre: "FECHA PEDRO", sector: "PMPP" },
  { leg: 3010, nombre: "PEREZ RAMIRO DAVID", sector: "PMPP" },
  { leg: 3022, nombre: "PRINCIPE SUSANA NOEMI", sector: "PMPP" },
  { leg: 3024, nombre: "CADIMA ROCHA ROCIO BRENDA", sector: "PMPP" },
  { leg: 3027, nombre: "ROJO KEVIN JAVIER", sector: "PMPP" },
  { leg: 3044, nombre: "DE VOLDER JONATAN ELIAS", sector: "PMPP" },
  { leg: 3050, nombre: "JIMENEZ CRISTIAN DARIO", sector: "PMPP" },
  { leg: 3057, nombre: "IAKINCHUK ARIEL SERGIO", sector: "PMPP" },
  { leg: 3067, nombre: "MOYANO JOSE MIGUEL", sector: "PMPP" },
  { leg: 3085, nombre: "VAZQUEZ GONZALEZ BRENDA NICOLE", sector: "PMPP" },
  { leg: 3091, nombre: "QUISPE LIMA STEPHANIE NATALY", sector: "PMPP" },
  { leg: 3093, nombre: "ESCALANTE MATEO NICOLAS", sector: "PMPP" },
  { leg: 3100, nombre: "PEDROZO EMILIANO EZEQUIEL", sector: "PMPP" },
  { leg: 203, nombre: "GAMARRA MIGUEL", sector: "PMPP" },
  { leg: 212, nombre: "BARRIOS OSVALDO", sector: "PMPP" },
  { leg: 234, nombre: "PERUGINI FABIAN", sector: "PMPP" },
  { leg: 255, nombre: "MEDINA ALDO", sector: "PMPP" },
  { leg: 331, nombre: "ACOSTA MABEL", sector: "PMPP" },
  { leg: 404, nombre: "ALVARO JUAN", sector: "PMPP" },
  { leg: 408, nombre: "RIVERO GONZALO", sector: "PMPP" },
  { leg: 447, nombre: "CUESTA MARCOS", sector: "PMPP" },
  { leg: 460, nombre: "CRUJEIRAS VICTOR JESUS", sector: "PMPP" },
  { leg: 502, nombre: "GOMEZ MATIAS MIGUEL", sector: "PMPP" },
  { leg: 526, nombre: "CERRADO RODRIGO DAMIAN", sector: "PMPP" },
  { leg: 530, nombre: "HEREDIA SILVINA", sector: "PMPP" },
  { leg: 362, nombre: "GIACOBONI LEONARDO", sector: "PCP" },
  { leg: 393, nombre: "MAROTTA JOSE LUIS", sector: "PCP" },
  { leg: 398, nombre: "VALENTINI LEONARDO", sector: "PCP" },
  { leg: 504, nombre: "MORENO NAHUEL JOSE", sector: "PCP" },
  { leg: 507, nombre: "D'AMICO LUCAS SEBASTIAN", sector: "PCP" },
  { leg: 58, nombre: "MAIDANA JORGELINA", sector: "PERFILERIA" },
  { leg: 3028, nombre: "AYALA RAMIRO THOMAS", sector: "RECEP MAT" },
  { leg: 53, nombre: "SPINA SEBASTIAN", sector: "CILINDROS" }
];

export const MAQUINAS: Maquina[] = [
  { num: "1", desc: "MAQ. ESP. SIERRA CORTA TUBO /ANILLOS", loc: "PMPP" },
  { num: "2", desc: "MAQ. ESP. RECTIFICADORA SIN CENTRO", loc: "PMPP" },
  { num: "4", desc: "MAQ. ESP. RANURADORA TRAGANTES", loc: "PMPP" },
  { num: "7", desc: "M.ESP.CANALETEADORA PILOTO 22 Y 32", loc: "PMPP" },
  { num: "10", desc: "M. ESP.CLAVADO ANILLO CU.PILOTO 32", loc: "PMPP" },
  { num: "14", desc: "MAQ.ESP.CLAVADO ANILLO CU PILOTO 22", loc: "PMPP" },
  { num: "19", desc: "MS. TORNO DIAMANTADOR", loc: "PMPP" },
  { num: "20", desc: "M. ESP. PERFORADORA DE BUJES", loc: "PMPP" },
  { num: "21", desc: "FRESADORA HIDRAULICA HORIZ.", loc: "PMPP" },
  { num: "23", desc: "MAQ. ESP. REBU.", loc: "PMPP" },
  { num: "24", desc: "RECTIFICADORA DE TRAGANTES", loc: "PMPP" },
  { num: "25", desc: "ROSCADORA VERT. MONO HUSILLO", loc: "PMPP" },
  { num: "26", desc: "AGUJEREADOORA BANCO", loc: "PMPP" },
  { num: "27", desc: "AGUJEREADORA BANCO", loc: "PMPP" },
  { num: "29", desc: "TIMONERA", loc: "PMPP" },
  { num: "32", desc: "MAQ. ESP. AGUJEROS PROFUNDOS", loc: "PMPP" },
  { num: "34", desc: "ROSCADORA HORIZONTAL", loc: "PMPP" },
  { num: "35", desc: "ROSCADORA HORIZONTAL", loc: "PMPP" },
  { num: "37", desc: "PRENSA BROCHADO (MOVIL)", loc: "PMPP" },
  { num: "38", desc: "ROSCADORA VERTICAL MAQ. HUSILLO", loc: "PMPP" },
  { num: "39", desc: "RODILLADORA BUJE DISTRI. VT1", loc: "PMPP" },
  { num: "45", desc: "TORNO PARALELO TURRI 160", loc: "MATRICERIA" },
  { num: "51", desc: "M.ESP. CLAVADO BUJE SP 10", loc: "PMPP" },
  { num: "62", desc: "SIERRA SIN FIN", loc: "PMPP" },
  { num: "72", desc: "AMOLADORA DE BANCO", loc: "PMPP" },
  { num: "101", desc: "AMOLADORA DE PIE", loc: "PMPP" },
  { num: "106", desc: "PUESTO ENSAMBLE PILOTO 22", loc: "PMPP" },
  { num: "107", desc: "PUESTO ENSAMBLE PILOTO 32", loc: "PMPP" },
  { num: "113", desc: "M.ESP. ENGRAFADO TUBO GUIA PIL.22", loc: "PMPP" },
  { num: "116", desc: "M.ESP.PERF.CUERPO SB 0", loc: "PMPP" },
  { num: "118", desc: "M.ESP.ROSCADO CUERPOS QB 4", loc: "PMPP" },
  { num: "119", desc: "M.ESP.REBAB-AGUJ.CUERPOS QB 4", loc: "PMPP" },
  { num: "125", desc: "SIERRA CIRCULAR CORTE PERFIL. ALU.", loc: "PMPP" },
  { num: "129", desc: "TORNO WAHLI", loc: "MATRICERIA" },
  { num: "130", desc: "E.D.M. ROBOFORM", loc: "MATRICERIA" },
  { num: "131", desc: "E.D.M. D1T", loc: "MATRICERIA" },
  { num: "136", desc: "TORNO PARALELO T-160", loc: "MATRICERIA" },
  { num: "139", desc: "ALESADORA", loc: "MATRICERIA" },
  { num: "142", desc: "FRESADORA FN 40", loc: "MATRICERIA" },
  { num: "143", desc: "FRESADORA FN 20", loc: "MATRICERIA" },
  { num: "144", desc: "RECTIFICADORA UNIV. RIDA", loc: "MATRICERIA" },
  { num: "146", desc: "CHAFLONADORA", loc: "MATRICERIA" },
  { num: "147", desc: "AFILADORA / DIAMANTADORA", loc: "MATRICERIA" },
  { num: "149", desc: "AFILADORA UNIVERSAL", loc: "MATRICERIA" },
  { num: "150", desc: "AFILADORA", loc: "MATRICERIA" },
  { num: "151", desc: "AGUJEREADORA DE BANCO", loc: "PMPP" },
  { num: "157", desc: "FRESADORA HORIZONTAL", loc: "MATRICERIA" },
  { num: "163", desc: "RECTIFICADORA PLANA", loc: "MATRICERIA" },
  { num: "170", desc: "AFILADORA MECHAS", loc: "PMPP" },
  { num: "174", desc: "CENTRO DE PERFORADO CNC SC-V8-822", loc: "PMPP" },
  { num: "176", desc: "M.ESP. ROSCADO CUERPOS QB1", loc: "PMPP" },
  { num: "184", desc: "ROTOFINISH MOD.SL04", loc: "PMPP" },
  { num: "185", desc: "MAQ. ESP. REBABADO CUERPOS QB1", loc: "PMPP" },
  { num: "188", desc: "INSTALACION PARA PINTURA", loc: "PMPP" },
  { num: "189", desc: "INSTALACION TRATAMIENTO TQS / LAVADORA", loc: "PMPP" },
  { num: "200", desc: "CENTRO DE MECANIZADO D1000", loc: "MATRICERIA" },
  { num: "206", desc: "PRENSA CLAVADO TUBO GUIA + TAPON PILOTO 32", loc: "PMPP" },
  { num: "208", desc: "TORNO CNC CAMPORESI TERRA 42T", loc: "PMPP" },
  { num: "210", desc: "TORNO CNC CAMPORESI TERRA 42T", loc: "PMPP" },
  { num: "211", desc: "CENTRO DE MECANIZADO ROMI D560", loc: "PMPP" },
  { num: "212", desc: "TORNO CNC ROMI GALAXI 20", loc: "PMPP" },
  { num: "214", desc: "CENTRO DE PERFORADO CNC MIYANO MTV-C310", loc: "PMPP" },
  { num: "215", desc: "TORNO CNC CAMPORESI TERRA 42T", loc: "PMPP" },
  { num: "216", desc: "CENTRO DE MECANIZADO TONG TAI TMV-510", loc: "PMPP" },
  { num: "217", desc: "TORNO CNC CAMPORESI TERRA 42T", loc: "PMPP" },
  { num: "218", desc: "TORNO CNC CAMPORESI TERRA 42T", loc: "PMPP" },
  { num: "220", desc: "TORNO CNC ROMI G 240", loc: "CILINDROS" },
  { num: "221", desc: "CENTRO MECANIZADO ROMI GALAXI 560", loc: "MATRICERIA" },
  { num: "230", desc: "TORNO CNC CAMPORESI AGRO 42 ATM", loc: "PMPP" },
  { num: "231", desc: "TORNO CNC CAMPORESI BAMBINO 32L", loc: "PMPP" },
  { num: "232", desc: "TORNO CNC ROMI G 240", loc: "PMPP" },
  { num: "233", desc: "TORNO CNC ROMI G260", loc: "PMPP" },
  { num: "234", desc: "CENTRO DE MECANIZADO ROMI D560", loc: "PMPP" },
  { num: "235", desc: "CENTRO DE MECANIZADO TONG TAI TMV-510", loc: "PMPP" },
  { num: "236", desc: "TORNO CNC BAMBINO 32LS", loc: "PMPP" },
  { num: "237", desc: "DESPUNTADORA DE BARRAS", loc: "PMPP" },
  { num: "239", desc: "CENTRO DE MECANIZADO HYUNDAI WIA KF4", loc: "PMPP" },
  { num: "240", desc: "TORNO CNC ROMI G260", loc: "PMPP" },
  { num: "241", desc: "TORNO CNC GEFONG G 206", loc: "PMPP" },
  { num: "242", desc: "LAVADORA DE TAMBOR", loc: "PMPP" },
  { num: "244", desc: "ROLADORA", loc: "PMPP" },
  { num: "245", desc: "FRESADORA", loc: "PMPP" },
  { num: "246", desc: "TORNO CNC TSUGAMI B0386 III HUSILLO MOVIL", loc: "PMPP" },
  { num: "247", desc: "TORNO CNC TSUGAMI B205 III HUSILLO MOVIL", loc: "PMPP" },
  { num: "248", desc: "TORNO CNC TSUGAMI B206 A II HUSILLO MOVIL", loc: "PMPP" },
  { num: "249", desc: "TORNO CNC TSUGAMI B206 A II HUSILLO MOVIL", loc: "PMPP" },
  { num: "250", desc: "ROMI GL 250 T", loc: "CILINDROS" },
  { num: "260", desc: "CENTRO MECANIZADO TSUGAMI VA3", loc: "MATRICERIA" },
  { num: "261", desc: "EDM HILO NOVICK AR-40", loc: "MATRICERIA" },
  { num: "262", desc: "EDM HILO NOVICK AR-40", loc: "MATRICERIA" },
  { num: "263", desc: "EDM PENETRACION NOVICK AF-50", loc: "MATRICERIA" },
  { num: "310", desc: "CENTRO DE MECANIZADO TONG TAI TMV-510", loc: "PMPP" },
  { num: "311", desc: "Maq.Esp.ROSCADO DE CUERPO FRL QB1", loc: "PMPP" },
  { num: "312", desc: "Maq.Esp.ROSCADO DE CUERPO FRL QB4", loc: "PMPP" },
  { num: "R1", desc: "ROBOT COLABORATIVO CO605 5 KG", loc: "PMPP" },
  { num: "R2", desc: "ROBOT COLABORATIVO CO605 5 KG", loc: "PMPP" },
  { num: "R3", desc: "ROBOT COLABORATIVO CR607 7 KG", loc: "PMPP" },
  { num: "R4", desc: "ROBOT COLABORATIVO CR607 7 KG", loc: "PMPP" },
  { num: "R5", desc: "ROBOT COLABORATIVO CO610 10 KG", loc: "PMPP" },
  { num: "R6", desc: "ROBOT COLABORATIVO CO610 10 KG", loc: "PMPP" }
];

// Invocar Webhook de Google Apps Script
export async function callApi(body: any) {
  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(body),
      redirect: "follow"
    });
    return await res.json();
  } catch (err) {
    console.error("API call error:", err);
    throw err;
  }
}

// Cargar instrumentos respetando APP_CONFIG.dataSourceMode
export async function fetchInstrumentos(): Promise<Instrumento[]> {
  const mode = APP_CONFIG.dataSourceMode;

  if (mode === "GOOGLE_SHEETS") {
    const res = await callApi({ accion: "getInstrumentos" });
    if (res.ok && res.data) return res.data;
    throw new Error(res.error || "Error al cargar instrumentos desde Google Sheets");
  }

  if (mode === "SUPABASE") {
    if (!supabase) {
      throw new Error("Modo SUPABASE forzado pero las credenciales (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) no están configuradas.");
    }
    const { data, error } = await supabase.from("instrumentos").select("*");
    if (error) throw new Error(`Error Supabase: ${error.message}`);
    return (data || []).map(item => ({
      c: item.codigo,
      n: item.nombre,
      s: item.sector,
      e: item.estado_calibracion
    }));
  }

  // MODO "AUTO": Intenta Supabase si existe, sino conmuta a Google Sheets
  if (supabase) {
    try {
      const { data, error } = await supabase.from("instrumentos").select("*");
      if (!error && data && data.length) {
        return data.map(item => ({
          c: item.codigo,
          n: item.nombre,
          s: item.sector,
          e: item.estado_calibracion
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch failed, falling back to GAS API:", e);
    }
  }

  const res = await callApi({ accion: "getInstrumentos" });
  if (res.ok && res.data) return res.data;
  throw new Error(res.error || "Error al cargar instrumentos");
}

// Cargar movimientos en uso actualmente
export async function fetchMovimientosEnUso(): Promise<Movimiento[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("movimientos")
        .select("*")
        .eq("estado", "EN USO")
        .order("fecha_retiro", { ascending: false });

      if (!error && data) {
        return data.map(row => {
          const leg = LEGAJOS.find(l => String(l.leg) === String(row.legajo_operario));
          return {
            id: String(row.id),
            codInstrumento: row.codigo_instrumento,
            instrumento: row.codigo_instrumento,
            legajo: row.legajo_operario,
            nombre: row.nombre_operario || (leg ? leg.nombre : String(row.legajo_operario)),
            sector: row.sector_operario || (leg ? leg.sector : ""),
            maquina: row.descripcion_maquina || "",
            fechaRetiro: row.fecha_retiro,
            horaRetiro: row.hora_retiro || "",
            estado: row.estado
          };
        });
      }
    } catch (e) {
      console.warn("Error loading in-use movements from Supabase:", e);
    }
  }

  try {
    const res = await callApi({ accion: "getEnUso" });
    if (res && res.ok && res.data) return res.data;
  } catch (e) {
    console.warn("Error fallback getEnUso:", e);
  }

  return [];
}

// Cargar historial de movimientos completo respetando APP_CONFIG.dataSourceMode
export async function fetchHistorialMovimientos(limit = 500): Promise<Movimiento[]> {
  const mode = APP_CONFIG.dataSourceMode;

  if (mode !== "GOOGLE_SHEETS" && supabase) {
    try {
      const { data, error } = await supabase
        .from("movimientos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!error && data) {
        return data.map(row => {
          const leg = LEGAJOS.find(l => String(l.leg) === String(row.legajo_operario));
          return {
            id: String(row.id),
            codInstrumento: row.codigo_instrumento,
            instrumento: row.codigo_instrumento,
            legajo: row.legajo_operario,
            nombre: row.nombre_operario || (leg ? leg.nombre : String(row.legajo_operario)),
            sector: row.sector_operario || (leg ? leg.sector : ""),
            maquina: row.descripcion_maquina || "",
            fechaRetiro: row.fecha_retiro || (row.created_at ? row.created_at.split("T")[0] : ""),
            horaRetiro: row.hora_retiro || "",
            fechaDevolucion: row.fecha_devolucion ? row.fecha_devolucion.split("T")[0] : undefined,
            horaDevolucion: row.hora_devolucion || undefined,
            estado: row.estado
          };
        });
      }
    } catch (e) {
      console.warn("Supabase fetchHistorialMovimientos error, fallback GAS:", e);
    }
  }

  try {
    const res = await callApi({ accion: "getHistorial" });
    if (res && res.ok && Array.isArray(res.data)) {
      return res.data;
    }
  } catch (e) {
    console.warn("GAS getHistorial fallback error:", e);
  }

  return [];
}

// Cargar listado de calibraciones respetando APP_CONFIG.dataSourceMode
export async function fetchVencimientosCalibracion(): Promise<VencimientoCalibracion[]> {
  const mode = APP_CONFIG.dataSourceMode;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (mode !== "GOOGLE_SHEETS" && supabase) {
    try {
      const { data, error } = await supabase
        .from("instrumentos")
        .select("codigo, nombre, sector, estado_calibracion, fecha_ultima_calibracion, fecha_vencimiento_calibracion, dias_hasta_vencimiento");

      if (!error && data && data.length) {
        return data.map(row => {
          const rawEstado = (row.estado_calibracion || "").toUpperCase();
          const vencStr = row.fecha_vencimiento_calibracion;
          const vencDate = vencStr ? new Date(vencStr) : null;
          
          let estado: "VENCIDO" | "POR VENCER" | "CALIBRADO" = "CALIBRADO";
          let diasRestantes: number | undefined = row.dias_hasta_vencimiento ?? undefined;

          if (rawEstado.includes("VENCID")) {
            estado = "VENCIDO";
          } else if (rawEstado.includes("PRÓXIM") || rawEstado.includes("PROXIM") || rawEstado.includes("POR VENCER")) {
            estado = "POR VENCER";
          } else if (vencDate && !isNaN(vencDate.getTime())) {
            const diffMs = vencDate.getTime() - hoy.getTime();
            diasRestantes = Math.ceil(diffMs / 86400000);
            if (diasRestantes < 0) estado = "VENCIDO";
            else if (diasRestantes <= 60) estado = "POR VENCER";
            else estado = "CALIBRADO";
          }

          let vencimientoDisplay = "Vigente";
          if (vencDate && !isNaN(vencDate.getTime())) {
            vencimientoDisplay = vencDate.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
          } else if (estado === "VENCIDO") {
            vencimientoDisplay = "Vencido";
          } else if (estado === "POR VENCER") {
            vencimientoDisplay = typeof diasRestantes === "number" ? `Vence en ${diasRestantes} días` : "Próximo a calibrar";
          }

          return {
            codigo: row.codigo,
            instrumento: row.nombre,
            sector: row.sector || "",
            calibrado: row.fecha_ultima_calibracion || "Sin fecha reg.",
            vencimiento: vencimientoDisplay,
            estado,
            diasRestantes
          };
        });
      }
    } catch (e) {
      console.warn("Supabase fetchVencimientos error, fallback GAS:", e);
    }
  }

  // Fallback Google Sheets
  try {
    const res = await callApi({ accion: "getVencimientos" });
    if (res && res.ok && Array.isArray(res.data)) {
      return res.data.map((item: any) => ({
        codigo: item.codigo,
        instrumento: item.instrumento,
        sector: item.sector || "",
        calibrado: item.calibrado || "Sin fecha reg.",
        vencimiento: item.vencimiento || (item.estado === "VENCIDO" ? "Vencido" : "Próximo a calibrar"),
        estado: item.estado || "CALIBRADO",
        diasRestantes: item.diasRestantes
      }));
    }
  } catch (e) {
    console.warn("GAS getVencimientos fallback error:", e);
  }

  return [];
}

// Cargar nómina de PINs de operarios respetando APP_CONFIG.dataSourceMode
export async function fetchPinesOperarios(): Promise<PinRegistro[]> {
  const mode = APP_CONFIG.dataSourceMode;

  if (mode !== "GOOGLE_SHEETS" && supabase) {
    try {
      const { data, error } = await supabase
        .from("pines_operarios")
        .select("*")
        .order("legajo");

      if (!error && data) {
        return data.map(row => ({
          legajo: row.legajo,
          bloqueado: Boolean(row.bloqueado),
          intentos: row.intentos_fallidos || 0,
          fechaAlta: row.created_at
            ? new Date(row.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
            : undefined,
          ultimoUso: row.ultimo_uso
            ? new Date(row.ultimo_uso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
            : undefined
        }));
      }
    } catch (e) {
      console.warn("Supabase fetchPinesOperarios error, fallback GAS/LocalStorage:", e);
    }
  }

  try {
    const res = await callApi({ accion: "getPines" });
    if (res && res.ok && Array.isArray(res.data)) {
      return res.data;
    }
  } catch (e) {
    console.warn("GAS getPines fallback error:", e);
  }

  return [];
}

// Blanquear PIN de operario respetando APP_CONFIG.dataSourceMode
export async function blanquearPinOperario(legajo: number): Promise<{ ok: boolean; error?: string }> {
  // Limpiar cualquier residuo previo en localStorage
  try {
    localStorage.removeItem(`pin_${legajo}`);
  } catch (_) {}

  // 1. Supabase
  if (supabase) {
    try {
      const { error } = await supabase
        .from("pines_operarios")
        .update({ bloqueado: false, intentos_fallidos: 0 })
        .eq("legajo", legajo);

      if (!error) return { ok: true };
      return { ok: false, error: error.message };
    } catch (e: any) {
      console.warn("Supabase blanquearPin error:", e);
      return { ok: false, error: e.message || "Error al blanquear PIN en Supabase" };
    }
  }

  return { ok: false, error: "Base de datos Supabase no configurada." };
}

// Asignar / Cambiar PIN de operario respetando APP_CONFIG.dataSourceMode
export async function guardarPinOperario(legajo: number, pin: string): Promise<{ ok: boolean; error?: string }> {
  return await setPin(legajo, pin);
}

// Verificar disponibilidad respetando APP_CONFIG.dataSourceMode
export async function verificarDisponibilidad(cod: string) {
  const mode = APP_CONFIG.dataSourceMode;

  if (mode !== "GOOGLE_SHEETS" && supabase) {
    try {
      const { data, error } = await supabase
        .from("movimientos")
        .select("*")
        .eq("codigo_instrumento", cod)
        .eq("estado", "EN USO")
        .maybeSingle();

      if (!error) {
        if (!data) return { disponible: true };
        return {
          disponible: false,
          legajo: data.legajo_operario,
          nombre: data.nombre_operario || "",
          fechaRetiro: data.fecha_retiro,
          horaRetiro: data.hora_retiro || "",
          maquina: data.descripcion_maquina || ""
        };
      }
    } catch (e) {
      console.warn("Supabase disp check failed:", e);
    }
  }

  return await callApi({ accion: "verificarDisponibilidad", codInstrumento: cod });
}

// Estado PIN respetando APP_CONFIG.dataSourceMode
export async function getPinEstado(legajo: number) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("pines_operarios")
        .select("*")
        .eq("legajo", legajo)
        .maybeSingle();

      if (!error && data) {
        return { ok: true, existe: true, bloqueado: Boolean(data.bloqueado) };
      } else if (!error && !data) {
        return { ok: true, existe: false, bloqueado: false };
      }
    } catch (e) {
      console.warn("Supabase PIN check failed:", e);
    }
  }

  return await callApi({ accion: "getPinEstado", legajo });
}

// Set PIN respetando APP_CONFIG.dataSourceMode (escritura exclusiva en Supabase)
export async function setPin(legajo: number, pin: string) {
  // Limpiar cualquier residuo en localStorage
  try {
    localStorage.removeItem(`pin_${legajo}`);
  } catch (_) {}

  if (supabase) {
    try {
      const { error } = await supabase.from("pines_operarios").upsert({
        legajo,
        pin_hash: btoa(pin),
        bloqueado: false,
        intentos_fallidos: 0,
        ultimo_uso: new Date().toISOString()
      });
      if (!error) return { ok: true };
      throw new Error(error.message);
    } catch (e: any) {
      console.warn("Supabase setPin failed:", e);
      throw e;
    }
  }

  return { ok: true };
}

// Validar PIN respetando APP_CONFIG.dataSourceMode
export async function validarPin(legajo: number, pin: string) {
  const pinB64 = btoa(pin);

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("pines_operarios")
        .select("*")
        .eq("legajo", legajo)
        .maybeSingle();

      if (!error && data) {
        if (data.bloqueado) {
          return { ok: false, bloqueado: true };
        }

        if (data.pin_hash === pinB64) {
          // PIN Correcto
          await supabase.from("pines_operarios").update({
            intentos_fallidos: 0,
            ultimo_uso: new Date().toISOString()
          }).eq("legajo", legajo);

          return { ok: true };
        } else {
          // PIN Incorrecto -> Incrementar intentos en Supabase
          const nuevosIntentos = (data.intentos_fallidos || 0) + 1;
          const estaBloqueado = nuevosIntentos >= 3;

          await supabase.from("pines_operarios").update({
            intentos_fallidos: nuevosIntentos,
            bloqueado: estaBloqueado
          }).eq("legajo", legajo);

          if (estaBloqueado) {
            return { ok: false, bloqueado: true };
          }
          return { ok: false, restantes: 3 - nuevosIntentos };
        }
      }
    } catch (e) {
      console.warn("Error validando PIN en Supabase:", e);
    }
  }

  return await callApi({ accion: "validarPin", legajo, pin });
}

// Registrar Retiro (escritura exclusiva en Supabase, Google Sheets es solo lectura)
export async function registrarRetiro(data: { legajo: number; nombre: string; sector: string; codInstrumento: string; instrumento: string; maquina: string }) {
  const now = new Date();
  
  // Zona horaria de Buenos Aires, Argentina
  const fechaISO = now.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }); // YYYY-MM-DD
  const hora = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "America/Argentina/Buenos_Aires" });
  const fechaDisplay = now.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Argentina/Buenos_Aires" });

  if (supabase) {
    const { error } = await supabase.from("movimientos").insert({
      codigo_instrumento: data.codInstrumento,
      legajo_operario: data.legajo,
      nombre_operario: data.nombre,
      sector_operario: data.sector,
      descripcion_maquina: data.maquina,
      fecha_retiro: fechaISO,
      hora_retiro: hora,
      estado: "EN USO"
    });

    if (error) {
      console.error("Error registrando retiro en Supabase:", error);
      throw new Error(`Error al registrar retiro en Supabase: ${error.message}`);
    }
  }

  return { ok: true, fecha: fechaDisplay, hora };
}

// Registrar Devolución (escritura exclusiva en Supabase, Google Sheets es solo lectura)
export async function registrarDevolucion(codInstrumento: string) {
  const now = new Date();
  
  // Zona horaria de Buenos Aires, Argentina
  const fechaISO = now.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }); // YYYY-MM-DD
  const hora = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "America/Argentina/Buenos_Aires" });
  const fechaDisplay = now.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Argentina/Buenos_Aires" });

  if (supabase) {
    const { error } = await supabase
      .from("movimientos")
      .update({
        estado: "DEVUELTO",
        fecha_devolucion: fechaISO,
        hora_devolucion: hora
      })
      .eq("codigo_instrumento", codInstrumento)
      .eq("estado", "EN USO");

    if (error) {
      console.error("Error registrando devolución en Supabase:", error);
      throw new Error(`Error al registrar devolución en Supabase: ${error.message}`);
    }
  }

  return { ok: true, fecha: fechaDisplay, hora };
}
