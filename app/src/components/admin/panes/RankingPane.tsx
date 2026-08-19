import React from "react";

interface RankingPaneProps {
  rankingSorted: { cod: string; nom: string; count: number }[];
  rankingMax: number;
}

export const RankingPane: React.FC<RankingPaneProps> = ({
  rankingSorted,
  rankingMax
}) => {
  return (
    <div className="adm-pane on">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "12px 0"
        }}
      >
        {rankingSorted.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "18px",
              color: "var(--soft)"
            }}
          >
            Sin datos de uso aún
          </div>
        ) : (
          rankingSorted.map((x, i) => {
            const pct = Math.round((x.count / rankingMax) * 100);
            return (
              <div
                key={`${x.cod}_${x.nom}_${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--soft)",
                    minWidth: "20px",
                    textAlign: "right"
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "10px",
                    color: "var(--blue)",
                    minWidth: "78px",
                    flexShrink: 0
                  }}
                >
                  {x.cod}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    flex: 2,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {x.nom}
                </span>
                <div className="rank-bar-wrap">
                  <div className="rank-bar" style={{ width: `${pct}%` }}></div>
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--blue-d)",
                    minWidth: "28px",
                    textAlign: "right"
                  }}
                >
                  {x.count}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
