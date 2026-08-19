import React from "react";
import type { InstrumentoSeleccionado } from "../../types";

interface SelectedTrayProps {
  carrito: InstrumentoSeleccionado[];
  onQuitarDelCarrito: (cod: string) => void;
  onVaciarCarrito: () => void;
}

export const SelectedTray: React.FC<SelectedTrayProps> = ({
  carrito,
  onQuitarDelCarrito,
  onVaciarCarrito
}) => {
  if (!carrito.length) {
    return (
      <div className="card tray-card empty" style={{ flex: "1 1 0%", minHeight: 0 }}>
        <div className="cbody" style={{ textAlign: "center", padding: "16px" }}>
          <div className="tray-empty-text">
            <svg viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" strokeWidth="2" fill="none" style={{ opacity: .45, marginBottom: "4px" }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            <br />
            Lista vacía — Seleccioná e ingresá instrumentos a tu lista para registrarlos
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="card tray-card"
      style={{
        flex: "1 1 0%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      <div className="ctop"></div>

      <div
        className="cbody"
        style={{
          flex: "1 1 0%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          padding: "10px 12px"
        }}
      >
        {/* Encabezado de la lista */}
        <div className="clabel" style={{ justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            <span>Lista de Selección</span>
            <span className="tray-count-badge">{carrito.length}</span>
          </span>
          <button className="btn-vaciar" onClick={onVaciarCarrito} title="Vaciar lista">
            Vaciar lista
          </button>
        </div>

        {/* Lista scrolleable interna */}
        <div
          style={{
            flex: "1 1 0%",
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            paddingRight: "6px",
            paddingBottom: "72px"
          }}
        >
          {carrito.map((item, idx) => {
            const isWarn = item._enUso || item._calibVenc;
            const quien = item._quienRetiro;

            let estadoSubText: React.ReactNode = null;
            if (item._calibVenc) {
              estadoSubText = <span className="est-venc">⛔ CALIBRACIÓN VENCIDA</span>;
            } else if (quien) {
              estadoSubText = (
                <span className="est-warn">
                  ⚠ Retirado por Leg. {quien.legajo}
                  {quien.maquina ? `, en máquina ${quien.maquina}` : ""}
                </span>
              );
            } else if (item._enUso === true || item._enUso === "otro") {
              estadoSubText = (
                <span className="est-warn">
                  ⚠ En uso · Listo para devolución
                </span>
              );
            } else {
              estadoSubText = (
                <span className="est-ok">✓ Disponible · {item.sec || "Sin sector"}</span>
              );
            }

            return (
              <div key={`${item.cod}_${item.nom}_${idx}`} className={`tray-item ${isWarn ? "warn" : ""}`} style={{ flexShrink: 0 }}>
                <div className="tray-item-info">
                  <div className="tray-item-cod">{item.cod}</div>
                  <div className="tray-item-nom">{item.nom}</div>
                  <div className="tray-item-sub">
                    {estadoSubText}
                  </div>
                </div>
                <button
                  className="btn-del-item"
                  onClick={() => onQuitarDelCarrito(item.cod)}
                  title="Quitar de la lista"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
