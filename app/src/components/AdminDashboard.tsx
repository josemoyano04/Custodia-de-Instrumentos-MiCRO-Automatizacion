import React, { useState, useEffect } from "react";
import type { Instrumento, Movimiento, VencimientoCalibracion, PinRegistro } from "../types";
import {
  ADMIN_PASS,
  LEGAJOS,
  fetchMovimientosEnUso,
  fetchHistorialMovimientos,
  fetchVencimientosCalibracion,
  fetchPinesOperarios,
  blanquearPinOperario,
  guardarPinOperario
} from "../services/dataService";

interface AdminDashboardProps {
  instrumentos: Instrumento[];
  onLogout: () => void;
}

type AdminTab = "uso" | "hist" | "calib" | "nodv" | "rank" | "pin";

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ instrumentos, onLogout }) => {
  const [isLogged, setIsLogged] = useState<boolean>(Boolean(sessionStorage.getItem("adm")));
  const [passInput, setPassInput] = useState<string>("");
  const [passError, setPassError] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<AdminTab>("uso");
  const [usoList, setUsoList] = useState<Movimiento[]>([]);
  const [histList, setHistList] = useState<Movimiento[]>([]);
  const [calibList, setCalibList] = useState<VencimientoCalibracion[]>([]);
  const [pinList, setPinList] = useState<PinRegistro[]>([]);
  const [loadingCalib, setLoadingCalib] = useState<boolean>(false);
  const [loadingPins, setLoadingPins] = useState<boolean>(false);
  const [pinMsg, setPinMsg] = useState<{ type: "ok" | "warn"; text: string } | null>(null);

  // Modal Asignar PIN
  const [modalPinOpen, setModalPinOpen] = useState<boolean>(false);
  const [targetLegajo, setTargetLegajo] = useState<string>("");
  const [nuevoPinVal, setNuevoPinVal] = useState<string>("");
  const [savingPin, setSavingPin] = useState<boolean>(false);

  // Modal Confirmación Blanqueo de PIN
  const [blanqueoTarget, setBlanqueoTarget] = useState<number | null>(null);
  const [blanqueando, setBlanqueando] = useState<boolean>(false);

  // Filtros
  const [fltLeg, setFltLeg] = useState<string>("");
  const [fltInst, setFltInst] = useState<string>("");
  const [fltCalib, setFltCalib] = useState<string>("");
  const [fltPin, setFltPin] = useState<string>("");
  const [expDesde, setExpDesde] = useState<string>("");
  const [expHasta, setExpHasta] = useState<string>("");

  // Ordenamiento de tabla de Vencimientos
  const [calibSortCol, setCalibSortCol] = useState<keyof VencimientoCalibracion>("vencimiento");
  const [calibSortAsc, setCalibSortAsc] = useState<boolean>(true);

  useEffect(() => {
    if (isLogged) {
      cargarAdminData();
    }
  }, [isLogged]);

  // ─── Carga de datos a través de la capa de servicios ───────────────────────

  const cargarAdminData = async () => {
    try {
      const [enUso, hist] = await Promise.all([
        fetchMovimientosEnUso(),
        fetchHistorialMovimientos(500)
      ]);
      setUsoList(enUso);
      setHistList(hist);
      cargarPines();
      cargarVencimientos();
    } catch (e) {
      console.warn("Admin data load error:", e);
    }
  };

  const cargarVencimientos = async () => {
    setLoadingCalib(true);
    try {
      const data = await fetchVencimientosCalibracion();
      setCalibList(data);
    } catch (e) {
      console.warn("Vencimientos error:", e);
    }
    setLoadingCalib(false);
  };

  const cargarPines = async () => {
    setLoadingPins(true);
    try {
      const data = await fetchPinesOperarios();
      setPinList(data);
    } catch (e) {
      console.warn("Pines error:", e);
    }
    setLoadingPins(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passInput === ADMIN_PASS) {
      sessionStorage.setItem("adm", "1");
      setIsLogged(true);
      setPassError(false);
    } else {
      setPassError(true);
      setPassInput("");
    }
  };

  const handleLogoutClick = () => {
    sessionStorage.removeItem("adm");
    setIsLogged(false);
    onLogout();
  };

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    if (tab === "calib" && !calibList.length) cargarVencimientos();
    if (tab === "pin") cargarPines();
  };

  const nombreLeg = (leg: number) => {
    return LEGAJOS.find(x => String(x.leg) === String(leg)) || null;
  };

  const handleConfirmarBlanqueo = async () => {
    if (!blanqueoTarget) return;
    const leg = blanqueoTarget;
    const p = nombreLeg(leg);
    setBlanqueando(true);
    try {
      const res = await blanquearPinOperario(leg);
      if (res.ok) {
        setPinMsg({ type: "ok", text: `✓ PIN blanqueado exitosamente — legajo ${leg}${p ? ` · ${p.nombre}` : ""}.` });
        setTimeout(() => setPinMsg(null), 6000);
        setBlanqueoTarget(null);
        cargarPines();
      } else {
        setPinMsg({ type: "warn", text: `Error: ${res.error || "No se pudo blanquear el PIN"}` });
      }
    } catch (e) {
      setPinMsg({ type: "warn", text: "Error de conexión." });
    }
    setBlanqueando(false);
  };

  const handleGuardarNuevoPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const legNum = parseInt(targetLegajo.trim(), 10);
    const pinStr = nuevoPinVal.trim();

    if (!legNum || isNaN(legNum)) {
      alert("Ingresá un número de legajo válido.");
      return;
    }

    if (!/^\d{4}$/.test(pinStr)) {
      alert("El PIN debe contener exactamente 4 dígitos numéricos.");
      return;
    }

    setSavingPin(true);
    try {
      const res = await guardarPinOperario(legNum, pinStr);
      if (!res.ok) throw new Error(res.error || "Error al guardar PIN");

      const p = nombreLeg(legNum);
      setPinMsg({ type: "ok", text: `✓ PIN ${pinStr} asignado exitosamente al legajo ${legNum}${p ? ` (${p.nombre})` : ""}.` });
      setTimeout(() => setPinMsg(null), 6000);

      setModalPinOpen(false);
      setTargetLegajo("");
      setNuevoPinVal("");
      cargarPines();
    } catch (err: any) {
      setPinMsg({ type: "warn", text: `Error: ${err.message}` });
    }
    setSavingPin(false);
  };

  const fmtFecha = (v?: string) => {
    if (!v) return "—";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return v;
    const m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    const d = new Date(v);
    return !isNaN(d.getTime())
      ? d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Argentina/Cordoba" })
      : v;
  };

  const fmtHora = (v?: string) => {
    if (!v) return "—";
    const m = v.match(/^(\d{2}:\d{2})/);
    if (m) return m[1];
    const d = new Date(v);
    return !isNaN(d.getTime())
      ? d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Cordoba" })
      : v;
  };

  const parseFechaStr = (s?: string) => {
    if (!s || !s.trim()) return null;
    const str = s.trim();
    const p = str.split("/");
    if (p.length === 3 && p[2].length === 4) {
      const d = new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
      d.setHours(0, 0, 0, 0);
      return d;
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      d.setHours(0, 0, 0, 0);
      return d;
    }
    return null;
  };

  const exportarPeriodo = () => {
    const desde = parseFechaStr(expDesde);
    const hastaD = parseFechaStr(expHasta);
    if (hastaD) hastaD.setHours(23, 59, 59, 999);

    let data = [...histList];
    if (fltLeg) data = data.filter(m => String(m.legajo) === fltLeg.trim());
    if (fltInst) data = data.filter(m => m.codInstrumento.toUpperCase().includes(fltInst.trim().toUpperCase()) || m.instrumento.toUpperCase().includes(fltInst.trim().toUpperCase()));
    if (desde || hastaD) {
      data = data.filter(m => {
        const f = parseFechaStr(m.fechaRetiro);
        if (!f) return false;
        if (desde && f < desde) return false;
        if (hastaD && f > hastaD) return false;
        return true;
      });
    }

    if (!data.length) {
      alert("Sin registros para el periodo seleccionado.");
      return;
    }

    const sep = ",";
    const nl = "\r\n";
    const q = (c: any) => `"${String(c || "").replace(/"/g, '""')}"`;
    const header = ["Codigo", "Instrumento", "Legajo", "Nombre", "Sector", "Maquina", "Fecha retiro", "Hora retiro", "Fecha devolucion", "Hora devolucion", "Estado"];
    let csv = header.map(q).join(sep) + nl;

    data.forEach(m => {
      const row = [
        m.codInstrumento,
        m.instrumento,
        m.legajo,
        m.nombre,
        m.sector,
        m.maquina || "",
        fmtFecha(m.fechaRetiro),
        fmtHora(m.horaRetiro),
        m.fechaDevolucion ? fmtFecha(m.fechaDevolucion) : "",
        m.horaDevolucion ? fmtHora(m.horaDevolucion) : "",
        m.estado
      ];
      csv += row.map(q).join(sep) + nl;
    });

    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historial_${expDesde || "inicio"}_al_${expHasta || "hoy"}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Cálculos precisos de No Devueltos > 24h (86.400.000 ms)
  const ahoraMs = Date.now();
  const vencidosUso = usoList
    .map(m => {
      let retiroMs: number | null = null;
      const fStr = (m.fechaRetiro || "").trim();
      const hStr = (m.horaRetiro || "00:00:00").trim();

      if (/^\d{4}-\d{2}-\d{2}$/.test(fStr)) {
        const timePart = hStr.length === 5 ? `${hStr}:00` : hStr;
        const d = new Date(`${fStr}T${timePart}`);
        if (!isNaN(d.getTime())) retiroMs = d.getTime();
      } else {
        const p = fStr.split("/");
        if (p.length === 3) {
          const hp = hStr.split(":");
          const d = new Date(
            parseInt(p[2]),
            parseInt(p[1]) - 1,
            parseInt(p[0]),
            parseInt(hp[0] || "0"),
            parseInt(hp[1] || "0"),
            parseInt(hp[2] || "0")
          );
          if (!isNaN(d.getTime())) retiroMs = d.getTime();
        }
      }

      if (!retiroMs) return null;

      const diffMs = ahoraMs - retiroMs;
      const horas = Math.floor(diffMs / 3600000);
      return horas >= 24 ? { ...m, horas } : null;
    })
    .filter((x): x is Movimiento & { horas: number } => x !== null)
    .sort((a, b) => b.horas - a.horas);

  // Ranking
  const rankingMap: { [key: string]: { cod: string; nom: string; count: number } } = {};
  histList.forEach(m => {
    const k = m.codInstrumento;
    if (!rankingMap[k]) rankingMap[k] = { cod: k, nom: m.instrumento, count: 0 };
    rankingMap[k].count++;
  });
  const rankingSorted = Object.values(rankingMap).sort((a, b) => b.count - a.count).slice(0, 20);
  const rankingMax = rankingSorted.length ? rankingSorted[0].count : 1;

  if (!isLogged) {
    return (
      <div className="card admin-login-card" style={{ maxWidth: "380px", minHeight: "380px", margin: "40px auto 0", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="ctop"></div>
        <div className="cbody" style={{ textAlign: "center", padding: "34px 26px" }}>
          <div className="clabel" style={{ justifyContent: "center", fontSize: "14px", marginBottom: "16px" }}>
            Acceso Administrador
          </div>
          <p style={{ fontSize: "12.5px", color: "var(--soft)", marginBottom: "20px" }}>
            Ingresá la clave maestra para acceder a métricas, inventario y gestión de PINs.
          </p>
          <form onSubmit={handleLogin}>
            <div className="field" style={{ marginBottom: "16px" }}>
              <label style={{ textAlign: "left" }}>Contraseña</label>
              <input
                type="password"
                placeholder="Ingresá la clave…"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                style={{ height: "42px", fontSize: "15px" }}
                autoFocus
              />
            </div>
            {passError && <div className="alert warn" style={{ display: "block", marginBottom: "14px" }}>Contraseña incorrecta.</div>}
            <button type="submit" className="btn btn-ret" style={{ width: "100%", height: "42px", fontSize: "14px", fontWeight: 800 }}>
              Ingresar al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Cálculo de Movimientos Hoy
  const hoyISO = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Cordoba" }); // YYYY-MM-DD
  const hoyArg = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Argentina/Cordoba" });

  const movsHoyCount = histList.filter(m => {
    const rDate = (m.fechaRetiro || "").trim();
    const dDate = (m.fechaDevolucion || "").trim();
    return rDate === hoyISO || rDate === hoyArg || fmtFecha(rDate) === hoyArg ||
      dDate === hoyISO || dDate === hoyArg || fmtFecha(dDate) === hoyArg;
  }).length;

  const nVenc = calibList.filter(x => x.estado === "VENCIDO").length;
  const nPorV = calibList.filter(x => x.estado === "POR VENCER").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>Panel de Gestión y Metrología</h3>
        <button
          className="btn btn-ghost btn-admin-logout"
          style={{ height: "34px", padding: "0 14px", fontSize: "11.5px", fontWeight: 800 }}
          onClick={handleLogoutClick}
        >
          Cerrar sesión
        </button>
      </div>

      <div className="stats">
        <div className="scard sw">
          <div className="snum">{usoList.length}</div>
          <div className="slbl">En Uso Actualmente</div>
        </div>
        <div className="scard sb">
          <div className="snum">{instrumentos.length || "—"}</div>
          <div className="slbl">Total Inventario</div>
        </div>
        <div className="scard sg">
          <div className="snum">{movsHoyCount}</div>
          <div className="slbl">Movimientos Hoy</div>
        </div>
      </div>

      {/* ADMIN TABS */}
      <div className="adm-tabs">
        <button className={`adm-tab ${activeTab === "uso" ? "on" : ""}`} onClick={() => handleTabChange("uso")}>
          En Uso ({usoList.length})
        </button>
        <button className={`adm-tab ${activeTab === "hist" ? "on" : ""}`} onClick={() => handleTabChange("hist")}>
          Historial Movimientos
        </button>
        <button className={`adm-tab ${activeTab === "calib" ? "on" : ""}`} onClick={() => handleTabChange("calib")}>
          Vencimientos Calibración
          {nVenc > 0 && <span className="adm-badge-warn">{nVenc}</span>}
          {nPorV > 0 && <span className="adm-badge-amber">{nPorV} próx.</span>}
        </button>
        <button className={`adm-tab ${activeTab === "nodv" ? "on" : ""}`} onClick={() => handleTabChange("nodv")}>
          Fuera de Plazo (&gt;24h)
          {vencidosUso.length > 0 && <span className="adm-badge-amber">{vencidosUso.length}</span>}
        </button>
        <button className={`adm-tab ${activeTab === "rank" ? "on" : ""}`} onClick={() => handleTabChange("rank")}>
          Ranking de Uso
        </button>
        <button className={`adm-tab ${activeTab === "pin" ? "on" : ""}`} onClick={() => handleTabChange("pin")}>
          Gestión PINs Operarios ({pinList.length})
        </button>
      </div>

      {/* PANE: EN USO */}
      <div className={`adm-pane ${activeTab === "uso" ? "on" : ""}`}>
        <div className="scroll-table">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Instrumento</th>
                <th>Legajo</th>
                <th>Nombre</th>
                <th>Sector</th>
                <th>Máquina</th>
                <th>Fecha Retiro</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody>
              {usoList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "18px", color: "var(--soft)" }}>
                    Todos los instrumentos disponibles ✓
                  </td>
                </tr>
              ) : (
                usoList.map((m, idx) => (
                  <tr key={idx}>
                    <td className="mono">{m.codInstrumento}</td>
                    <td>{m.instrumento}</td>
                    <td className="mono">{m.legajo}</td>
                    <td>{m.nombre}</td>
                    <td style={{ color: "var(--soft)" }}>{m.sector}</td>
                    <td>{m.maquina || "—"}</td>
                    <td>{fmtFecha(m.fechaRetiro)}</td>
                    <td>{fmtHora(m.horaRetiro)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PANE: HISTORIAL */}
      <div className={`adm-pane ${activeTab === "hist" ? "on" : ""}`}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Filtrar por legajo…"
            style={{ width: "140px" }}
            value={fltLeg}
            onChange={(e) => setFltLeg(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filtrar por código/instrumento…"
            style={{ width: "200px" }}
            value={fltInst}
            onChange={(e) => setFltInst(e.target.value)}
          />
          <input
            type="text"
            placeholder="Desde (dd/mm/yyyy)"
            style={{ width: "130px" }}
            value={expDesde}
            onChange={(e) => setExpDesde(e.target.value)}
          />
          <input
            type="text"
            placeholder="Hasta (dd/mm/yyyy)"
            style={{ width: "130px" }}
            value={expHasta}
            onChange={(e) => setExpHasta(e.target.value)}
          />
          <button className="btn btn-ret" style={{ height: "38px", padding: "0 14px", fontSize: "11px" }} onClick={exportarPeriodo}>
            Exportar CSV
          </button>
        </div>

        <div className="scroll-table">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Instrumento</th>
                <th>Legajo</th>
                <th>Nombre</th>
                <th>Sector</th>
                <th>Máquina</th>
                <th>Retiro</th>
                <th>Devolución</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {histList.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "18px", color: "var(--soft)" }}>
                    Sin movimientos registrados
                  </td>
                </tr>
              ) : (
                histList
                  .filter(m => !fltLeg || String(m.legajo) === fltLeg.trim())
                  .filter(m => !fltInst || m.codInstrumento.toUpperCase().includes(fltInst.trim().toUpperCase()) || m.instrumento.toUpperCase().includes(fltInst.trim().toUpperCase()))
                  .map((m, idx) => (
                    <tr key={idx}>
                      <td className="mono">{m.codInstrumento}</td>
                      <td>{m.instrumento}</td>
                      <td className="mono">{m.legajo}</td>
                      <td>{m.nombre}</td>
                      <td style={{ color: "var(--soft)" }}>{m.sector}</td>
                      <td>{m.maquina || "—"}</td>
                      <td>
                        {fmtFecha(m.fechaRetiro)}
                        <br />
                        <small style={{ color: "var(--muted)" }}>{fmtHora(m.horaRetiro)}</small>
                      </td>
                      <td>
                        {m.fechaDevolucion ? (
                          <>
                            {fmtFecha(m.fechaDevolucion)}
                            <br />
                            <small style={{ color: "var(--muted)" }}>{fmtHora(m.horaDevolucion)}</small>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <span className={`badge ${m.estado === "EN USO" ? "bw" : "bg"}`}>
                          {m.estado}
                        </span>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PANE: CALIBRACION */}
      <div className={`adm-pane ${activeTab === "calib" ? "on" : ""}`}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Buscar por código, nombre o sector…"
            style={{ width: "280px" }}
            value={fltCalib}
            onChange={(e) => setFltCalib(e.target.value)}
          />
          <span style={{ fontSize: "11.5px", color: "var(--soft)", fontWeight: 700 }}>
            {calibList.filter(x => x.estado === "VENCIDO" || x.estado === "POR VENCER").length} instrumentos requieren atención
          </span>
        </div>

        {loadingCalib ? (
          <div className="inst-loading">Cargando vencimientos…</div>
        ) : (
          <div className="scroll-table">
            <table>
              <thead>
                <tr>
                  <th
                    onClick={() => {
                      if (calibSortCol === "codigo") setCalibSortAsc(!calibSortAsc);
                      else { setCalibSortCol("codigo"); setCalibSortAsc(true); }
                    }}
                    style={{ cursor: "pointer", userSelect: "none" }}
                    title="Ordenar por Código"
                  >
                    Código {calibSortCol === "codigo" ? (calibSortAsc ? "▲" : "▼") : "⇅"}
                  </th>
                  <th
                    onClick={() => {
                      if (calibSortCol === "instrumento") setCalibSortAsc(!calibSortAsc);
                      else { setCalibSortCol("instrumento"); setCalibSortAsc(true); }
                    }}
                    style={{ cursor: "pointer", userSelect: "none" }}
                    title="Ordenar por Instrumento"
                  >
                    Instrumento {calibSortCol === "instrumento" ? (calibSortAsc ? "▲" : "▼") : "⇅"}
                  </th>
                  <th
                    onClick={() => {
                      if (calibSortCol === "sector") setCalibSortAsc(!calibSortAsc);
                      else { setCalibSortCol("sector"); setCalibSortAsc(true); }
                    }}
                    style={{ cursor: "pointer", userSelect: "none" }}
                    title="Ordenar por Sector"
                  >
                    Sector {calibSortCol === "sector" ? (calibSortAsc ? "▲" : "▼") : "⇅"}
                  </th>
                  <th
                    onClick={() => {
                      if (calibSortCol === "calibrado") setCalibSortAsc(!calibSortAsc);
                      else { setCalibSortCol("calibrado"); setCalibSortAsc(true); }
                    }}
                    style={{ cursor: "pointer", userSelect: "none" }}
                    title="Ordenar por Última Calibración"
                  >
                    Última Calibración {calibSortCol === "calibrado" ? (calibSortAsc ? "▲" : "▼") : "⇅"}
                  </th>
                  <th
                    onClick={() => {
                      if (calibSortCol === "vencimiento") setCalibSortAsc(!calibSortAsc);
                      else { setCalibSortCol("vencimiento"); setCalibSortAsc(true); }
                    }}
                    style={{ cursor: "pointer", userSelect: "none" }}
                    title="Ordenar por Vencimiento"
                  >
                    Vencimiento {calibSortCol === "vencimiento" ? (calibSortAsc ? "▲" : "▼") : "⇅"}
                  </th>
                  <th
                    onClick={() => {
                      if (calibSortCol === "estado") setCalibSortAsc(!calibSortAsc);
                      else { setCalibSortCol("estado"); setCalibSortAsc(true); }
                    }}
                    style={{ cursor: "pointer", userSelect: "none" }}
                    title="Ordenar por Estado"
                  >
                    Estado {calibSortCol === "estado" ? (calibSortAsc ? "▲" : "▼") : "⇅"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {calibList.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "18px", color: "var(--soft)" }}>
                      Sin datos de calibración
                    </td>
                  </tr>
                ) : (
                  calibList
                    .filter(x => {
                      if (!fltCalib.trim()) return x.estado === "VENCIDO" || x.estado === "POR VENCER";
                      const q = fltCalib.trim().toUpperCase();
                      return x.instrumento.toUpperCase().includes(q) || x.codigo.toUpperCase().includes(q) || x.sector.toUpperCase().includes(q);
                    })
                    .sort((a, b) => {
                      const vA: any = a[calibSortCol] ?? "";
                      const vB: any = b[calibSortCol] ?? "";
                      if (typeof vA === "string" && typeof vB === "string") {
                        return calibSortAsc ? vA.localeCompare(vB) : vB.localeCompare(vA);
                      }
                      return calibSortAsc ? (vA > vB ? 1 : -1) : (vA < vB ? 1 : -1);
                    })
                    .map((x, idx) => (
                      <tr key={idx}>
                        <td className="mono">{x.codigo}</td>
                        <td>{x.instrumento}</td>
                        <td style={{ color: "var(--soft)" }}>{x.sector}</td>
                        <td>{x.calibrado}</td>
                        <td style={{ color: x.estado === "VENCIDO" ? "var(--warn)" : x.estado === "POR VENCER" ? "#92610a" : undefined, fontWeight: 700 }}>
                          {x.vencimiento}
                        </td>
                        <td>
                          {x.estado === "VENCIDO" ? (
                            <span className="badge bw">VENCIDO</span>
                          ) : x.estado === "POR VENCER" ? (
                            <span className="est-warn">
                              {typeof x.diasRestantes === "number" ? `Vence en ${x.diasRestantes} días` : "Próximo a calibrar"}
                            </span>
                          ) : (
                            <span className="est-ok">Vigente</span>
                          )}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PANE: FUERA DE PLAZO */}
      <div className={`adm-pane ${activeTab === "nodv" ? "on" : ""}`}>
        <div className="scroll-table">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Instrumento</th>
                <th>Legajo</th>
                <th>Nombre</th>
                <th>Sector</th>
                <th>Máquina</th>
                <th>Retirado El</th>
                <th>Horas Transcurridas</th>
              </tr>
            </thead>
            <tbody>
              {vencidosUso.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "18px", color: "var(--soft)" }}>
                    Sin instrumentos fuera de plazo ✓
                  </td>
                </tr>
              ) : (
                vencidosUso.map((m, idx) => (
                  <tr key={idx}>
                    <td className="mono">{m.codInstrumento}</td>
                    <td>{m.instrumento}</td>
                    <td className="mono">{m.legajo}</td>
                    <td>{m.nombre}</td>
                    <td style={{ color: "var(--soft)" }}>{m.sector}</td>
                    <td>{m.maquina || "—"}</td>
                    <td>
                      {fmtFecha(m.fechaRetiro)} {fmtHora(m.horaRetiro)}
                    </td>
                    <td>
                      <span className="est-warn" style={{ background: "#fffbeb", color: "#92610a" }}>
                        {m.horas}h
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PANE: RANKING */}
      <div className={`adm-pane ${activeTab === "rank" ? "on" : ""}`}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "12px 0" }}>
          {rankingSorted.length === 0 ? (
            <div style={{ textAlign: "center", padding: "18px", color: "var(--soft)" }}>Sin datos de uso aún</div>
          ) : (
            rankingSorted.map((x, i) => {
              const pct = Math.round((x.count / rankingMax) * 100);
              return (
                <div key={x.cod} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--soft)", minWidth: "20px", textAlign: "right" }}>
                    {i + 1}
                  </span>
                  <span style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--blue)", minWidth: "78px", flexShrink: 0 }}>
                    {x.cod}
                  </span>
                  <span style={{ fontSize: "12px", flex: 2, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {x.nom}
                  </span>
                  <div className="rank-bar-wrap">
                    <div className="rank-bar" style={{ width: `${pct}%` }}></div>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--blue-d)", minWidth: "28px", textAlign: "right" }}>
                    {x.count}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* PANE: PINES */}
      <div className={`adm-pane ${activeTab === "pin" ? "on" : ""}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Filtrar por legajo o nombre…"
              style={{ width: "240px" }}
              value={fltPin}
              onChange={(e) => setFltPin(e.target.value)}
            />
            <button
              type="button"
              className="btn-vaciar"
              onClick={cargarPines}
              style={{ color: "var(--blue)", fontSize: "11px" }}
            >
              ↻ Actualizar PINs
            </button>
          </div>

          <button
            type="button"
            className="btn btn-ret"
            style={{ height: "36px", padding: "0 14px", fontSize: "11.5px", fontWeight: 800 }}
            onClick={() => {
              setTargetLegajo("");
              setNuevoPinVal("");
              setModalPinOpen(true);
            }}
          >
            + Asignar / Crear PIN
          </button>
        </div>

        {pinMsg && (
          <div className={`alert ${pinMsg.type}`} style={{ display: "block", marginBottom: "10px" }}>
            {pinMsg.text}
          </div>
        )}

        {loadingPins ? (
          <div className="inst-loading">Cargando PINs…</div>
        ) : (
          <div className="scroll-table">
            <table>
              <thead>
                <tr>
                  <th>Legajo</th>
                  <th>Nombre</th>
                  <th>Sector</th>
                  <th>Estado PIN</th>
                  <th>Fecha Alta</th>
                  <th>Último Uso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pinList.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "18px", color: "var(--soft)" }}>
                      Todavía no hay operarios con PIN creado
                    </td>
                  </tr>
                ) : (
                  pinList
                    .filter(x => {
                      const p = nombreLeg(x.legajo);
                      const q = fltPin.trim().toUpperCase();
                      return !q || String(x.legajo).includes(q) || (p && p.nombre.toUpperCase().includes(q));
                    })
                    .map(x => {
                      const p = nombreLeg(x.legajo);
                      return (
                        <tr key={x.legajo}>
                          <td className="mono">{x.legajo}</td>
                          <td>{p ? p.nombre : "—"}</td>
                          <td style={{ color: "var(--soft)" }}>{p ? p.sector : "—"}</td>
                          <td>
                            {x.bloqueado ? (
                              <span className="pin-badge-blk">BLOQUEADO</span>
                            ) : (
                              <span className="pin-badge-ok">ACTIVO</span>
                            )}
                            {Boolean(x.intentos && !x.bloqueado) && (
                              <span style={{ fontSize: "10px", color: "var(--warn)", marginLeft: "4px" }}>
                                {x.intentos} fallido{x.intentos === 1 ? "" : "s"}
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: "11px", color: "var(--soft)" }}>{x.fechaAlta || "—"}</td>
                          <td style={{ fontSize: "11px", color: "var(--soft)" }}>{x.ultimoUso || "—"}</td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                className="btn-blank"
                                onClick={() => {
                                  setTargetLegajo(String(x.legajo));
                                  setNuevoPinVal("");
                                  setModalPinOpen(true);
                                }}
                                style={{ background: "var(--surface)", color: "var(--blue)", borderColor: "var(--border)" }}
                              >
                                Cambiar PIN
                              </button>
                              <button
                                className="btn-blank"
                                onClick={() => setBlanqueoTarget(x.legajo)}
                              >
                                Blanquear
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CONFIRMAR BLANQUEO DE PIN */}
      {blanqueoTarget !== null && (
        <div className="modal-bg open" style={{ display: "flex" }}>
          <div className="modal-box" style={{ maxWidth: "400px" }}>
            <div className="modal-tit">🔓 Confirmar Blanqueo de PIN</div>
            <div className="modal-bod">
              <p style={{ marginBottom: "12px", fontSize: "13.5px" }}>
                ¿Estás seguro de que deseás blanquear el PIN del operario?
              </p>
              <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px" }}>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text)" }}>
                  Legajo {blanqueoTarget} {nombreLeg(blanqueoTarget) ? `— ${nombreLeg(blanqueoTarget)?.nombre}` : ""}
                </div>
                <div style={{ fontSize: "11px", color: "var(--soft)" }}>
                  Sector: {nombreLeg(blanqueoTarget)?.sector || "—"}
                </div>
              </div>
              <p style={{ fontSize: "12px", color: "var(--warn)" }}>
                Esta acción desbloqueará la cuenta y restablecerá el contador de intentos fallidos a 0.
              </p>
            </div>
            <div className="modal-btns">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setBlanqueoTarget(null)}
                disabled={blanqueando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-dev"
                onClick={handleConfirmarBlanqueo}
                disabled={blanqueando}
              >
                {blanqueando ? "Blanqueando…" : "Confirmar Blanqueo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ASIGNAR / CREAR PIN */}
      {modalPinOpen && (
        <div className="modal-bg open" style={{ display: "flex" }}>
          <div className="modal-box" style={{ maxWidth: "380px" }}>
            <div className="modal-tit">🔑 Asignar / Cambiar PIN de Operario</div>
            <form onSubmit={handleGuardarNuevoPin}>
              <div className="modal-bod">
                <div className="field" style={{ marginBottom: "12px" }}>
                  <label>Seleccionar Operario / Legajo</label>
                  <select
                    value={targetLegajo}
                    onChange={(e) => setTargetLegajo(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1.5px solid var(--border)", fontSize: "13px" }}
                    required
                  >
                    <option value="">-- Seleccionar Operario --</option>
                    {LEGAJOS.map(op => (
                      <option key={op.leg} value={op.leg}>
                        {op.leg} — {op.nombre} ({op.sector})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Nuevo PIN (4 dígitos numéricos)</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="Ej. 1234"
                    value={nuevoPinVal}
                    onChange={(e) => setNuevoPinVal(e.target.value.replace(/\D/g, ""))}
                    style={{ letterSpacing: "4px", fontSize: "18px", textAlign: "center" }}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="modal-btns">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setModalPinOpen(false)}
                  disabled={savingPin}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-ret"
                  disabled={savingPin || nuevoPinVal.length !== 4 || !targetLegajo}
                >
                  {savingPin ? "Guardando…" : "Guardar PIN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
