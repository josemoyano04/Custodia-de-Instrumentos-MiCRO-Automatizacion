import React from "react";

export type ModoOperacion = "retiro" | "devolucion";

interface ModeSelectorProps {
  modoActual: ModoOperacion;
  onCambiarModo: (modo: ModoOperacion) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ modoActual, onCambiarModo }) => {
  return (
    <div className="card mode-card">
      <div className="mode-btn-container">
        <button
          type="button"
          className={`mode-btn ${modoActual === "retiro" ? "active-retiro" : ""}`}
          onClick={() => onCambiarModo("retiro")}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
          Retiro
        </button>

        <button
          type="button"
          className={`mode-btn ${modoActual === "devolucion" ? "active-devolucion" : ""}`}
          onClick={() => onCambiarModo("devolucion")}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
          Devolución
        </button>
      </div>
    </div>
  );
};
