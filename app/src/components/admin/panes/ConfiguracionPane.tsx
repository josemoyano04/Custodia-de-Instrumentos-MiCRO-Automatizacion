import React, { useState } from "react";
import { getAllowRetiroVencido, setAllowRetiroVencido } from "../../../config/appConfig";

export const ConfiguracionPane: React.FC = () => {
  const [allowVencido, setAllowVencido] = useState<boolean>(getAllowRetiroVencido());
  const [msg, setMsg] = useState<string | null>(null);

  const handleToggleVencido = () => {
    const nuevoValor = !allowVencido;
    setAllowVencido(nuevoValor);
    setAllowRetiroVencido(nuevoValor);
    setMsg(
      nuevoValor
        ? "⚠️ Ajuste guardado: Ahora se PERMITE el retiro de instrumentos vencidos con advertencia."
        : "✓ Ajuste guardado: Modo ESTRICTO activado. Se BLOQUEAN los retiros de instrumentos vencidos."
    );
    setTimeout(() => setMsg(null), 5000);
  };

  return (
    <div className="adm-pane on" style={{ width: "100%" }}>
      {msg && (
        <div
          className={`alert ${allowVencido ? "warn" : "ok"}`}
          style={{ display: "block", marginBottom: "16px", fontSize: "13px" }}
        >
          {msg}
        </div>
      )}

      {/* SECCIÓN 1: POLÍTICAS DE METROLOGÍA Y CALIDAD */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="ctop"></div>
        <div className="cbody" style={{ padding: "20px" }}>
          <div className="clabel" style={{ fontSize: "14px", marginBottom: "12px" }}>
            Comportamiento de Instrumentos Vencidos
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
              gap: "20px",
              padding: "16px",
              background: "var(--surface)",
              border: "1.5px solid var(--border)",
              borderRadius: "10px"
            }}
          >
            <div style={{ flex: 1, minWidth: "260px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text)", marginBottom: "4px" }}>
                Retiro de Instrumentos Vencidos
              </div>
              <p style={{ fontSize: "12px", color: "var(--soft)", margin: 0, lineHeight: 1.45 }}>
                Define si el personal de planta puede retirar instrumentos cuya fecha de calibración periódica haya expirado.
              </p>

              <div style={{ marginTop: "12px" }}>
                {allowVencido ? (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "rgba(245, 158, 11, 0.12)",
                      border: "1px solid rgba(245, 158, 11, 0.4)",
                      color: "var(--warn)",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 800
                    }}
                  >
                    ⚠️ MODO PERMISIVO HABILITADO
                  </div>
                ) : (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "rgba(0, 150, 87, 0.12)",
                      border: "1px solid rgba(0, 150, 87, 0.4)",
                      color: "var(--green)",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 800
                    }}
                  >
                    ⛔ MODO ESTRICTO (BLOQUEO ACTIVO)
                  </div>
                )}
              </div>
            </div>

            {/* BOTÓN CONMUTADOR */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
              <button
                type="button"
                className={`btn ${allowVencido ? "btn-dev" : "btn-ret"}`}
                style={{
                  height: "40px",
                  padding: "0 18px",
                  fontSize: "12.5px",
                  fontWeight: 800
                }}
                onClick={handleToggleVencido}
              >
                {allowVencido ? "Desactivar Permiso (Bloquear)" : "Permitir Retiros Vencidos"}
              </button>
              <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                {allowVencido ? "Click para pasar a modo estricto" : "Click para permitir temporalmente"}
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: "14px",
              padding: "12px 14px",
              borderRadius: "8px",
              background: allowVencido ? "var(--warn-bg)" : "var(--surface-hover)",
              border: `1px solid ${allowVencido ? "var(--warn-br)" : "var(--border)"}`,
              fontSize: "12px",
              color: "var(--text)",
              lineHeight: 1.5
            }}
          >
            {allowVencido ? (
              <>
                <strong>Comportamiento en Operación:</strong> Al intentar retirar un instrumento vencido, la aplicación mostrará una advertencia al operario y le permitirá confirmar el retiro registrando el estado en el sistema.
              </>
            ) : (
              <>
                <strong>Comportamiento en Operación:</strong> Al intentar retirar un instrumento vencido, el botón de confirmación quedará totalmente inhabilitado y se exigirá quitar el ítem de la lista para proseguir.
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
