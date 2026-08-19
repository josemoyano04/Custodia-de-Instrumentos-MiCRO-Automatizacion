import React from "react";
import type { OperarioHabilitado } from "../../../types";

interface ModalConfirmarEliminarOpProps {
  isOpen: boolean;
  operario: OperarioHabilitado | null;
  loading: boolean;
  onConfirmar: (op: OperarioHabilitado) => void;
  onClose: () => void;
}

export const ModalConfirmarEliminarOp: React.FC<ModalConfirmarEliminarOpProps> = ({
  isOpen,
  operario,
  loading,
  onConfirmar,
  onClose
}) => {
  if (!isOpen || !operario) return null;

  return (
    <div className="modal-bg open" style={{ display: "flex" }}>
      <div className="modal-box" style={{ maxWidth: "380px" }}>
        <div className="modal-tit" style={{ color: "var(--red)" }}>
          🗑️ Eliminar Operario del Padrón
        </div>
        <div className="modal-bod">
          <p style={{ fontSize: "13px", lineHeight: "1.45" }}>
            ¿Estás seguro de que deseas eliminar a{" "}
            <strong>{operario.nombre}</strong> (Legajo {operario.legajo}) del padrón de operarios habilitados?
          </p>
          <p style={{ fontSize: "12px", color: "var(--red)", marginTop: "8px", fontWeight: 600 }}>
            ⚠️ Esta acción también eliminará su clave PIN asignada y le impedirá retirar instrumentos.
          </p>
        </div>
        <div className="modal-btns">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn"
            style={{ background: "var(--red)", color: "#fff", borderColor: "var(--red)" }}
            disabled={loading}
            onClick={() => onConfirmar(operario)}
          >
            {loading ? (
              <>
                <span className="spinner-btn"></span>Eliminando…
              </>
            ) : (
              "Eliminar Definitivamente"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
