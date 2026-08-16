import React, { useState, useEffect } from "react";
import type { Operario, InstrumentoSeleccionado, Maquina } from "../types";
import type { ModoOperacion } from "./ModeSelector";

interface ActionButtonsProps {
  modo?: ModoOperacion;
  operario: Operario | null;
  carrito: InstrumentoSeleccionado[];
  maquina: Maquina | null;
  onConfirmar: (tipo: "RET" | "DEV") => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  modo = "retiro",
  operario,
  carrito,
  maquina,
  onConfirmar
}) => {
  const count = carrito.length;
  const [bloqMsg, setBloqMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!bloqMsg) return;
    const t = setTimeout(() => setBloqMsg(null), 3000);
    return () => clearTimeout(t);
  }, [bloqMsg]);

  // ── Condiciones ──────────────────────────────────────────────────────────
  const todosDisponibles = count > 0 && carrito.every(i => i._enUso === false);
  const disableRetirar   = !(operario && todosDisponibles && maquina !== null);

  // En devolución: si hay items en carrito marcados para devolver (_enUso !== false)
  const todosParaDevolver = count > 0 && carrito.every(i => i._enUso !== false);
  const disableDevolver   = !todosParaDevolver;

  // ── Motivos resumidos ────────────────────────────────────────────────────
  const getMotivoRetirar = (): string => {
    if (!operario)                               return "Seleccioná un operario";
    if (count === 0)                             return "Lista de selección vacía";
    if (carrito.some(i => i._enUso === undefined)) return "Verificando disponibilidad…";
    if (carrito.some(i => i._enUso === "otro"))  return "Instrumento retirado por otro operario";
    if (carrito.some(i => i._enUso === true))    return "Instrumento ya retirado — usá Devolver";
    if (!maquina)                                return "Seleccioná la máquina de destino";
    return "";
  };

  const getMotivoDevolver = (): string => {
    if (count === 0)                             return "No seleccionaste instrumentos para devolver";
    if (carrito.some(i => i._enUso === false))   return "Uno o más instrumentos ya están disponibles";
    return "";
  };

  const handleClickRetirar = () => {
    if (disableRetirar) { setBloqMsg(getMotivoRetirar()); return; }
    setBloqMsg(null);
    onConfirmar("RET");
  };

  const handleClickDevolver = () => {
    if (disableDevolver) { setBloqMsg(getMotivoDevolver()); return; }
    setBloqMsg(null);
    onConfirmar("DEV");
  };

  return (
    <div className="floating-action-bar">
      {bloqMsg && (
        <div className="fab-bloq-msg">{bloqMsg}</div>
      )}

      {modo === "retiro" ? (
        <button
          className={`btn btn-ret${disableRetirar ? " fab-disabled" : ""}`}
          onClick={handleClickRetirar}
        >
          <svg viewBox="0 0 24 24">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
          {count > 1 ? `↑ Retirar (${count})` : "↑ Retirar"}
        </button>
      ) : (
        <button
          className={`btn btn-dev${disableDevolver ? " fab-disabled" : ""}`}
          onClick={handleClickDevolver}
        >
          <svg viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
          {count > 1 ? `↓ Devolver (${count})` : "↓ Devolver"}
        </button>
      )}
    </div>
  );
};
