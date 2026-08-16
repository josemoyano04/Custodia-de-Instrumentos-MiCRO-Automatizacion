import React from "react";
import type { Operario, InstrumentoSeleccionado, Maquina } from "../types";
import { APP_CONFIG } from "../config/appConfig";

interface ConfirmModalProps {
  isOpen: boolean;
  tipo: "RET" | "DEV" | null;
  operario: Operario | null;
  carrito: InstrumentoSeleccionado[];
  maquina: Maquina | null;
  saving: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  tipo,
  operario,
  carrito,
  maquina,
  saving,
  onConfirmar,
  onCancelar
}) => {
  if (!isOpen || !tipo || !operario || !carrito.length) return null;

  // Instrumentos con calibración vencida dentro del lote
  const vencidos = carrito.filter(item => item._calibVenc);
  const hayVencidos = vencidos.length > 0;

  // Si allowRetiroVencido está desactivado, bloquear el retiro
  const bloqueado = tipo === "RET" && hayVencidos && !APP_CONFIG.allowRetiroVencido;

  return (
    <div className={`modal-bg ${isOpen ? "open" : ""}`} style={{ display: isOpen ? "flex" : "none" }}>
      <div className="modal-box" style={{ maxWidth: "440px" }}>
        <div className="modal-tit">
          {tipo === "RET"
            ? `↑ Confirmar retiro (${carrito.length} ${carrito.length === 1 ? "instrumento" : "instrumentos"})`
            : `↓ Confirmar devolución (${carrito.length} ${carrito.length === 1 ? "instrumento" : "instrumentos"})`}
        </div>
        <div className="modal-bod">
          <div style={{ marginBottom: "12px" }}>
            <strong>{operario.nombre}</strong> (Leg. {operario.leg})<br />
            {tipo === "RET" ? "va a retirar los siguientes instrumentos:" : "va a devolver los siguientes instrumentos:"}
          </div>

          <div className="confirm-batch-list">
            {carrito.map((item) => (
              <div key={item.cod} className="confirm-batch-item">
                <span className="mono" style={{ color: "var(--blue)", fontWeight: 700 }}>
                  {item.cod}
                </span>
                <span style={{ fontSize: "12px", fontWeight: 600 }}>
                  {item.nom}
                  {item._calibVenc && (
                    <span style={{ marginLeft: "6px", fontSize: "10px", color: "var(--warn)", fontWeight: 800 }}>
                      ⛔ VENCIDO
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Advertencia visible cuando hay instrumentos vencidos en un retiro */}
          {tipo === "RET" && hayVencidos && (
            <div style={{
              marginTop: "12px",
              padding: "10px 12px",
              borderRadius: "9px",
              background: bloqueado ? "var(--warn-bg)" : "#fff7ed",
              border: `1.5px solid ${bloqueado ? "var(--warn-br)" : "#f59e0b"}`,
              fontSize: "12px",
              fontWeight: 700,
              color: bloqueado ? "var(--warn)" : "#92400e",
              lineHeight: 1.5
            }}>
              {bloqueado ? (
                <>
                  ⛔ <strong>Retiro bloqueado.</strong><br />
                  Hay {vencidos.length} instrumento{vencidos.length > 1 ? "s" : ""} con calibración vencida en el lote.
                  Retirá los instrumentos vencidos de la lista para continuar.
                </>
              ) : (
                <>
                  ⚠️ <strong>Advertencia:</strong> {vencidos.length} instrumento{vencidos.length > 1 ? "s" : ""} de este lote
                  {vencidos.length === 1 ? " tiene" : " tienen"} la calibración vencida.<br />
                  Notificar al dpto. de Control de Calidad para su regulación.
                </>
              )}
            </div>
          )}

          {tipo === "RET" && maquina && (
            <div style={{ marginTop: "12px", fontSize: "12px", background: "var(--info-bg)", padding: "8px 10px", borderRadius: "8px" }}>
              Destino: Máquina <strong>{maquina.num}</strong> – {maquina.desc}
            </div>
          )}
        </div>

        <div className="modal-btns">
          <button className="btn btn-ghost" onClick={onCancelar} disabled={saving}>
            Cancelar
          </button>
          <button
            className={`btn ${tipo === "RET" ? "btn-ret" : "btn-dev"}`}
            disabled={saving || bloqueado}
            onClick={onConfirmar}
          >
            {saving ? (
              <>
                <span className="spinner-btn"></span>Guardando lote…
              </>
            ) : tipo === "RET" ? (
              `↑ Confirmar ${carrito.length}`
            ) : (
              `↓ Confirmar ${carrito.length}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
