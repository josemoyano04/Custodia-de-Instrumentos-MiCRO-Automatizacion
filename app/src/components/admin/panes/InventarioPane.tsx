import React, { useState, useMemo } from "react";
import type { Instrumento, Movimiento } from "../../../types";

interface InventarioPaneProps {
  instrumentos: Instrumento[];
  usoList: Movimiento[];
}

export const InventarioPane: React.FC<InventarioPaneProps> = ({
  instrumentos,
  usoList
}) => {
  const [fltQuery, setFltQuery] = useState<string>("");
  const [fltSector, setFltSector] = useState<string>("TODOS");
  const [fltEstado, setFltEstado] = useState<string>("TODOS");
  const [fltDisp, setFltDisp] = useState<string>("TODOS");

  const [sortCol, setSortCol] = useState<"c" | "n" | "s" | "e" | "disp">("c");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [invLimit, setInvLimit] = useState<number>(100);

  // Mapeo rápido de instrumentos actualmente en uso
  const usoMap = useMemo(() => {
    const map = new Map<string, Movimiento>();
    usoList.forEach(m => {
      if (m.estado === "EN USO") {
        map.set(m.codInstrumento.trim().toUpperCase(), m);
      }
    });
    return map;
  }, [usoList]);

  // Lista única de sectores para el selector
  const sectores = useMemo(() => {
    const set = new Set<string>();
    instrumentos.forEach(x => {
      if (x.s && x.s.trim()) set.add(x.s.trim());
    });
    return Array.from(set).sort();
  }, [instrumentos]);

  // Filtrado y ordenamiento de alto rendimiento
  const filtrados = useMemo(() => {
    const q = fltQuery.trim().toUpperCase();

    return instrumentos
      .filter(item => {
        // Búsqueda por texto (código o nombre)
        if (q) {
          const matchCod = item.c.toUpperCase().includes(q);
          const matchNom = item.n.toUpperCase().includes(q);
          const matchSec = item.s.toUpperCase().includes(q);
          if (!matchCod && !matchNom && !matchSec) return false;
        }

        // Filtro por sector
        if (fltSector !== "TODOS" && item.s.trim() !== fltSector) {
          return false;
        }

        // Filtro por estado de calibración
        if (fltEstado !== "TODOS") {
          const estUpper = (item.e || "").toUpperCase();
          if (fltEstado === "VENCIDO" && !estUpper.includes("VENC")) return false;
          if (fltEstado === "POR VENCER" && !estUpper.includes("POR VENCER") && !estUpper.includes("PROX")) return false;
          if (fltEstado === "CALIBRADO" && (estUpper.includes("VENC") || !estUpper.includes("CALIB"))) return false;
        }

        // Filtro por disponibilidad
        if (fltDisp !== "TODOS") {
          const enUso = usoMap.has(item.c.trim().toUpperCase());
          if (fltDisp === "EN USO" && !enUso) return false;
          if (fltDisp === "DISPONIBLE" && enUso) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let vA: any = "";
        let vB: any = "";

        if (sortCol === "c") {
          vA = a.c;
          vB = b.c;
        } else if (sortCol === "n") {
          vA = a.n;
          vB = b.n;
        } else if (sortCol === "s") {
          vA = a.s;
          vB = b.s;
        } else if (sortCol === "e") {
          vA = a.e || "";
          vB = b.e || "";
        } else if (sortCol === "disp") {
          vA = usoMap.has(a.c.trim().toUpperCase()) ? 1 : 0;
          vB = usoMap.has(b.c.trim().toUpperCase()) ? 1 : 0;
        }

        if (typeof vA === "string" && typeof vB === "string") {
          return sortAsc ? vA.localeCompare(vB) : vB.localeCompare(vA);
        }
        return sortAsc ? (vA > vB ? 1 : -1) : (vA < vB ? 1 : -1);
      });
  }, [instrumentos, usoMap, fltQuery, fltSector, fltEstado, fltDisp, sortCol, sortAsc]);

  const handleSort = (col: "c" | "n" | "s" | "e" | "disp") => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  const handleLimpiarFiltros = () => {
    setFltQuery("");
    setFltSector("TODOS");
    setFltEstado("TODOS");
    setFltDisp("TODOS");
    setInvLimit(100);
  };

  return (
    <div className="adm-pane on" style={{ width: "100%" }}>
      {/* BARRA DE FILTROS Y CONTROLES */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "12px",
          flexWrap: "wrap",
          alignItems: "center"
        }}
      >
        <input
          type="text"
          placeholder="Buscar por código o nombre…"
          style={{ width: "240px" }}
          value={fltQuery}
          onChange={(e) => {
            setFltQuery(e.target.value);
            setInvLimit(100);
          }}
        />

        <select
          value={fltSector}
          onChange={(e) => {
            setFltSector(e.target.value);
            setInvLimit(100);
          }}
          style={{ width: "160px", height: "38px" }}
        >
          <option value="TODOS">Todos los sectores</option>
          {sectores.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={fltEstado}
          onChange={(e) => {
            setFltEstado(e.target.value);
            setInvLimit(100);
          }}
          style={{ width: "160px", height: "38px" }}
        >
          <option value="TODOS">Toda calibración</option>
          <option value="CALIBRADO">Calibrado</option>
          <option value="POR VENCER">Próximo a Vencer</option>
          <option value="VENCIDO">Vencido</option>
        </select>

        <select
          value={fltDisp}
          onChange={(e) => {
            setFltDisp(e.target.value);
            setInvLimit(100);
          }}
          style={{ width: "160px", height: "38px" }}
        >
          <option value="TODOS">Toda custodia</option>
          <option value="DISPONIBLE">Disponibles</option>
          <option value="EN USO">En Uso</option>
        </select>

        <button
          type="button"
          className="btn-vaciar"
          onClick={handleLimpiarFiltros}
        >
          Limpiar filtros
        </button>
      </div>

      {/* TABLA DE INVENTARIO */}
      <div className="scroll-table">
        <table>
          <thead>
            <tr>
              <th
                onClick={() => handleSort("c")}
                style={{ cursor: "pointer", userSelect: "none", textAlign: "center" }}
                title="Ordenar por Código"
              >
                Código {sortCol === "c" ? (sortAsc ? "▲" : "▼") : "⇅"}
              </th>
              <th
                onClick={() => handleSort("n")}
                style={{ cursor: "pointer", userSelect: "none", textAlign: "center" }}
                title="Ordenar por Instrumento"
              >
                Instrumento {sortCol === "n" ? (sortAsc ? "▲" : "▼") : "⇅"}
              </th>
              <th
                onClick={() => handleSort("s")}
                style={{ cursor: "pointer", userSelect: "none", textAlign: "center" }}
                title="Ordenar por Sector"
              >
                Sector {sortCol === "s" ? (sortAsc ? "▲" : "▼") : "⇅"}
              </th>
              <th
                onClick={() => handleSort("e")}
                style={{ cursor: "pointer", userSelect: "none", textAlign: "center" }}
                title="Ordenar por Estado de Calibración"
              >
                Estado Calibración {sortCol === "e" ? (sortAsc ? "▲" : "▼") : "⇅"}
              </th>
              <th
                onClick={() => handleSort("disp")}
                style={{ cursor: "pointer", userSelect: "none", textAlign: "center" }}
                title="Ordenar por Disponibilidad"
              >
                Custodia / Disponibilidad {sortCol === "disp" ? (sortAsc ? "▲" : "▼") : "⇅"}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    padding: "24px",
                    color: "var(--soft)"
                  }}
                >
                  No se encontraron instrumentos que coincidan con la búsqueda
                </td>
              </tr>
            ) : (
              filtrados.slice(0, invLimit).map((item, idx) => {
                const mov = usoMap.get(item.c.trim().toUpperCase());
                const estUpper = (item.e || "").toUpperCase();

                const isVencido = estUpper.includes("VENC") && !estUpper.includes("POR");
                const isPorVencer = estUpper.includes("POR VENCER") || estUpper.includes("PROX");

                return (
                  <tr key={`${item.c}_${idx}`}>
                    <td className="mono" style={{ textAlign: "center" }}>
                      {item.c}
                    </td>
                    <td style={{ fontWeight: 600, textAlign: "left" }}>
                      {item.n}
                    </td>
                    <td style={{ color: "var(--soft)", textAlign: "center" }}>
                      {item.s || "—"}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {isVencido ? (
                        <span className="badge bw">VENCIDO</span>
                      ) : isPorVencer ? (
                        <span className="est-warn">POR VENCER</span>
                      ) : (
                        <span className="badge bg">
                          {item.e || "CALIBRADO"}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {mov ? (
                        <span
                          className="badge bw"
                          title={`Retirado por ${mov.nombre} (Leg. ${mov.legajo}) ${mov.maquina ? `en ${mov.maquina}` : ""}`}
                        >
                          EN USO · Leg. {mov.legajo} {mov.maquina ? `(${mov.maquina})` : ""}
                        </span>
                      ) : (
                        <span className="badge bg">DISPONIBLE</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* BARRA DE PAGINACIÓN */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "12px",
          fontSize: "12px",
          color: "var(--soft)",
          flexWrap: "wrap",
          gap: "8px"
        }}
      >
        <span>
          Mostrando {Math.min(invLimit, filtrados.length)} de {filtrados.length} instrumentos (Total catálogo: {instrumentos.length})
        </span>

        {filtrados.length > invLimit && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="btn-vaciar"
              style={{ color: "var(--blue)", fontWeight: 700 }}
              onClick={() => setInvLimit(prev => prev + 100)}
            >
              + Cargar 100 más
            </button>
            <button
              type="button"
              className="btn-vaciar"
              style={{ color: "var(--blue)", fontWeight: 700 }}
              onClick={() => setInvLimit(filtrados.length)}
            >
              Mostrar todos ({filtrados.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
