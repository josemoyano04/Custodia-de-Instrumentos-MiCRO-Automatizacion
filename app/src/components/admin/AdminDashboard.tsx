import React, { useState, useEffect, useMemo } from "react";
import type { Instrumento, Movimiento, VencimientoCalibracion, OperarioHabilitado } from "../../types";
import {
  ADMIN_PASS,
  fetchMovimientosEnUso,
  fetchHistorialMovimientos,
  fetchVencimientosCalibracion,
  fetchOperariosHabilitados,
  guardarOperarioHabilitado,
  toggleHabilitacionOperario,
  eliminarOperarioHabilitado,
  blanquearPinOperario,
  guardarPinOperario
} from "../../services/dataService";

import { AdminLogin } from "./AdminLogin";
import { AdminStats } from "./AdminStats";
import { AdminTabs, type AdminTab } from "./AdminTabs";

import { EnUsoPane } from "./panes/EnUsoPane";
import { HistorialPane } from "./panes/HistorialPane";
import { CalibracionesPane } from "./panes/CalibracionesPane";
import { FueraDePlazoPane } from "./panes/FueraDePlazoPane";
import { RankingPane } from "./panes/RankingPane";
import { OperariosHabilitadosPane } from "./panes/OperariosHabilitadosPane";
import { ConfiguracionPane } from "./panes/ConfiguracionPane";
import { InventarioPane } from "./panes/InventarioPane";

import { ModalAltaOperario } from "./modals/ModalAltaOperario";
import { ModalAsignarPin } from "./modals/ModalAsignarPin";
import { ModalConfirmarBlanqueo } from "./modals/ModalConfirmarBlanqueo";
import { ModalConfirmarEliminarOp } from "./modals/ModalConfirmarEliminarOp";

