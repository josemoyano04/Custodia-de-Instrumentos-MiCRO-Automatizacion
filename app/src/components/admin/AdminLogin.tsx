import React, { useState } from "react";

interface AdminLoginProps {
  onLogin: (pass: string) => boolean;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [passInput, setPassInput] = useState<string>("");
  const [passError, setPassError] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(passInput);
    if (!success) {
      setPassError(true);
      setPassInput("");
    }
  };

  return (
    <div
      className="card admin-login-card"
      style={{
        maxWidth: "380px",
        minHeight: "380px",
        margin: "40px auto 0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}
    >
      <div className="ctop"></div>
      <div className="cbody" style={{ textAlign: "center", padding: "34px 26px" }}>
        <div className="clabel" style={{ justifyContent: "center", fontSize: "14px", marginBottom: "16px" }}>
          Acceso Administrador
        </div>
        <p style={{ fontSize: "12.5px", color: "var(--soft)", marginBottom: "20px" }}>
          Ingresá la clave maestra para acceder a métricas, inventario y gestión de PINs.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginBottom: "16px" }}>
            <label style={{ textAlign: "left" }}>Contraseña</label>
            <input
              type="password"
              placeholder="Ingresá la clave…"
              value={passInput}
              onChange={(e) => {
                setPassInput(e.target.value);
                if (passError) setPassError(false);
              }}
              style={{ height: "42px", fontSize: "15px" }}
              autoFocus
            />
          </div>
          {passError && (
            <div className="alert warn" style={{ display: "block", marginBottom: "14px" }}>
              Contraseña incorrecta.
            </div>
          )}
          <button
            type="submit"
            className="btn btn-ret"
            style={{ width: "100%", height: "42px", fontSize: "14px", fontWeight: 800 }}
          >
            Ingresar al Panel
          </button>
        </form>
      </div>
    </div>
  );
};
