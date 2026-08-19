import React, { useState, useRef, useEffect } from "react";
import type { Maquina } from "../../types";

interface MaquinaCardProps {
  maquinas: Maquina[];
  maquinaSeleccionada: Maquina | null;
  onSeleccionarMaquina: (maq: Maquina | null) => void;
  visible: boolean;
  label?: string;
}

export const MaquinaCard: React.FC<MaquinaCardProps> = ({
  maquinas,
  maquinaSeleccionada,
  onSeleccionarMaquina,
  visible,
  label = "Máquina / Sector (destinatario)"
}) => {
  const [query, setQuery] = useState<string>("");
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

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
    const handleResize = () => { if (dropdownVisible) reposicionarLista(); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dropdownVisible]);

  useEffect(() => {
    if (query.trim().length >= 1) {
      reposicionarLista();
      setDropdownVisible(true);
    } else {
      setDropdownVisible(false);
    }
  }, [query]);

  if (!visible) return null;

  const handleInputChange = (val: string) => {
    setQuery(val);
    onSeleccionarMaquina(null);
  };

  const handleSelect = (m: Maquina) => {
    onSeleccionarMaquina(m);
    setQuery("");
    setDropdownVisible(false);
  };

  const handleDeselect = () => {
    onSeleccionarMaquina(null);
    setQuery("");
  };

  const cleanQ = query.trim().toUpperCase();
  const filtered = maquinas
    .filter(m => {
      if (!cleanQ) return false;
      const numMatch = m.num ? String(m.num).toUpperCase().startsWith(cleanQ) : false;
      const descMatch = m.desc.toUpperCase().includes(cleanQ);
      const locMatch = m.loc ? m.loc.toUpperCase().includes(cleanQ) : false;
      return numMatch || descMatch || locMatch;
    })
    .slice(0, 14);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const q = query.trim().toUpperCase();
      if (!q) return;

      const exactNum = maquinas.find(m => m.num && String(m.num).toUpperCase() === q);
      if (exactNum) {
        handleSelect(exactNum);
        return;
      }

      const exactDesc = maquinas.find(m => m.desc.toUpperCase() === q);
      if (exactDesc) {
        handleSelect(exactDesc);
        return;
      }

      if (filtered.length > 0) {
        handleSelect(filtered[0]);
      }
    }
  };

  return (
    <div className="card" id="card-maquina" style={{ display: "block" }}>
      <div className="ctop"></div>
      <div className="cbody">
        <div className="clabel">{label}</div>

        <div className="acwrap" ref={wrapRef} style={{ position: "relative" }}>
          {/* Badge de máquina/sector seleccionado */}
          {maquinaSeleccionada ? (
            <div className="pbadge" style={{ display: "flex", alignItems: "center", paddingRight: "38px" }}>
              {/* Botón X para deseleccionar */}
              <button
                className="btn-deselect-op"
                onClick={handleDeselect}
                title="Cambiar máquina o sector"
              >
                ✕
              </button>

              {/* Ícono de máquina o sector */}
              <div
                className="pavatar"
                style={{
                  borderRadius: "8px",
                  fontSize: maquinaSeleccionada.num ? "11px" : "9.5px",
                  fontWeight: 800,
                  background: maquinaSeleccionada.num ? undefined : "var(--info-bg)",
                  color: maquinaSeleccionada.num ? undefined : "var(--blue)"
                }}
              >
                {maquinaSeleccionada.num || "SEC"}
              </div>

              <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                <div className="pnombre" style={{ wordBreak: "break-word", lineHeight: 1.25 }}>
                  {maquinaSeleccionada.desc}
                </div>
                <div className="psector">
                  {maquinaSeleccionada.loc || (maquinaSeleccionada.num ? `Máquina ${maquinaSeleccionada.num}` : "Sector")}
                </div>
              </div>
            </div>
          ) : (
            /* Input de búsqueda cuando no hay máquina/sector seleccionado */
            <>
              <input
                ref={inputRef}
                type="text"
                placeholder="Nro de máquina o sector (ej. 208, Calidad, PMPP)…"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (query.trim().length >= 1) {
                    reposicionarLista();
                    setDropdownVisible(true);
                  }
                }}
              />

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
                      Sin resultados — podés escribir el nombre del sector o máquina
                    </div>
                  ) : (
                    filtered.map((m, idx) => (
                      <div key={`${m.num || "sec"}_${m.desc}_${idx}`} className="acitem" onClick={() => handleSelect(m)}>
                        {m.num ? (
                          <span className="accode">{m.num}</span>
                        ) : (
                          <span
                            className="accode"
                            style={{
                              fontSize: "9.5px",
                              width: "auto",
                              minWidth: "48px",
                              padding: "2px 6px",
                              borderRadius: "5px",
                              background: "var(--info-bg)",
                              color: "var(--blue)"
                            }}
                          >
                            SECTOR
                          </span>
                        )}
                        <span className="acname" style={{ fontWeight: m.num ? 600 : 700 }}>
                          {m.desc}
                        </span>
                        <span style={{ color: "var(--muted)", fontSize: "10px", marginLeft: "auto" }}>
                          {m.loc}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
