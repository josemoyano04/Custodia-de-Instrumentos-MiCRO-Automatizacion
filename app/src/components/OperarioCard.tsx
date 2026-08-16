import React, { useState, useEffect } from "react";
import type { Operario } from "../types";

interface OperarioCardProps {
  legajos: Operario[];
  operarioSeleccionado: Operario | null;
  onSeleccionarOperario: (operario: Operario | null) => void;
}

export const OperarioCard: React.FC<OperarioCardProps> = ({
  legajos,
  operarioSeleccionado,
  onSeleccionarOperario
}) => {
  const [legajoInput, setLegajoInput] = useState<string>("");
  const [errorNotFound, setErrorNotFound] = useState<boolean>(false);

  useEffect(() => {
    if (!operarioSeleccionado) {
      setLegajoInput("");
      setErrorNotFound(false);
    } else {
      setLegajoInput(String(operarioSeleccionado.leg));
    }
  }, [operarioSeleccionado]);

  const handleInput = (val: string) => {
    setLegajoInput(val);
    if (!val.trim()) {
      onSeleccionarOperario(null);
      setErrorNotFound(false);
      return;
    }
    const legNum = parseInt(val.trim());
    const op = legajos.find(x => x.leg === legNum);
    if (op) {
      onSeleccionarOperario(op);
      setErrorNotFound(false);
    } else {
      onSeleccionarOperario(null);
      setErrorNotFound(true);
    }
  };

  const handleDeselect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSeleccionarOperario(null);
    setLegajoInput("");
    setErrorNotFound(false);
  };

  return (
    <div className="card">
      <div className="ctop"></div>
      <div className="cbody" style={{ position: "relative" }}>
        <div className="clabel">Operario</div>

        {/* Si hay operario seleccionado, la tarjeta reemplaza al input */}
        {operarioSeleccionado ? (
          <div className="pbadge" style={{ display: "flex", alignItems: "center", paddingRight: "38px" }}>
            <div className="pavatar">
              {operarioSeleccionado.nombre.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
              <div className="pnombre" style={{ wordBreak: "break-word", lineHeight: 1.25 }}>
                {operarioSeleccionado.nombre}
              </div>
              <div className="psector">
                Leg. {operarioSeleccionado.leg} · {operarioSeleccionado.sector}
              </div>
            </div>

            {/* Botón X rojo para deseleccionar */}
            <button
              type="button"
              className="btn-deselect-op"
              onClick={handleDeselect}
              title="Cambiar u otra persona"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="acwrap" style={{ position: "relative" }}>
            <input
              id="inp-leg"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Nro de legajo (ej. 285)…"
              value={legajoInput}
              onChange={(e) => handleInput(e.target.value.replace(/\D/g, ""))}
              autoFocus
            />
          </div>
        )}

        {errorNotFound && !operarioSeleccionado && (
          <div className="alert warn" style={{ display: "block" }}>
            Legajo no encontrado.
          </div>
        )}
      </div>
    </div>
  );
};
