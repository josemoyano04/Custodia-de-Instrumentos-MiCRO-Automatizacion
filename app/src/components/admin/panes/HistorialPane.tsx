import React, { useState, useMemo } from "react";
import type { Movimiento } from "../../../types";

interface HistorialPaneProps {
  histList: Movimiento[];
  fmtFecha: (s?: string) => string;
  fmtHora: (s?: string) => string;
  onExportarPeriodo: (desde: string, hasta: string) => void;
}

export const HistorialPane: React.FC<HistorialPaneProps> = ({
  histList,
  fmtFecha,
  fmtHora,
  onExportarPeriodo
}) => {
  const [fltLeg, setFltLeg] = useState<string>("");
  const [fltInst, setFltInst] = useState<string>("");
  const [expDesde, setExpDesde] = useState<string>("");
  const [expHasta, setExpHasta] = useState<string>("");
  const [histLimit, setHistLimit] = useState<number>(100);

  const histFiltrados = useMemo(() => {
    const legQ = fltLeg.trim().toLowerCase();
    const instQ = fltInst.trim().toLowerCase();
    return histList.filter(m => {
      if (legQ && !String(m.legajo).toLowerCase().includes(legQ)) return false;
      if (
        instQ &&
        !m.codInstrumento.toLowerCase().includes(instQ) &&
        !m.instrumento.toLowerCase().includes(instQ)
      ) {
        return false;
      }
      return true;
    });
  }, [histList, fltLeg, fltInst]);

  const handleLimpiarFiltros = () => {
    setFltLeg("");
    setFltInst("");
    setExpDesde("");
    setExpHasta("");
    setHistLimit(100);
  };

  return (
    <div className="adm-pane on">
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "10px",
          flexWrap: "wrap",
          alignItems: "center"
        }}
      >
        <input
          type="text"
          placeholder="Filtrar por Legajo…"
          style={{ width: "120px" }}
          value={fltLeg}
          onChange={(e) => {
            setFltLeg(e.target.value);
            setHistLimit(100);
          }}
        />
        <input
          type="text"
          placeholder="Filtrar por Código…"
          style={{ width: "130px" }}
          value={fltInst}
          onChange={(e) => {
            setFltInst(e.target.value);
            setHistLimit(100);
          }}
        />
        <input
          type="text"
          placeholder="Desde (dd/mm/yyyy)"
          style={{ width: "125px" }}
          value={expDesde}
          onChange={(e) => setExpDesde(e.target.value)}
        />
        <input
          type="text"
          placeholder="Hasta (dd/mm/yyyy)"
          style={{ width: "125px" }}
          value={expHasta}
          onChange={(e) => setExpHasta(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-ret"
          style={{ height: "36px", padding: "0 12px", fontSize: "11px", fontWeight: 700 }}
          onClick={() => onExportarPeriodo(expDesde, expHasta)}
        >
          Exportar CSV
        </button>
        <button
          type="button"
          className="btn-vaciar"
          onClick={handleLimpiarFiltros}
        >
          Limpiar filtros
        </button>
      </div>

      <div className="scroll-table">
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>Código</th>
              <th style={{ textAlign: "center" }}>Instrumento</th>
              <th style={{ textAlign: "center" }}>Legajo</th>
              <th style={{ textAlign: "center" }}>Operario</th>
              <th style={{ textAlign: "center" }}>Sector</th>
              <th style={{ textAlign: "center" }}>Máquina</th>
              <th style={{ textAlign: "center" }}>Retiro</th>
              <th style={{ textAlign: "center" }}>Devolución</th>
              <th style={{ textAlign: "center" }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {histFiltrados.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    textAlign: "center",
                    padding: "18px",
                    color: "var(--soft)"
                  }}
                >
                  Sin movimientos registrados
                </td>
              </tr>
            ) : (
              histFiltrados.slice(0, histLimit).map((m, idx) => (
                <tr key={idx}>
                  <td className="mono" style={{ textAlign: "center" }}>
                    {m.codInstrumento}
                  </td>
                  <td style={{ fontWeight: 600, textAlign: "left" }}>
                    {m.instrumento}
                  </td>
                  <td className="mono" style={{ textAlign: "center" }}>
                    {m.legajo}
                  </td>
                  <td style={{ fontWeight: 700, textAlign: "left" }}>
                    {m.nombre}
                  </td>
                  <td style={{ color: "var(--soft)", textAlign: "center" }}>
                    {m.sector}
                  </td>
                  <td style={{ textAlign: "center", fontWeight: 600 }}>
                    {m.maquina || "—"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {fmtFecha(m.fechaRetiro)}
                    <br />
                    <small style={{ color: "var(--muted)", fontWeight: 600 }}>
                      {fmtHora(m.horaRetiro)}
                    </small>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {m.fechaDevolucion ? (
                      <>
                        {fmtFecha(m.fechaDevolucion)}
                        <br />
                        <small style={{ color: "var(--muted)", fontWeight: 600 }}>
                          {fmtHora(m.horaDevolucion)}
                        </small>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      className={`badge ${
                        m.estado === "EN USO" ? "bw" : "bg"
                      }`}
                    >
                      {m.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {histFiltrados.length > histLimit && (
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
            Mostrando {histLimit} de {histFiltrados.length} movimientos
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="btn-vaciar"
              style={{ color: "var(--blue)" }}
              onClick={() => setHistLimit(prev => prev + 100)}
            >
              + Cargar 100 más
            </button>
            <button
              type="button"
              className="btn-vaciar"
              style={{ color: "var(--blue)" }}
              onClick={() => setHistLimit(histFiltrados.length)}
            >
              Mostrar todos ({histFiltrados.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
