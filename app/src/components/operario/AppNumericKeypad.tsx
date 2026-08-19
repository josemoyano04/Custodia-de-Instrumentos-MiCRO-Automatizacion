import React from "react";

export type TargetInputType = "operario" | "maquina" | "instrumento";

interface AppNumericKeypadProps {
  activeTarget: TargetInputType;
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

export const AppNumericKeypad: React.FC<AppNumericKeypadProps> = ({
  activeTarget,
  onKeyPress,
  onBackspace,
  onClear
}) => {
  const getTargetLabel = () => {
    switch (activeTarget) {
      case "operario":
        return "Buscando Legajo / Operario";
      case "maquina":
        return "Buscando Máquina / Sector";
      case "instrumento":
        return "Buscando Instrumento";
      default:
        return "Teclado Rápido";
    }
  };

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["-", "0", "⌫"]
  ];

  return (
    <div className="card app-numeric-keypad-card" style={{ marginTop: "10px" }}>
      <div className="ctop"></div>
      <div className="cbody" style={{ padding: "10px 12px" }}>
        <div
          className="clabel"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
            fontSize: "10.5px"
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ fontSize: "12px" }}>🔢</span>
            <span>{getTargetLabel()}</span>
          </span>
          <button
            type="button"
            className="btn-vaciar"
            onClick={onClear}
            style={{ fontSize: "10px", padding: "1px 6px" }}
            title="Limpiar campo activo"
          >
            Limpiar
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "6px"
          }}
        >
          {keys.map((row, rIdx) =>
            row.map((key) => {
              const isBackspace = key === "⌫";
              const isDash = key === "-";

              return (
                <button
                  key={`${rIdx}-${key}`}
                  type="button"
                  className="app-pad-key"
                  onClick={() => {
                    if (isBackspace) {
                      onBackspace();
                    } else {
                      onKeyPress(key);
                    }
                  }}
                  style={{
                    height: "40px",
                    borderRadius: "8px",
                    border: "1.5px solid var(--border)",
                    background: isBackspace
                      ? "var(--surface-hover)"
                      : isDash
                      ? "var(--info-bg)"
                      : "var(--surface)",
                    color: isBackspace
                      ? "var(--warn)"
                      : isDash
                      ? "var(--blue-d)"
                      : "var(--text)",
                    fontSize: isBackspace ? "15px" : "15px",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all .12s ease-in-out",
                    fontFamily: "var(--font)",
                    userSelect: "none"
                  }}
                >
                  {key}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
