import React, { useState, useEffect } from "react";
import type { OperarioHabilitado } from "../../../types";

interface ModalAsignarPinProps {
  isOpen: boolean;
  targetLegajo: string;
  operariosList: OperarioHabilitado[];
  saving: boolean;
  onGuardar: (legajo: number, pin: string) => void;
  onClose: () => void;
}

export const ModalAsignarPin: React.FC<ModalAsignarPinProps> = ({
  isOpen,
  targetLegajo: initialLegajo,
  operariosList,
  saving,
  onGuardar,
  onClose
}) => {
  const [legajo, setLegajo] = useState<string>("");
  const [pinVal, setPinVal] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setLegajo(initialLegajo);
      setPinVal("");
    }
  }, [isOpen, initialLegajo]);

  if (!isOpen) return null;

  const legNum = parseInt(legajo.trim(), 10);
  const opInfo = operariosList.find(x => x.legajo === legNum) || null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!legNum || pinVal.length !== 4) return;
    onGuardar(legNum, pinVal);
  };

  return (
    <div className="modal-bg open" style={{ display: "flex" }}>
      <div className="modal-box" style={{ maxWidth: "380px" }}>
        <div className="modal-tit">🔑 Asignar o Cambiar PIN</div>
        <form onSubmit={handleSubmit}>
          <div className="modal-bod">
            <p style={{ marginBottom: "14px", fontSize: "12.5px", color: "var(--soft)" }}>
              Ingresá el número de legajo y el nuevo código PIN numérico de 4 dígitos.
            </p>
            <div className="field" style={{ marginBottom: "12px" }}>
              <label>Legajo del Operario</label>
              <input
                type="text"
                placeholder="Ej. 175"
                value={legajo}
                onChange={(e) => setLegajo(e.target.value)}
                required
                autoFocus={!initialLegajo}
              />
            </div>
            {opInfo && (
              <div style={{ fontSize: "12px", color: "var(--blue)", marginBottom: "12px", fontWeight: 700 }}>
                ✓ {opInfo.nombre} ({opInfo.sector})
              </div>
            )}
            <div className="field" style={{ marginBottom: "12px" }}>
              <label>Nuevo PIN (4 dígitos)</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={pinVal}
                onChange={(e) => setPinVal(e.target.value.replace(/\D/g, ""))}
                required
                autoFocus={Boolean(initialLegajo)}
              />
            </div>
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
              disabled={saving || !legajo || pinVal.length !== 4}
            >
              {saving ? (
                <>
                  <span className="spinner-btn"></span>Guardando…
                </>
              ) : (
                "Guardar PIN"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
