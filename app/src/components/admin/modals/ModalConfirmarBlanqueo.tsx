import React from "react";

interface ModalConfirmarBlanqueoProps {
  isOpen: boolean;
  legajo: number | null;
  operarioNombre?: string;
  loading: boolean;
  onConfirmar: (legajo: number) => void;
  onClose: () => void;
}

export const ModalConfirmarBlanqueo: React.FC<ModalConfirmarBlanqueoProps> = ({
  isOpen,
  legajo,
  operarioNombre,
  loading,
  onConfirmar,
  onClose
}) => {
  if (!isOpen || legajo === null) return null;

  return (
    <div className="modal-bg open" style={{ display: "flex" }}>
      <div className="modal-box" style={{ maxWidth: "380px" }}>
        <div className="modal-tit">⚠️ Confirmar Blanqueo de PIN</div>
        <div className="modal-bod">
          <p style={{ fontSize: "13px", lineHeight: "1.45" }}>
            ¿Estás seguro de que deseas blanquear y desbloquear el PIN del operario{" "}
            <strong>{operarioNombre || `Legajo ${legajo}`}</strong>?
          </p>
          <p style={{ fontSize: "12px", color: "var(--soft)", marginTop: "8px" }}>
            Esto restablecerá los intentos fallidos a 0 y quitará el bloqueo de seguridad.
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
            className="btn btn-ret"
            disabled={loading}
            onClick={() => onConfirmar(legajo)}
          >
            {loading ? (
              <>
                <span className="spinner-btn"></span>Blanqueando…
              </>
            ) : (
              "Confirmar Blanqueo"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
