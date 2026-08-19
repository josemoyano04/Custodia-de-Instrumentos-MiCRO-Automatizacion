import React from "react";
import type { Movimiento } from "../../../types";

interface FueraDePlazoPaneProps {
  vencidosUso: (Movimiento & { horas: number })[];
  fmtFecha: (s?: string) => string;
}

export const FueraDePlazoPane: React.FC<FueraDePlazoPaneProps> = ({
  vencidosUso,
  fmtFecha
}) => {
  return (
    <div className="adm-pane on">
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
              <th style={{ textAlign: "center" }}>Retirado</th>
              <th style={{ textAlign: "center" }}>Tiempo en Uso</th>
            </tr>
          </thead>
          <tbody>
            {vencidosUso.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    textAlign: "center",
                    padding: "18px",
                    color: "var(--soft)"
                  }}
                >
                  No hay instrumentos fuera de plazo (&gt;24h) ✓
                </td>
              </tr>
            ) : (
              vencidosUso.map((m, idx) => (
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
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className="badge bw">{m.horas}h en uso</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
