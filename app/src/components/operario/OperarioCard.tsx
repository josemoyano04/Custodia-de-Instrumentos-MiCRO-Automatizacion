import React, { useState, useRef, useEffect } from "react";
import type { Operario, OperarioHabilitado } from "../../types";

interface OperarioCardProps {
  legajos: Operario[];
  operariosHabilitados: OperarioHabilitado[];
  operarioSeleccionado: Operario | null;
  modo: "retiro" | "devolucion";
  onSeleccionarOperario: (operario: Operario | null) => void;
  onActiveInput?: () => void;
  externalQuery?: string;
  onExternalQueryChange?: (val: string) => void;
}

export const OperarioCard: React.FC<OperarioCardProps> = ({
  legajos,
  operariosHabilitados,
  operarioSeleccionado,
  modo: _modo,
  onSeleccionarOperario,
  onActiveInput,
  externalQuery,
  onExternalQueryChange
}) => {
  const [internalQuery, setInternalQuery] = useState<string>("");
  const query = externalQuery !== undefined ? externalQuery : internalQuery;

  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const [modalNoHabilitado, setModalNoHabilitado] = useState<Operario | null>(null);
  const [nativeKbdOpen, setNativeKbdOpen] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const reposicionarLista = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (dropdownVisible) reposicionarLista();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dropdownVisible]);

  useEffect(() => {
    if (!operarioSeleccionado && query.trim().length >= 1) {
      reposicionarLista();
      setDropdownVisible(true);
    } else {
      setDropdownVisible(false);
    }
  }, [query, operarioSeleccionado]);

  const setQueryValue = (val: string) => {
    if (onExternalQueryChange) {
      onExternalQueryChange(val);
    } else {
      setInternalQuery(val);
    }
  };

  const handleInputChange = (val: string) => {
    setQueryValue(val);
  };

  const handleSelectOperario = (op: Operario) => {
    // Validar si el operario está habilitado en el padrón
    const estaHabilitado = operariosHabilitados.some(
      h => h.legajo === op.leg && Boolean(h.habilitado)
    );

    setDropdownVisible(false);
    setQueryValue("");
    setNativeKbdOpen(false);

    if (!estaHabilitado) {
      onSeleccionarOperario(null);
      setModalNoHabilitado(op);
      return;
    }

    onSeleccionarOperario(op);
  };

  const handleDeselect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSeleccionarOperario(null);
    setQueryValue("");
    setNativeKbdOpen(false);
  };

  const cleanQ = query.trim().toUpperCase();
  const filtered = legajos
    .filter(l =>
      String(l.leg).includes(cleanQ) ||
      l.nombre.toUpperCase().includes(cleanQ) ||
      l.sector.toUpperCase().includes(cleanQ)
    )
    .slice(0, 15);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const q = query.trim();
      if (!q) return;

      const exact = legajos.find(l => String(l.leg) === q);
      if (exact) {
        handleSelectOperario(exact);
        return;
      }

      if (filtered.length > 0) {
        handleSelectOperario(filtered[0]);
      }
    }
  };

  const handleToggleNativeKbd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNativeKbdOpen(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="card">
      <div className="ctop"></div>
      <div className="cbody" style={{ position: "relative" }}>
        <div className="clabel">Operario</div>

        <div className="acwrap" ref={wrapRef} style={{ position: "relative" }}>
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

              {/* Botón X para deseleccionar */}
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
            <div className="input-with-kbd-btn">
              <input
                ref={inputRef}
                id="inp-leg"
                type="text"
                placeholder="Nro de legajo o nombre (ej. 285, Dias)…"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (onActiveInput) onActiveInput();
                  if (query.trim().length >= 1) {
                    reposicionarLista();
                    setDropdownVisible(true);
                  }
                }}
                onClick={() => {
                  if (onActiveInput) onActiveInput();
                }}
                inputMode={nativeKbdOpen ? "text" : undefined}
                autoFocus
              />

              {/* Botón de teclado virtual (visible en Tablet) */}
              <button
                type="button"
                className="input-kbd-btn"
                onClick={handleToggleNativeKbd}
                title="Abrir teclado completo del dispositivo"
              >
                ⌨️
              </button>

              {dropdownVisible && (
                <div
                  className="aclist"
                  style={{
                    display: "block",
                    top: `${dropdownPos.top}px`,
                    left: `${dropdownPos.left}px`,
                    width: `${dropdownPos.width}px`
                  }}
                >
                  {filtered.length === 0 ? (
                    <div className="acitem" style={{ color: "var(--muted)" }}>
                      Sin resultados en la nómina
                    </div>
                  ) : (
                    filtered.map(l => (
                      <div
                        key={l.leg}
                        className="acitem"
                        onClick={() => handleSelectOperario(l)}
                      >
                        <span className="accode">{l.leg}</span>
                        <span className="acname">{l.nombre}</span>
                        <span style={{ color: "var(--muted)", fontSize: "10px", marginLeft: "auto" }}>
                          {l.sector}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL: OPERARIO NO HABILITADO */}
        {modalNoHabilitado && (
          <div
            className="modal-bg open"
            style={{
              display: "flex",
              zIndex: 99999,
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.65)",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px"
            }}
          >
            <div
              className="modal-box"
              style={{
                maxWidth: "400px",
                width: "100%",
                background: "var(--card-bg)",
                border: "2px solid var(--warn)",
                borderRadius: "14px",
                padding: "24px",
                textAlign: "center",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
              }}
            >
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>⛔</div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "var(--warn)",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
              >
                Operario No Habilitado
              </div>
              <div
                style={{
                  fontSize: "13.5px",
                  color: "var(--text)",
                  lineHeight: 1.5,
                  marginBottom: "18px"
                }}
              >
                El operario <strong>{modalNoHabilitado.nombre}</strong> (Legajo{" "}
                <strong>{modalNoHabilitado.leg}</strong>, {modalNoHabilitado.sector})
                no cuenta con permisos habilitados para retiro o devolución de instrumentos.
                <br /><br />
                <span style={{ color: "var(--soft)", fontSize: "12px" }}>
                  Solicitá la habilitación al <strong>Administrador del sistema</strong> para poder operar.
                </span>
              </div>
              <button
                type="button"
                className="btn btn-ret"
                style={{
                  width: "100%",
                  height: "42px",
                  fontSize: "13px",
                  fontWeight: 800
                }}
                onClick={() => setModalNoHabilitado(null)}
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