interface AdminDashboardProps {
  instrumentos: Instrumento[];
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ instrumentos, onLogout }) => {
  const [isLogged, setIsLogged] = useState<boolean>(Boolean(sessionStorage.getItem("adm")));
  const [activeTab, setActiveTab] = useState<AdminTab>("uso");

  // Listas de datos
  const [usoList, setUsoList] = useState<Movimiento[]>([]);
  const [histList, setHistList] = useState<Movimiento[]>([]);
  const [calibList, setCalibList] = useState<VencimientoCalibracion[]>([]);
  const [operariosList, setOperariosList] = useState<OperarioHabilitado[]>([]);

  // Estados de carga y mensajes
  const [loadingCalib, setLoadingCalib] = useState<boolean>(false);
  const [loadingOps, setLoadingOps] = useState<boolean>(false);
  const [opMsg, setOpMsg] = useState<{ type: "ok" | "warn"; text: string } | null>(null);

  // Estados de modales
  const [modalAltaOpOpen, setModalAltaOpOpen] = useState<boolean>(false);
  const [savingOp, setSavingOp] = useState<boolean>(false);

  const [modalPinOpen, setModalPinOpen] = useState<boolean>(false);
  const [targetLegajo, setTargetLegajo] = useState<string>("");
  const [savingPin, setSavingPin] = useState<boolean>(false);

  const [blanqueoTarget, setBlanqueoTarget] = useState<number | null>(null);
  const [blanqueando, setBlanqueando] = useState<boolean>(false);

  const [eliminarOpTarget, setEliminarOpTarget] = useState<OperarioHabilitado | null>(null);
  const [eliminandoOp, setEliminandoOp] = useState<boolean>(false);

  useEffect(() => {
    if (isLogged) {
      cargarAdminData();
    }
  }, [isLogged]);

  // ─── Carga de Datos ────────────────────────────────────────────────────────

  const cargarAdminData = async () => {
    try {
      const [enUso, hist] = await Promise.all([
        fetchMovimientosEnUso(),
        fetchHistorialMovimientos(500)
      ]);
      setUsoList(enUso);
      setHistList(hist);
      cargarOperarios();
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

  const cargarOperarios = async () => {
    setLoadingOps(true);
    try {
      const data = await fetchOperariosHabilitados();
      setOperariosList(data);
    } catch (e) {
      console.warn("Operarios error:", e);
    }
    setLoadingOps(false);
  };

  // ─── Autenticación y Navegación ───────────────────────────────────────────

  const handleLogin = (pass: string): boolean => {
    if (pass === ADMIN_PASS) {
      sessionStorage.setItem("adm", "1");
      setIsLogged(true);
      return true;
    }
    return false;
  };

  const handleLogoutClick = () => {
    sessionStorage.removeItem("adm");
    setIsLogged(false);
    onLogout();
  };

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    if (tab === "calib" && !calibList.length) cargarVencimientos();
    if (tab === "pin" && !operariosList.length) cargarOperarios();
  };

  // ─── Operaciones sobre Operarios y PINs ────────────────────────────────────

  const handleToggleHabilitar = async (op: OperarioHabilitado) => {
    const nuevoEstado = !op.habilitado;
    try {
      const res = await toggleHabilitacionOperario(op.legajo, nuevoEstado);
      if (res.ok) {
        setOpMsg({
          type: "ok",
          text: `✓ Operario ${op.nombre} (Leg. ${op.legajo}) ahora está ${nuevoEstado ? "HABILITADO" : "INHABILITADO"} para retiros.`
        });
        setTimeout(() => setOpMsg(null), 5000);
        cargarOperarios();
      } else {
        setOpMsg({ type: "warn", text: `Error: ${res.error}` });
      }
    } catch (e: any) {
      setOpMsg({ type: "warn", text: `Error: ${e.message}` });
    }
  };

  const handleGuardarNuevoOperario = async (legajo: number, nombre: string, sector: string) => {
    setSavingOp(true);
    try {
      const res = await guardarOperarioHabilitado({ legajo, nombre, sector, habilitado: true });
      if (res.ok) {
        setOpMsg({
          type: "ok",
          text: `✓ Operario ${nombre} (Leg. ${legajo}) dado de alta y HABILITADO correctamente.`
        });
        setModalAltaOpOpen(false);
        setTimeout(() => setOpMsg(null), 5000);
        cargarOperarios();
      } else {
        setOpMsg({ type: "warn", text: `Error: ${res.error}` });
      }
    } catch (e: any) {
      setOpMsg({ type: "warn", text: `Error: ${e.message}` });
    }
    setSavingOp(false);
  };

  const handleGuardarPin = async (legajo: number, pin: string) => {
    setSavingPin(true);
    try {
      const res = await guardarPinOperario(legajo, pin);
      if (res.ok) {
        setOpMsg({
          type: "ok",
          text: `✓ PIN asignado y activo para el Legajo ${legajo}.`
        });
        setModalPinOpen(false);
        setTimeout(() => setOpMsg(null), 5000);
        cargarOperarios();
      } else {
        setOpMsg({ type: "warn", text: `Error: ${res.error}` });
      }
    } catch (e: any) {
      setOpMsg({ type: "warn", text: `Error: ${e.message}` });
    }
    setSavingPin(false);
  };

  const handleEjecutarBlanqueo = async (legajo: number) => {
    setBlanqueando(true);
    try {
      const res = await blanquearPinOperario(legajo);
      if (res.ok) {
        setOpMsg({
          type: "ok",
          text: `✓ PIN del Legajo ${legajo} blanqueado y desbloqueado correctamente.`
        });
        setBlanqueoTarget(null);
        setTimeout(() => setOpMsg(null), 5000);
        cargarOperarios();
      } else {
        setOpMsg({ type: "warn", text: `Error: ${res.error}` });
      }
    } catch (e: any) {
      setOpMsg({ type: "warn", text: `Error: ${e.message}` });
    }
    setBlanqueando(false);
  };

  const handleEjecutarEliminarOp = async (op: OperarioHabilitado) => {
    setEliminandoOp(true);
    try {
      const res = await eliminarOperarioHabilitado(op.legajo);
      if (res.ok) {
        setOpMsg({
          type: "ok",
          text: `✓ Operario ${op.nombre} (Leg. ${op.legajo}) eliminado del padrón.`
        });
        setEliminarOpTarget(null);
        setTimeout(() => setOpMsg(null), 5000);
        cargarOperarios();
      } else {
        setOpMsg({ type: "warn", text: `Error: ${res.error}` });
      }
    } catch (e: any) {
      setOpMsg({ type: "warn", text: `Error: ${e.message}` });
    }
    setEliminandoOp(false);
  };

  // ─── Exportar CSV ─────────────────────────────────────────────────────────

  const fmtFecha = (s?: string) => {
    if (!s) return "—";
    const str = s.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const parts = str.split("-");
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return str;
  };

  const fmtHora = (s?: string) => (s && s.length >= 5 ? s.substring(0, 5) : s || "—");

  const exportarPeriodo = (expDesde: string, expHasta: string) => {
    const parseFechaStr = (fStr: string): number => {
      const s = (fStr || "").trim();
      if (!s) return 0;
      if (s.includes("-")) {
        const d = new Date(`${s}T00:00:00`);
        return isNaN(d.getTime()) ? 0 : d.getTime();
      }
      const parts = s.split("/");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        return isNaN(d.getTime()) ? 0 : d.getTime();
      }
      return 0;
    };

    let fDesdeMs = parseFechaStr(expDesde);
    let fHastaMs = parseFechaStr(expHasta);
    if (fHastaMs > 0) fHastaMs += 86399999;

    const filtrados = histList.filter(m => {
      const rMs = parseFechaStr(m.fechaRetiro);
      if (fDesdeMs > 0 && rMs < fDesdeMs) return false;
      if (fHastaMs > 0 && rMs > fHastaMs) return false;
      return true;
    });

    if (filtrados.length === 0) {
      alert("No hay movimientos registrados en el período seleccionado.");
      return;
    }

    const headers = ["Código", "Instrumento", "Legajo", "Operario", "Sector", "Máquina", "Fecha Retiro", "Hora Retiro", "Fecha Devolución", "Hora Devolución", "Estado"];
    const rows = filtrados.map(m => [
      `"${m.codInstrumento}"`,
      `"${(m.instrumento || "").replace(/"/g, '""')}"`,
      `"${m.legajo}"`,
      `"${(m.nombre || "").replace(/"/g, '""')}"`,
      `"${(m.sector || "").replace(/"/g, '""')}"`,
      `"${(m.maquina || "").replace(/"/g, '""')}"`,
      `"${fmtFecha(m.fechaRetiro)}"`,
      `"${fmtHora(m.horaRetiro)}"`,
      `"${fmtFecha(m.fechaDevolucion)}"`,
      `"${fmtHora(m.horaDevolucion)}"`,
      `"${m.estado}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historial_${expDesde || "inicio"}_al_${expHasta || "hoy"}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ─── Cálculos Memorizados ─────────────────────────────────────────────────

  const vencidosUso = useMemo(() => {
    const ahoraMs = Date.now();
    return usoList
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
  }, [usoList]);

  const { rankingSorted, rankingMax } = useMemo(() => {
    const rankingMap: { [key: string]: { cod: string; nom: string; count: number } } = {};
    histList.forEach(m => {
      const k = `${m.codInstrumento}|||${m.instrumento}`;
      if (!rankingMap[k]) rankingMap[k] = { cod: m.codInstrumento, nom: m.instrumento, count: 0 };
      rankingMap[k].count++;
    });
    const sorted = Object.values(rankingMap).sort((a, b) => b.count - a.count).slice(0, 20);
    const max = sorted.length ? sorted[0].count : 1;
    return { rankingSorted: sorted, rankingMax: max };
  }, [histList]);

  const movsHoyCount = useMemo(() => {
    const hoyISO = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Cordoba" });
    const hoyArg = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Argentina/Cordoba" });

    return histList.filter(m => {
      const rDate = (m.fechaRetiro || "").trim();
      const dDate = (m.fechaDevolucion || "").trim();
      return rDate === hoyISO || rDate === hoyArg || fmtFecha(rDate) === hoyArg ||
        dDate === hoyISO || dDate === hoyArg || fmtFecha(dDate) === hoyArg;
    }).length;
  }, [histList]);

  const { nVenc, nPorV } = useMemo(() => {
    let v = 0;
    let p = 0;
    for (const x of calibList) {
      if (x.estado === "VENCIDO") v++;
      else if (x.estado === "POR VENCER") p++;
    }
    return { nVenc: v, nPorV: p };
  }, [calibList]);

  // Si no está autenticado, renderizar login
  if (!isLogged) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div>
      {/* Encabezado del Panel */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>
          Panel de Gestión y Metrología
        </h3>
        <button
          className="btn btn-ghost btn-admin-logout"
          style={{ height: "34px", padding: "0 14px", fontSize: "11.5px", fontWeight: 800 }}
          onClick={handleLogoutClick}
        >
          Cerrar sesión
        </button>
      </div>

      {/* Tarjetas de Estadísticas */}
      <AdminStats
        enUsoCount={usoList.length}
        totalInventario={instrumentos.length}
        movsHoyCount={movsHoyCount}
      />

      {/* Barra de Pestañas */}
      <AdminTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        enUsoCount={usoList.length}
        totalInventario={instrumentos.length}
        nVenc={nVenc}
        nPorV={nPorV}
        vencidosUsoCount={vencidosUso.length}
        operariosCount={operariosList.length}
      />

      {/* Paneles de Contenido (Renderizado Condicional) */}
      {activeTab === "uso" && (
        <EnUsoPane
          usoList={usoList}
          fmtFecha={fmtFecha}
          fmtHora={fmtHora}
        />
      )}

      {activeTab === "inv" && (
        <InventarioPane
          instrumentos={instrumentos}
          usoList={usoList}
        />
      )}

      {activeTab === "hist" && (
        <HistorialPane
          histList={histList}
          fmtFecha={fmtFecha}
          fmtHora={fmtHora}
          onExportarPeriodo={exportarPeriodo}
        />
      )}

      {activeTab === "calib" && (
        <CalibracionesPane
          calibList={calibList}
          loadingCalib={loadingCalib}
        />
      )}

      {activeTab === "nodv" && (
        <FueraDePlazoPane
          vencidosUso={vencidosUso}
          fmtFecha={fmtFecha}
        />
      )}

      {activeTab === "rank" && (
        <RankingPane
          rankingSorted={rankingSorted}
          rankingMax={rankingMax}
        />
      )}

      {activeTab === "pin" && (
        <OperariosHabilitadosPane
          operariosList={operariosList}
          loadingOps={loadingOps}
          opMsg={opMsg}
          onActualizar={cargarOperarios}
          onOpenAlta={() => setModalAltaOpOpen(true)}
          onOpenPin={(legajo) => {
            setTargetLegajo(legajo || "");
            setModalPinOpen(true);
          }}
          onToggleHabilitar={handleToggleHabilitar}
          onOpenBlanqueo={(leg) => setBlanqueoTarget(leg)}
          onOpenEliminar={(op) => setEliminarOpTarget(op)}
        />
      )}

      {activeTab === "config" && (
        <ConfiguracionPane />
      )}

      {/* Modales de Administración */}
      <ModalAltaOperario
        isOpen={modalAltaOpOpen}
        operariosList={operariosList}
        saving={savingOp}
        onGuardar={handleGuardarNuevoOperario}
        onClose={() => setModalAltaOpOpen(false)}
      />

      <ModalAsignarPin
        isOpen={modalPinOpen}
        targetLegajo={targetLegajo}
        operariosList={operariosList}
        saving={savingPin}
        onGuardar={handleGuardarPin}
        onClose={() => setModalPinOpen(false)}
      />

      <ModalConfirmarBlanqueo
        isOpen={blanqueoTarget !== null}
        legajo={blanqueoTarget}
        operarioNombre={operariosList.find(x => x.legajo === blanqueoTarget)?.nombre}
        loading={blanqueando}
        onConfirmar={handleEjecutarBlanqueo}
        onClose={() => setBlanqueoTarget(null)}
      />

      <ModalConfirmarEliminarOp
        isOpen={eliminarOpTarget !== null}
        operario={eliminarOpTarget}
        loading={eliminandoOp}
        onConfirmar={handleEjecutarEliminarOp}
        onClose={() => setEliminarOpTarget(null)}
      />
    </div>
  );
};
