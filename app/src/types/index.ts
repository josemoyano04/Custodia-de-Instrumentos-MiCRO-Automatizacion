export interface Operario {
  leg: number;
  nombre: string;
  sector: string;
}

export interface Instrumento {
  c: string; // Código
  n: string; // Nombre / Descripción
  s: string; // Sector
  e: string; // Estado de calibración: CALIBRADO, POR VENCER, VENCIDO, NO APLICA, etc.
}

export interface InstrumentoSeleccionado {
  cod: string;
  nom: string;
  sec: string;
  est: string;
  _enUso?: boolean | string; // false = disponible, true = retirado por el operario actual, "otro" = retirado por otro
  _calibVenc?: boolean;
  _quienRetiro?: {
    legajo: number;
    nombre?: string;
    maquina?: string;
  };
}

export interface Maquina {
  num: string;
  desc: string;
  loc: string;
}

export interface Movimiento {
  id?: string;
  codInstrumento: string;
  instrumento: string;
  legajo: number;
  nombre: string;
  sector: string;
  maquina?: string;
  fechaRetiro: string;
  horaRetiro: string;
  fechaDevolucion?: string;
  horaDevolucion?: string;
  estado: "EN USO" | "DEVUELTO";
}

export interface VencimientoCalibracion {
  codigo: string;
  instrumento: string;
  sector: string;
  calibrado: string;
  vencimiento: string;
  estado: "VENCIDO" | "POR VENCER" | "CALIBRADO";
  diasRestantes?: number;

}

export interface PinRegistro {
  legajo: number;
  pin_hash?: string;
  bloqueado: boolean;
  intentos?: number;
  fechaAlta?: string;
  ultimoUso?: string;
}

export type VistaActual = "op" | "adm";

