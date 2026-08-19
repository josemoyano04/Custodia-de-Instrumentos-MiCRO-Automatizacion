import React, { useState, useMemo } from "react";
import type { VencimientoCalibracion } from "../../../types";

interface CalibracionesPaneProps {
  calibList: VencimientoCalibracion[];
  loadingCalib: boolean;
}

export const CalibracionesPane: React.FC<CalibracionesPaneProps> = ({
  calibList,
  loadingCalib
}) => {
  const [fltCalib, setFltCalib] = useState<string>("");
  const [calibSortCol, setCalibSortCol] = useState<keyof VencimientoCalibracion>("vencimiento");
  const [calibSortAsc, setCalibSortAsc] = useState<boolean>(true);
  const [calibLimit, setCalibLimit] = useState<number>(100);

  const calibFiltradosYOrdenados = useMemo(() => {
    const q = fltCalib.trim().toUpperCase();
    return calibList
      .filter(x => {
        if (!q) return true;
        return (
          x.instrumento.toUpperCase().includes(q) ||
          x.codigo.toUpperCase().includes(q) ||
          x.sector.toUpperCase().includes(q)
        );
      })
      .sort((a, b) => {
        const vA: any = a[calibSortCol] ?? "";
        const vB: any = b[calibSortCol] ?? "";
        if (typeof vA === "string" && typeof vB === "string") {
          return calibSortAsc ? vA.localeCompare(vB) : vB.localeCompare(vA);
        }
        return calibSortAsc ? (vA > vB ? 1 : -1) : (vA < vB ? 1 : -1);
      });
  }, [calibList, fltCalib, calibSortCol, calibSortAsc]);

  const atencionCount = useMemo(() => {
    return calibList.filter(x => x.estado === "VENCIDO" || x.estado === "POR VENCER").length;
  }, [calibList]);

  const handleSort = (col: keyof VencimientoCalibracion) => {
    if (calibSortCol === col) {
      setCalibSortAsc(!calibSortAsc);
    } else {
      setCalibSortCol(col);
      setCalibSortAsc(true);
    }
  };

  return (
    <div className="adm-pane on">
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "10px",
          flexWrap: "wrap",
          alignItems: "center"
        }}
      >
        <input
          type="text"
          placeholder="Buscar por código, nombre o sector…"
          style={{ width: "280px" }}
          value={fltCalib}
          onChange={(e) => {
            setFltCalib(e.target.value);
            setCalibLimit(100);
          }}
        />
        <span style={{ fontSize: "11.5px", color: "var(--soft)", fontWeight: 700 }}>
          {atencionCount} instrumentos requieren atención
        </span>
      </div>

      {loadingCalib ? (
        <div className="inst-loading">Cargando vencimientos…</div>
      ) : (
        <>
          <div className="scroll-table">
            <table>
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort("codigo")}
                    style={{ cursor: "pointer", userSelect: "none", textAlign: "center" }}
                    title="Ordenar por Código"
                  >
                    Código {calibSortCol === "codigo" ? (calibSortAsc ? "▲" : "▼") : "⇅"}
                  </th>
                  <th
                    onClick={() => handleSort("instrumento")}
                    style={{ cursor: "pointer", userSelect: "none", textAlign: "center" }}
                    title="Ordenar por Instrumento"
                  >
                    Instrumento {calibSortCol === "instrumento" ? (calibSortAsc ? "▲" : "▼") : "⇅"}
                  </th>
                  <th
                    onClick={() => handleSort("sector")}
                    style={{ cursor: "pointer", userSelect: "none", textAlign: "center" }}
                    title="Ordenar por Sector"
                  >
                    Sector {calibSortCol === "sector" ? (calibSortAsc ? "▲" : "▼") : "⇅"}
                  </th>
                  <th
                    onClick={() => handleSort("calibrado")}
                    style={{ cursor: "pointer", userSelect: "none", textAlign: "center" }}
                    title="Ordenar por Última Calibración"
                  >
                    Última Calibración {calibSortCol === "calibrado" ? (calibSortAsc ? "▲" : "▼") : "⇅"}
                  </th>
                  <th
                    onClick={() => handleSort("vencimiento")}
                    style={{ cursor: "pointer", userSelect: "none", textAlign: "center" }}
                    title="Ordenar por Vencimiento"
                  >
                    Vencimiento {calibSortCol === "vencimiento" ? (calibSortAsc ? "▲" : "▼") : "⇅"}
                  </th>
                  <th
                    onClick={() => handleSort("estado")}
                    style={{ cursor: "pointer", userSelect: "none", textAlign: "center" }}
                    title="Ordenar por Estado"
                  >
                    Estado {calibSortCol === "estado" ? (calibSortAsc ? "▲" : "▼") : "⇅"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {calibFiltradosYOrdenados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: "18px",
                        color: "var(--soft)"
                      }}
                    >
                      Sin datos de calibración registrados
                    </td>
                  </tr>
                ) : (
                  calibFiltradosYOrdenados.slice(0, calibLimit).map((x, idx) => (
                    <tr key={`${x.codigo}_${x.instrumento}_${idx}`}>
                      <td className="mono" style={{ textAlign: "center" }}>
                        {x.codigo}
                      </td>
                      <td style={{ fontWeight: 600, textAlign: "left" }}>
                        {x.instrumento}
                      </td>
                      <td style={{ color: "var(--soft)", textAlign: "center" }}>
                        {x.sector}
                      </td>
                      <td style={{ textAlign: "center", fontSize: "12px" }}>
                        {x.calibrado || "—"}
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          fontWeight: 700,
                          color:
                            x.estado === "VENCIDO"
                              ? "var(--warn)"
                              : x.estado === "POR VENCER"
                              ? "var(--amber)"
                              : "var(--ok)"
                        }}
                      >
                        {x.vencimiento || "—"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {x.estado === "VENCIDO" ? (
                          <span className="badge bw">VENCIDO</span>
                        ) : x.estado === "POR VENCER" ? (
                          <span className="est-warn">
                            Vence en {x.diasRestantes !== undefined ? `${x.diasRestantes} días` : "próx."}
                          </span>
                        ) : (
                          <span className="badge bg">CALIBRADO</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {calibFiltradosYOrdenados.length > calibLimit && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "10px",
                fontSize: "12px",
                color: "var(--soft)"
              }}
            >
              <span>
                Mostrando {calibLimit} de {calibFiltradosYOrdenados.length} instrumentos
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="btn-vaciar"
                  style={{ color: "var(--blue)" }}
                  onClick={() => setCalibLimit(prev => prev + 100)}
                >
                  + Cargar 100 más
                </button>
                <button
                  type="button"
                  className="btn-vaciar"
                  style={{ color: "var(--blue)" }}
                  onClick={() => setCalibLimit(calibFiltradosYOrdenados.length)}
                >
                  Mostrar todos ({calibFiltradosYOrdenados.length})
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
