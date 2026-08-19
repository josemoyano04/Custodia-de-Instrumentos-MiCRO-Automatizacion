import React, { useState } from "react";
import type { OperarioHabilitado } from "../../../types";
import { LEGAJOS } from "../../../services/dataService";

interface ModalAltaOperarioProps {
  isOpen: boolean;
  operariosList: OperarioHabilitado[];
  saving: boolean;
  onGuardar: (legajo: number, nombre: string, sector: string) => void;
  onClose: () => void;
}

export const ModalAltaOperario: React.FC<ModalAltaOperarioProps> = ({
  isOpen,
  operariosList,
  saving,
  onGuardar,
  onClose
}) => {
  const [nuevoOpLegajo, setNuevoOpLegajo] = useState<string>("");

  if (!isOpen) return null;

  const legNum = parseInt(nuevoOpLegajo.trim(), 10);
  const opEncontrado = !isNaN(legNum) ? LEGAJOS.find(l => l.leg === legNum) : null;
  const yaEnPadron = !isNaN(legNum) ? operariosList.find(o => o.legajo === legNum) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opEncontrado) return;
    onGuardar(opEncontrado.leg, opEncontrado.nombre, opEncontrado.sector);
  };

  return (
    <div className="modal-bg open" style={{ display: "flex" }}>
      <div className="modal-box" style={{ maxWidth: "420px" }}>
        <div className="modal-tit">👤 Alta de Operario Habilitado</div>
        <form onSubmit={handleSubmit}>
          <div className="modal-bod">
            <p style={{ marginBottom: "14px", fontSize: "12.5px", color: "var(--soft)" }}>
              Ingresá el número de legajo del operario para buscarlo en la nómina maestra y habilitarlo para retirar instrumentos.
            </p>

            <div className="field" style={{ marginBottom: "12px" }}>
              <label>Número de Legajo</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ej. 175, 405, 516…"
                value={nuevoOpLegajo}
                onChange={(e) => setNuevoOpLegajo(e.target.value.replace(/\D/g, ""))}
                required
                autoFocus
              />
            </div>

            {/* Previsualización del operario según LEGAJOS */}
            {nuevoOpLegajo.trim() && !isNaN(legNum) && (
              <>
                {opEncontrado ? (
                  <div
                    style={{
                      background: "var(--surface)",
                      border: "1.5px solid var(--border)",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      marginBottom: "14px"
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--blue-d)", marginBottom: "4px" }}>
                      ✓ OPERARIO ENCONTRADO EN NÓMINA:
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text)" }}>
                      {opEncontrado.nombre}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--soft)", marginTop: "2px" }}>
                      Sector: <strong>{opEncontrado.sector}</strong> · Legajo: <strong>{opEncontrado.leg}</strong>
                    </div>
                    {yaEnPadron && (
                      <div style={{ fontSize: "11.5px", color: "var(--warn)", fontWeight: 700, marginTop: "8px" }}>
                        ⚠️ Este operario ya figura en el padrón ({yaEnPadron.habilitado ? "HABILITADO" : "INHABILITADO"}).
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      background: "rgba(220, 38, 38, 0.08)",
                      border: "1.5px solid var(--red)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      marginBottom: "14px",
                      fontSize: "12px",
                      color: "var(--red)"
                    }}
                  >
                    ❌ El legajo <strong>{nuevoOpLegajo}</strong> no existe en la nómina maestra de operarios.
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal-btns">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-ret"
              disabled={saving || !opEncontrado}
            >
              {saving ? (
                <>
                  <span className="spinner-btn"></span>Guardando…
                </>
              ) : (
                "Habilitar Operario"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
