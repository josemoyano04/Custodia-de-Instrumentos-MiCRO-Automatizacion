import React, { useState, useRef, useEffect } from "react";
import type { Instrumento, InstrumentoSeleccionado } from "../../types";

interface InstrumentoSearchProps {
  instrumentos: Instrumento[];
  loading: boolean;
  error: boolean;
  disabled: boolean;
  carrito: InstrumentoSeleccionado[];
  onAgregarAlCarrito: (inst: Instrumento) => void;
  onRetry: () => void;
}

export const InstrumentoSearch: React.FC<InstrumentoSearchProps> = ({
  instrumentos,
  loading,
  error,
  disabled,
  carrito,
  onAgregarAlCarrito,
  onRetry
}) => {
  const [query, setQuery] = useState<string>("");
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  const inputRef = useRef<HTMLInputElement>(null);

  const reposicionarLista = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (dropdownVisible) reposicionarLista();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dropdownVisible]);

  useEffect(() => {
    if (query.trim().length >= 2) {
      reposicionarLista();
      setDropdownVisible(true);
    } else {
      setDropdownVisible(false);
    }
  }, [query]);

  const handleInputChange = (val: string) => {
    setQuery(val);
  };

  const filteredItems = React.useMemo(() => {
    if (query.trim().length < 2) return [];
    const q2 = query.toUpperCase();
    return instrumentos
      .filter(i => i.c.toUpperCase().includes(q2) || i.n.toUpperCase().includes(q2))
      .slice(0, 18);
  }, [query, instrumentos]);

  const handleSelect = (inst: Instrumento) => {
    onAgregarAlCarrito(inst);
    setQuery("");
    setDropdownVisible(false);
  };

  const estaEnCarrito = (cod: string) => {
    return carrito.some(x => x.cod === cod);
  };

  return (
    <div className="card">
      <div className="ctop"></div>
      <div className="cbody">
        <div
          className="clabel"
          style={{
            justifyContent: "space-between",
            fontSize: "13px",
            letterSpacing: "0.8px",
            fontWeight: 800
          }}
        >
          <span>BUSCADOR DE INSTRUMENTOS</span>
          <span className="inst-count">
            {instrumentos.length ? `${instrumentos.length} disponibles` : ""}
          </span>
        </div>

        {loading && (
          <div className="inst-loading" style={{ display: "block" }}>
            <div className="spinner-sm"></div>Cargando inventario…
          </div>
        )}

        {error && (
          <div className="alert warn" style={{ display: "block", marginTop: 0 }}>
            No se pudo cargar el inventario. Verificá la conexión.
            <br />
            <button
              onClick={onRetry}
              style={{
                marginTop: "7px",
                padding: "5px 14px",
                borderRadius: "6px",
                border: "none",
                background: "var(--blue)",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              ↻ Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="acwrap">
            <input
              ref={inputRef}
              type="text"
              className="inst-search-input"
              placeholder="Escribí código (ej. 100-040) o descripción para agregar a tu lista…"
              disabled={disabled}
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (query.trim().length >= 2) {
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
                {filteredItems.length === 0 ? (
                  <div className="acitem" style={{ color: "var(--muted)" }}>
                    Sin resultados
                  </div>
                ) : (
                  filteredItems.map((item, idx) => {
                    const eu = (item.e || "").trim().toUpperCase();
                    const enCar = estaEnCarrito(item.c);
                    return (
                      <div
                        key={`${item.c}_${item.n}_${idx}`}
                        className={`acitem ${enCar ? "in-cart" : ""}`}
                        onClick={() => handleSelect(item)}
                      >
                        <span className="accode">{item.c}</span>
                        <span className="acname">{item.n}</span>
                        {enCar ? (
                          <span className="est-ok" style={{ marginLeft: "auto", flexShrink: 0 }}>
                            ✓ En lista
                          </span>
                        ) : (
                          <>
                            {eu === "VENCIDO" && <span className="est-venc" style={{ marginLeft: "auto", flexShrink: 0 }}>VENCIDO</span>}
                            {eu === "POR VENCER" && <span className="est-warn" style={{ marginLeft: "auto", flexShrink: 0 }}>POR VENCER</span>}
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
