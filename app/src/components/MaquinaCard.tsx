import React, { useState, useRef, useEffect } from "react";
import type { Maquina } from "../types";

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
  label = "Máquina / Celda (destinatario)"
}) => {
  const [query, setQuery] = useState<string>("");
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);

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

  if (!visible) return null;

  const handleInputChange = (val: string) => {
    setQuery(val);
    onSeleccionarMaquina(null);
    if (val.trim().length >= 1) {
      reposicionarLista();
      setDropdownVisible(true);
    } else {
      setDropdownVisible(false);
    }
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

  const filtered = maquinas
    .filter(m => String(m.num).toUpperCase().startsWith(query.toUpperCase()) || m.desc.toUpperCase().includes(query.toUpperCase()))
    .slice(0, 12);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const q = query.trim().toUpperCase();
      if (!q) return;

      // 1. Buscar coincidencia exacta por número de máquina (ej. "208")
      const exactNum = maquinas.find(m => String(m.num).toUpperCase() === q);
      if (exactNum) {
        handleSelect(exactNum);
        return;
      }

      // 2. Si no hay coincidencia exacta de número, buscar en lista filtrada
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

          {/* Badge de máquina seleccionada — se superpone sobre el input */}
          {maquinaSeleccionada ? (
            <div className="pbadge" style={{ display: "flex", alignItems: "center", paddingRight: "38px" }}>
              {/* Botón X para deseleccionar */}
              <button
                className="btn-deselect-op"
                onClick={handleDeselect}
                title="Cambiar máquina"
              >
                ✕
              </button>

              {/* Ícono de máquina */}
              <div className="pavatar" style={{ borderRadius: "8px", fontSize: "11px", fontWeight: 800 }}>
                {maquinaSeleccionada.num}
              </div>

              <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                <div className="pnombre" style={{ wordBreak: "break-word", lineHeight: 1.25 }}>{maquinaSeleccionada.desc}</div>
                <div className="psector">{maquinaSeleccionada.loc}</div>
              </div>
            </div>
          ) : (
            /* Input de búsqueda cuando no hay máquina seleccionada */
            <>
              <input
                ref={inputRef}
                type="text"
                placeholder="Nro o nombre de máquina (ej. 208, Romi, Hyundai)…"
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
                      Sin resultados — podés escribir libremente
                    </div>
                  ) : (
                    filtered.map(m => (
                      <div key={m.num} className="acitem" onClick={() => handleSelect(m)}>
                        <span className="accode">{m.num}</span>
                        <span className="acname">{m.desc}</span>
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
