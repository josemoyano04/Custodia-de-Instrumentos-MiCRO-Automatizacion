import React, { useState } from "react";
import type { Instrumento, InstrumentoSeleccionado, Movimiento } from "../../types";

interface DevolucionSearchProps {
  movimientosEnUso: Movimiento[];
  instrumentos: Instrumento[];
  loading: boolean;
  carrito: InstrumentoSeleccionado[];
  filtroLegajo: number | null;
  filtroMaquinaNum: string | null;
  onToggleDevolucionItem: (item: InstrumentoSeleccionado) => void;
  onSeleccionarTodos: (items: InstrumentoSeleccionado[]) => void;
  onDeseleccionarTodos: () => void;
  onRefresh: () => void;
  onActiveInput?: () => void;
  externalQuery?: string;
  onExternalQueryChange?: (val: string) => void;
}

export const DevolucionSearch: React.FC<DevolucionSearchProps> = ({
  movimientosEnUso,
  instrumentos,
  loading,
  carrito,
  filtroLegajo,
  filtroMaquinaNum,
  onToggleDevolucionItem,
  onSeleccionarTodos,
  onDeseleccionarTodos,
  onRefresh,
  onActiveInput,
  externalQuery,
  onExternalQueryChange
}) => {
  const [internalTerm, setInternalTerm] = useState<string>("");
  const searchTerm = externalQuery !== undefined ? externalQuery : internalTerm;
  const [legajoConflictMsg, setLegajoConflictMsg] = useState<string | null>(null);
  const [nativeKbdOpen, setNativeKbdOpen] = useState<boolean>(false);

  const setSearchTerm = (val: string) => {
    if (onExternalQueryChange) {
      onExternalQueryChange(val);
    } else {
      setInternalTerm(val);
    }
  };

  // Enriquecer movimientos con nombres de instrumento y datos de quién retiró
  const itemsEnUso: InstrumentoSeleccionado[] = movimientosEnUso.map(m => {
    const inst = instrumentos.find(i => i.c === m.codInstrumento);
    return {
      cod: m.codInstrumento,
      nom: inst ? inst.n : m.instrumento || m.codInstrumento,
      sec: m.sector || (inst ? inst.s : ""),
      est: inst ? inst.e : "EN USO",
      _enUso: true,
      _calibVenc: false,
      _quienRetiro: {
        legajo: Number(m.legajo),
        nombre: m.nombre,
        maquina: m.maquina
      }
    };
  });

  // Filtrar según legajo, máquina y búsqueda de texto
  const filtered = itemsEnUso.filter(item => {
    const mov = movimientosEnUso.find(m => m.codInstrumento === item.cod);
    if (!mov) return false;

    // Filtro por Legajo
    if (filtroLegajo !== null && String(mov.legajo) !== String(filtroLegajo)) {
      return false;
    }

    // Filtro por Máquina
    if (filtroMaquinaNum !== null) {
      const maqText = mov.maquina || "";
      const matchesMaq = maqText.toUpperCase().includes(filtroMaquinaNum.toUpperCase());
      if (!matchesMaq) return false;
    }

    // Filtro por Búsqueda (Código o Nombre u Operario)
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toUpperCase();
      const matchCod = item.cod.toUpperCase().includes(q);
      const matchNom = item.nom.toUpperCase().includes(q);
      const matchOp = (mov.nombre || "").toUpperCase().includes(q) || String(mov.legajo).includes(q);
      if (!matchCod && !matchNom && !matchOp) return false;
    }

    return true;
  });

  const todosSeleccionados = filtered.length > 0 && filtered.every(f => carrito.some(c => c.cod === f.cod));

  const handleToggleItemWithLegajoCheck = (item: InstrumentoSeleccionado) => {
    const yaEsta = carrito.some(c => c.cod === item.cod);
    if (!yaEsta && carrito.length > 0) {
      const primerLegajo = carrito[0]._quienRetiro?.legajo;
      const esteLegajo = item._quienRetiro?.legajo;

      if (primerLegajo && esteLegajo && primerLegajo !== esteLegajo) {
        setLegajoConflictMsg(`Solo podés devolver instrumentos del mismo operario en una sola operación (actualmente seleccionados del Leg. ${primerLegajo}).`);
        setTimeout(() => setLegajoConflictMsg(null), 4000);
        return;
      }
    }
    setLegajoConflictMsg(null);
    onToggleDevolucionItem(item);
  };

  const handleToggleAll = () => {
    if (todosSeleccionados) {
      onDeseleccionarTodos();
    } else {
      // Verificar si en filtered hay múltiples legajos
      const legajosDistintos = Array.from(new Set(filtered.map(f => f._quienRetiro?.legajo).filter(Boolean)));
      if (legajosDistintos.length > 1) {
        // Seleccionar solo los del primer legajo
        const targetLeg = legajosDistintos[0];
        const soloMismoLeg = filtered.filter(f => f._quienRetiro?.legajo === targetLeg);
        setLegajoConflictMsg(`Se seleccionaron solo los instrumentos del Legajo ${targetLeg} para mantener la devolución por operario único.`);
        setTimeout(() => setLegajoConflictMsg(null), 4500);
        onSeleccionarTodos(soloMismoLeg);
      } else {
        setLegajoConflictMsg(null);
        onSeleccionarTodos(filtered);
      }
    }
  };

  return (
    <div className="card dev-search-card">
      <div className="ctop" style={{ background: "linear-gradient(90deg, #009657, #007a46)" }}></div>
      <div className="cbody" style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%", overflow: "hidden" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div className="clabel" style={{ marginBottom: 0 }}>
            Instrumentos en Uso para Devolución
          </div>
          <button
            type="button"
            className="btn-vaciar"
            onClick={onRefresh}
            title="Actualizar lista de uso"
            style={{ color: "var(--blue)", fontSize: "11px" }}
          >
            ↻ Actualizar
          </button>
        </div>

        {/* Mensaje de conflicto de legajo si intenta mezclar operarios */}
        {legajoConflictMsg && (
          <div className="alert warn" style={{ display: "block", fontSize: "11px", padding: "6px 10px", margin: 0 }}>
            ⚠️ {legajoConflictMsg}
          </div>
        )}

        {/* Input de Búsqueda Rápida */}
        <div className="input-with-kbd-btn" style={{ flexShrink: 0 }}>
          <input
            type="text"
            className="inst-search-input"
            placeholder="Buscar por código, instrumento o legajo…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (onActiveInput) onActiveInput();
            }}
            onClick={() => {
              if (onActiveInput) onActiveInput();
            }}
            inputMode={nativeKbdOpen ? "text" : undefined}
          />
          {/* Botón de teclado virtual (visible en Tablet) */}
          <button
            type="button"
            className="input-kbd-btn"
            onClick={() => setNativeKbdOpen(true)}
            title="Abrir teclado completo del dispositivo"
            style={{ height: "38px", width: "38px", fontSize: "17px" }}
          >
            ⌨️
          </button>
        </div>

        {/* Barra de conteo y botón Seleccionar Todos */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 4px", flexShrink: 0 }}>
          <span style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--soft)" }}>
            {filtered.length} {filtered.length === 1 ? "instrumento en uso" : "instrumentos en uso"}
            {(filtroLegajo || filtroMaquinaNum || searchTerm) && " (filtrados)"}
          </span>

          {filtered.length > 0 && (
            <button
              type="button"
              onClick={handleToggleAll}
              style={{
                background: todosSeleccionados ? "var(--surface-hover)" : "rgba(0, 150, 87, 0.12)",
                border: "1px solid rgba(0, 150, 87, 0.3)",
                color: "var(--ok)",
                borderRadius: "14px",
                padding: "3px 10px",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              {todosSeleccionados ? "Deseleccionar todos" : "✓ Seleccionar todos"}
            </button>
          )}
        </div>

        {/* Lista scrolleable dedicada de instrumentos en uso */}
        <div className="dev-in-use-list">
          {loading ? (
            <div className="inst-loading">Cargando instrumentos en uso…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 10px", color: "var(--soft)", fontSize: "12px" }}>
              {movimientosEnUso.length === 0
                ? "No hay instrumentos en uso actualmente ✓"
                : "No se encontraron instrumentos con los filtros seleccionados."}
            </div>
          ) : (
            filtered.map((item, idx) => {
              const mov = movimientosEnUso.find(m => m.codInstrumento === item.cod);
              const isSelected = carrito.some(c => c.cod === item.cod);

              return (
                <div
                  key={`${item.cod}_${item.nom}_${idx}`}
                  className={`dev-item-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleToggleItemWithLegajoCheck(item)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
                    {/* Checkbox visual */}
                    <div className={`dev-checkbox ${isSelected ? "checked" : ""}`}>
                      {isSelected && "✓"}
                    </div>

                    <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className="mono" style={{ fontSize: "11.5px", color: "var(--blue-d)" }}>
                          {item.cod}
                        </span>
                        <span style={{ fontSize: "10.5px", color: "var(--soft)" }}>
                          · {item.sec || "Sin sector"}
                        </span>
                      </div>

                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.nom}
                      </div>

                      {mov && (
                        <div style={{ fontSize: "10.5px", color: "var(--muted)", marginTop: "2px" }}>
                          Retirado por: <strong>Leg. {mov.legajo}{mov.nombre ? ` (${mov.nombre})` : ""}</strong>
                          {mov.maquina ? ` · Máq. ${mov.maquina}` : ""}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`btn-add-dev ${isSelected ? "added" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleItemWithLegajoCheck(item);
                    }}
                  >
                    {isSelected ? "En lista ✓" : "+ Agregar"}
                  </button>
                </div>
              );
            })
          )}
          {/* Espacio inferior de resguardo */}
          <div style={{ height: "40px", flexShrink: 0, pointerEvents: "none" }}></div>
        </div>

      </div>
    </div>
  );
};
