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
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [legajoConflictMsg, setLegajoConflictMsg] = useState<string | null>(null);

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

    // Filtro por Máquina o Sector
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
      if (filtered.length === 0) return;

      // Validar si todos los items filtrados pertenecen al mismo legajo
      const primerLegajo = filtered[0]._quienRetiro?.legajo;
      const tieneVariosLegajos = filtered.some(f => f._quienRetiro?.legajo !== primerLegajo);

      if (tieneVariosLegajos) {
        setLegajoConflictMsg("Para seleccionar todos, filtrá previamente por un operario específico ya que los instrumentos pertenecen a distintos legajos.");
        setTimeout(() => setLegajoConflictMsg(null), 5000);
        return;
      }

      setLegajoConflictMsg(null);
      onSeleccionarTodos(filtered);
    }
  };

  return (
    <div className="card" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div className="ctop"></div>
      <div className="cbody" style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%", overflow: "hidden" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div
            className="clabel"
            style={{
              marginBottom: 0,
              fontSize: "13px",
              letterSpacing: "0.8px",
              fontWeight: 800
            }}
          >
            INSTRUMENTOS EN USO PARA DEVOLUCIÓN
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
        <div style={{ position: "relative", flexShrink: 0 }}>
          <input
            type="text"
            className="inst-search-input"
            placeholder="Buscar por código, instrumento o legajo…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingRight: "34px" }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "14px"
              }}
            >
              ✕
            </button>
          )}
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
              className="btn-vaciar"
              onClick={handleToggleAll}
              style={{ color: "var(--blue)", fontWeight: 700 }}
            >
              {todosSeleccionados ? "Deseleccionar todos" : "Seleccionar todos"}
            </button>
          )}
        </div>

        {/* Lista de Instrumentos en Uso */}
        <div className="dev-list-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {loading ? (
            <div className="inst-loading" style={{ display: "block" }}>
              <div className="spinner-sm"></div>Cargando instrumentos en uso…
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-cart" style={{ padding: "20px 0" }}>
              <span className="empty-ico">🔍</span>
              <p>No se encontraron instrumentos en uso con los filtros actuales</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const seleccionado = carrito.some(c => c.cod === item.cod);
              const quien = item._quienRetiro;

              return (
                <div
                  key={`${item.cod}_${idx}`}
                  className={`dev-item ${seleccionado ? "selected" : ""}`}
                  onClick={() => handleToggleItemWithLegajoCheck(item)}
                >
                  <div className="dev-chk">
                    <input
                      type="checkbox"
                      checked={seleccionado}
                      onChange={() => {}}
                      style={{ cursor: "pointer", width: "16px", height: "16px" }}
                    />
                  </div>

                  <div className="dev-info" style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="dev-cod mono">{item.cod}</span>
                      <span className="dev-nom">{item.nom}</span>
                    </div>

                    <div className="dev-meta" style={{ fontSize: "11px", color: "var(--soft)", marginTop: "2px" }}>
                      {quien && (
                        <span>
                          Retirado por: <strong>{quien.nombre}</strong> (Leg. {quien.legajo})
                          {quien.maquina ? ` · ${quien.maquina}` : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {seleccionado && (
                    <span className="badge bg" style={{ marginLeft: "auto", flexShrink: 0 }}>
                      A devolver
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
