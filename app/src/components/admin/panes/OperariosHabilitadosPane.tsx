import React, { useState, useMemo } from "react";
import type { OperarioHabilitado } from "../../../types";

interface OperariosHabilitadosPaneProps {
  operariosList: OperarioHabilitado[];
  loadingOps: boolean;
  opMsg: { type: "ok" | "warn"; text: string } | null;
  onActualizar: () => void;
  onOpenAlta: () => void;
  onOpenPin: (legajo?: string) => void;
  onToggleHabilitar: (op: OperarioHabilitado) => void;
  onOpenBlanqueo: (legajo: number) => void;
  onOpenEliminar: (op: OperarioHabilitado) => void;
}

export const OperariosHabilitadosPane: React.FC<OperariosHabilitadosPaneProps> = ({
  operariosList,
  loadingOps,
  opMsg,
  onActualizar,
  onOpenAlta,
  onOpenPin,
  onToggleHabilitar,
  onOpenBlanqueo,
  onOpenEliminar
}) => {
  const [fltPin, setFltPin] = useState<string>("");

  const operariosFiltrados = useMemo(() => {
    const q = fltPin.trim().toUpperCase();
    return operariosList.filter(x => {
      if (!q) return true;
      return (
        String(x.legajo).includes(q) ||
        x.nombre.toUpperCase().includes(q) ||
        x.sector.toUpperCase().includes(q)
      );
    });
  }, [operariosList, fltPin]);

  return (
    <div className="adm-pane on">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          flexWrap: "wrap",
          gap: "8px"
        }}
      >
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Buscar por legajo, nombre o sector…"
            style={{ width: "260px" }}
            value={fltPin}
            onChange={(e) => setFltPin(e.target.value)}
          />
          <button
            type="button"
            className="btn-vaciar"
            onClick={onActualizar}
            style={{ color: "var(--blue)", fontSize: "11px" }}
          >
            ↻ Actualizar Lista
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="btn btn-ret"
            style={{
              height: "36px",
              padding: "0 14px",
              fontSize: "11.5px",
              fontWeight: 800
            }}
            onClick={onOpenAlta}
          >
            + Alta de Operario
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            style={{
              height: "36px",
              padding: "0 14px",
              fontSize: "11.5px",
              fontWeight: 800
            }}
            onClick={() => onOpenPin("")}
          >
            🔑 Asignar PIN
          </button>
        </div>
      </div>

      {opMsg && (
        <div
          className={`alert ${opMsg.type}`}
          style={{ display: "block", marginBottom: "10px" }}
        >
          {opMsg.text}
        </div>
      )}

      {loadingOps ? (
        <div className="inst-loading">Cargando operarios habilitados…</div>
      ) : (
        <div className="scroll-table">
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>Legajo</th>
                <th style={{ textAlign: "center" }}>Nombre y Apellido</th>
                <th style={{ textAlign: "center" }}>Sector</th>
                <th style={{ textAlign: "center" }}>Habilitación Retiro</th>
                <th style={{ textAlign: "center" }}>Estado PIN</th>
                <th style={{ textAlign: "center" }}>Último Uso</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {operariosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "18px",
                      color: "var(--soft)"
                    }}
                  >
                    No hay operarios registrados en el padrón
                  </td>
                </tr>
              ) : (
                operariosFiltrados.map(x => (
                  <tr key={x.legajo}>
                    <td className="mono" style={{ textAlign: "center" }}>
                      {x.legajo}
                    </td>
                    <td style={{ fontWeight: 700, textAlign: "left" }}>
                      {x.nombre}
                    </td>
                    <td style={{ color: "var(--soft)", textAlign: "center" }}>
                      {x.sector}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {x.habilitado ? (
                        <span className="pin-badge-ok">HABILITADO</span>
                      ) : (
                        <span className="pin-badge-blk">INHABILITADO</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {!x.pin_hash ? (
                        <span style={{ fontSize: "11px", color: "var(--soft)", fontWeight: 700 }}>
                          SIN PIN
                        </span>
                      ) : x.pin_bloqueado ? (
                        <span className="pin-badge-blk">BLOQUEADO</span>
                      ) : (
                        <span className="pin-badge-ok">ACTIVO</span>
                      )}
                      {Boolean(x.pin_intentos && !x.pin_bloqueado) && (
                        <span
                          style={{
                            fontSize: "10px",
                            color: "var(--warn)",
                            marginLeft: "4px",
                            fontWeight: 700
                          }}
                        >
                          ({x.pin_intentos} fallido{x.pin_intentos === 1 ? "" : "s"})
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: "11.5px", color: "var(--soft)", textAlign: "center" }}>
                      {x.ultimoUsoPin || x.fechaAltaPin || "—"}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          gap: "6px",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        {/* Botón Habilitar / Inhabilitar */}
                        <button
                          className="btn-blank"
                          onClick={() => onToggleHabilitar(x)}
                          style={{
                            borderColor: x.habilitado
                              ? "var(--warn-br)"
                              : "var(--ok-br)",
                            background: x.habilitado
                              ? "var(--warn-bg)"
                              : "var(--ok-bg)",
                            color: x.habilitado
                              ? "var(--warn)"
                              : "var(--ok)"
                          }}
                          title={
                            x.habilitado
                              ? "Inhabilitar para retiros"
                              : "Habilitar para retiros"
                          }
                        >
                          {x.habilitado ? "Inhabilitar" : "Habilitar"}
                        </button>

                        {/* Botón Cambiar PIN */}
                        <button
                          className="btn-blank"
                          onClick={() => onOpenPin(String(x.legajo))}
                          style={{
                            background: "var(--surface)",
                            color: "var(--blue-d)",
                            borderColor: "var(--border)"
                          }}
                          title="Asignar o cambiar PIN"
                        >
                          PIN
                        </button>

                        {/* Botón Blanquear (si tiene PIN creado) */}
                        {x.pin_hash && (
                          <button
                            className="btn-blank"
                            onClick={() => onOpenBlanqueo(x.legajo)}
                            title="Desbloquear y resetear intentos"
                          >
                            Blanquear
                          </button>
                        )}

                        {/* Botón Eliminar Operario */}
                        <button
                          className="btn-blank"
                          onClick={() => onOpenEliminar(x)}
                          style={{
                            borderColor: "var(--warn-br)",
                            background: "var(--warn-bg)",
                            color: "var(--warn)"
                          }}
                          title="Eliminar operario del padrón"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
