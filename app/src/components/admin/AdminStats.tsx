import React from "react";

interface AdminStatsProps {
  enUsoCount: number;
  totalInventario: number | string;
  movsHoyCount: number;
}

export const AdminStats: React.FC<AdminStatsProps> = ({
  enUsoCount,
  totalInventario,
  movsHoyCount
}) => {
  return (
    <div className="stats">
      <div className="scard sw">
        <div className="snum">{enUsoCount}</div>
        <div className="slbl">En Uso Actualmente</div>
      </div>
      <div className="scard sb">
        <div className="snum">{totalInventario || "—"}</div>
        <div className="slbl">Total Inventario</div>
      </div>
      <div className="scard sg">
        <div className="snum">{movsHoyCount}</div>
        <div className="slbl">Movimientos Hoy</div>
      </div>
    </div>
  );
};
