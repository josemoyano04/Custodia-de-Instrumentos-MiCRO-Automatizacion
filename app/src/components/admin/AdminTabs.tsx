import React from "react";

export type AdminTab = "uso" | "inv" | "hist" | "calib" | "nodv" | "rank" | "pin" | "config";

interface AdminTabsProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  enUsoCount: number;
  totalInventario: number | string;
  nVenc: number;
  nPorV: number;
  vencidosUsoCount: number;
  operariosCount: number;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({
  activeTab,
  onTabChange,
  enUsoCount,
  totalInventario,
  nVenc,
  nPorV,
  vencidosUsoCount,
  operariosCount
}) => {
  return (
    <div className="adm-tabs">
      <button
        className={`adm-tab ${activeTab === "uso" ? "on" : ""}`}
        onClick={() => onTabChange("uso")}
      >
        En Uso ({enUsoCount})
      </button>

      <button
        className={`adm-tab ${activeTab === "inv" ? "on" : ""}`}
        onClick={() => onTabChange("inv")}
      >
        Inventario ({totalInventario})
      </button>

      <button
        className={`adm-tab ${activeTab === "hist" ? "on" : ""}`}
        onClick={() => onTabChange("hist")}
      >
        Historial
      </button>

      <button
        className={`adm-tab ${activeTab === "calib" ? "on" : ""}`}
        onClick={() => onTabChange("calib")}
      >
        Vencimientos
        {nVenc > 0 && <span className="adm-badge-warn">{nVenc}</span>}
        {nPorV > 0 && <span className="adm-badge-amber">{nPorV} próx.</span>}
      </button>

      <button
        className={`adm-tab ${activeTab === "nodv" ? "on" : ""}`}
        onClick={() => onTabChange("nodv")}
      >
        Fuera de Plazo
        {vencidosUsoCount > 0 && (
          <span className="adm-badge-amber">{vencidosUsoCount}</span>
        )}
      </button>

      <button
        className={`adm-tab ${activeTab === "rank" ? "on" : ""}`}
        onClick={() => onTabChange("rank")}
      >
        Ranking de Uso
      </button>

      <button
        className={`adm-tab ${activeTab === "pin" ? "on" : ""}`}
        onClick={() => onTabChange("pin")}
      >
        Operarios ({operariosCount})
      </button>

      <button
        className={`adm-tab ${activeTab === "config" ? "on" : ""}`}
        onClick={() => onTabChange("config")}
      >
        ⚙️ Configuración
      </button>
    </div>
  );
};
