import React, { useEffect } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  mensaje: string;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  mensaje,
  onClose
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // 1. Auto-cierre a los 2 segundos
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    // 2. Cierre inmediato al presionar cualquier tecla
    const handleKeyDown = () => {
      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-bg open"
      style={{ display: "flex", cursor: "pointer" }}
      onClick={onClose}
      title="Hacé click en cualquier parte o presioná cualquier tecla para cerrar"
    >
      <div
        className="modal-box success-modal-box"
        onClick={() => {
          onClose();
        }}
      >
        <div className="success-icon-wrap">
          <svg viewBox="0 0 24 24" width="36" height="36">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div className="success-tit">{mensaje}</div>
        <div className="success-sub">Actualizando datos · Tocá para continuar</div>
      </div>
    </div>
  );
};
