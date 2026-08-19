import { useState, useEffect } from "react";
import type { Operario, OperarioHabilitado, Instrumento, InstrumentoSeleccionado, Maquina, VistaActual, Movimiento } from "./types";
import {
  LEGAJOS,
  MAQUINAS,
  fetchInstrumentos,
  fetchMovimientosEnUso,
  fetchOperariosHabilitados,
  verificarDisponibilidad,
  getPinEstado,
  setPin,
  validarPin,
  registrarRetiro,
  registrarDevolucion
} from "./services/dataService";
import { sincronizarGoogleSheetsConSupabase } from "./services/syncService";

import { Header } from "./components/shared/Header";
import { ModeSelector, type ModoOperacion } from "./components/operario/ModeSelector";
import { OperarioCard } from "./components/operario/OperarioCard";
import { InstrumentoSearch } from "./components/operario/InstrumentoSearch";
import { DevolucionSearch } from "./components/operario/DevolucionSearch";
import { SelectedTray } from "./components/operario/SelectedTray";
import { MaquinaCard } from "./components/operario/MaquinaCard";
import { ActionButtons } from "./components/operario/ActionButtons";
import { PinModal } from "./components/shared/PinModal";
import { ConfirmModal } from "./components/shared/ConfirmModal";
import { SuccessModal } from "./components/shared/SuccessModal";
import { AdminDashboard } from "./components/admin/AdminDashboard";

import "./styles/variables.css";
import "./styles/global.css";
import "./styles/header.css";
import "./styles/operario.css";
import "./styles/admin.css";
import "./styles/modals.css";

export function App() {
  // Tema Claro por defecto
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Cambiar color de la barra del marco PWA / navegador según el tema
    const pwaColor = theme === "dark" ? "#009bde" : "#01b2fe";
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute("content", pwaColor);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  const [vistaActual, setVistaActual] = useState<VistaActual>("op");
  const [modoOp, setModoOp] = useState<ModoOperacion>("retiro");

  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([]);
  const [movimientosEnUso, setMovimientosEnUso] = useState<Movimiento[]>([]);
  const [operariosHabilitados, setOperariosHabilitados] = useState<OperarioHabilitado[]>([]);
  const [loadingInst, setLoadingInst] = useState<boolean>(true);
  const [loadingEnUso, setLoadingEnUso] = useState<boolean>(false);
  const [errorInst, setErrorInst] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [operario, setOperario] = useState<Operario | null>(null);
  const [carrito, setCarrito] = useState<InstrumentoSeleccionado[]>([]);
  const [maquinaSel, setMaquinaSel] = useState<Maquina | null>(null);

  // Alertas y Modales
  const [resAlert, setResAlert] = useState<{ type: "ok" | "warn"; text: string } | null>(null);
  const [confirmTipo, setConfirmTipo] = useState<"RET" | "DEV" | null>(null);
  const [successModalMsg, setSuccessModalMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // State para PIN Modal
  const [pinModalOpen, setPinModalOpen] = useState<boolean>(false);
  const [pinMode, setPinMode] = useState<"alta" | "valida" | null>(null);
  const [pinErr, setPinErr] = useState<string>("");
  const [pinResolver, setPinResolver] = useState<((val: string | null) => void) | null>(null);

  const cargarOperariosHabilitados = async () => {
    try {
      const ops = await fetchOperariosHabilitados();
      setOperariosHabilitados(ops);
    } catch (e) {
      console.warn("Error cargando operarios habilitados:", e);
    }
  };

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setResAlert(null);
    try {
      const res = await sincronizarGoogleSheetsConSupabase();
      if (res.ok) {
        setResAlert({ type: "ok", text: res.mensaje });
        await Promise.all([cargarDatos(), cargarEnUso(), cargarOperariosHabilitados()]);
      } else {
        setResAlert({ type: "warn", text: res.mensaje });
      }
    } catch (e: any) {
      setResAlert({ type: "warn", text: `Error de sincronización: ${e.message || e}` });
    }
    setIsSyncing(false);
  };

  const cargarDatos = async () => {
    setLoadingInst(true);
    setErrorInst(false);
    try {
      const [data, ops] = await Promise.all([
        fetchInstrumentos(),
        fetchOperariosHabilitados()
      ]);
      setInstrumentos(data);
      setOperariosHabilitados(ops);
      setLoadingInst(false);
    } catch (e) {
      console.error(e);
      setLoadingInst(false);
      setErrorInst(true);
    }
  };

  const cargarEnUso = async () => {
    setLoadingEnUso(true);
    try {
      const enUso = await fetchMovimientosEnUso();
      setMovimientosEnUso(enUso);
    } catch (e) {
      console.warn("Error cargando enUso:", e);
    }
    setLoadingEnUso(false);
  };

  useEffect(() => {
    cargarDatos();
    cargarEnUso();
    const interval = setInterval(() => {
      cargarDatos();
      cargarEnUso();
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCambiarModo = (nuevoModo: ModoOperacion) => {
    if (nuevoModo === modoOp) return;
    setModoOp(nuevoModo);
    setCarrito([]);
    setMaquinaSel(null);
    setResAlert(null);
    if (nuevoModo === "devolucion") {
      cargarEnUso();
    }
  };

  // ── RETIRO: Agregar instrumento ──────────────────────────────────────────
  const handleAgregarAlCarritoRetiro = async (inst: Instrumento) => {
    if (carrito.some(x => x.cod === inst.c)) return;

    const estUp = (inst.e || "").trim().toUpperCase();
    const isVencido = estUp === "VENCIDO";

    const itemSel: InstrumentoSeleccionado = {
      cod: inst.c,
      nom: inst.n,
      sec: inst.s,
      est: inst.e || "",
      _enUso: undefined,
      _calibVenc: isVencido
    };

    setCarrito(prev => [...prev, itemSel]);

    try {
      const r = await verificarDisponibilidad(inst.c);
      if (!r.disponible) {
        const esMio = operario && String(r.legajo) === String(operario.leg);
        setCarrito(prev =>
          prev.map(x => (x.cod === inst.c ? {
            ...x,
            _enUso: esMio ? true : "otro",
            _quienRetiro: {
              legajo: Number(r.legajo),
              nombre: r.nombre,
              maquina: r.maquina
            }
          } : x))
        );
      } else {
        setCarrito(prev =>
          prev.map(x => (x.cod === inst.c ? { ...x, _enUso: false } : x))
        );
      }
    } catch (err) {
      console.warn("Error check disp:", err);
      setCarrito(prev =>
        prev.map(x => (x.cod === inst.c ? { ...x, _enUso: false } : x))
      );
    }
  };

  // ── DEVOLUCIÓN: Toggle individual ─────────────────────────────────────────
  const handleToggleDevolucionItem = (item: InstrumentoSeleccionado) => {
    setCarrito(prev => {
      const exists = prev.some(x => x.cod === item.cod);
      if (exists) {
        return prev.filter(x => x.cod !== item.cod);
      } else {
        return [...prev, item];
      }
    });
  };

  // ── DEVOLUCIÓN: Seleccionar todos ────────────────────────────────────────
  const handleSeleccionarTodosDevolucion = (items: InstrumentoSeleccionado[]) => {
    setCarrito(prev => {
      const nuevos = items.filter(it => !prev.some(p => p.cod === it.cod));
      return [...prev, ...nuevos];
    });
  };

  const handleDeseleccionarTodosDevolucion = () => {
    setCarrito([]);
  };

  const handleQuitarDelCarrito = (cod: string) => {
    setCarrito(prev => prev.filter(x => x.cod !== cod));
  };

  const handleVaciarCarrito = () => {
    setCarrito([]);
  };

  const handlePedirPin = (mode: "alta" | "valida", errMessage = ""): Promise<string | null> => {
    return new Promise((resolve) => {
      setPinMode(mode);
      setPinErr(errMessage);
      setPinModalOpen(true);
      setPinResolver(() => resolve);
    });
  };

  const handlePinSuccess = (pin: string) => {
    setPinModalOpen(false);
    if (pinResolver) pinResolver(pin);
  };

  const handlePinCancel = () => {
    setPinModalOpen(false);
    if (pinResolver) pinResolver(null);
  };

  const solicitarPinWorkflow = async (legajoTarget?: number): Promise<{ ok: boolean; msg?: string | null; nuevo?: boolean }> => {
    const leg = legajoTarget || (operario ? operario.leg : null);
    if (!leg) return { ok: false, msg: "Seleccioná un operario." };

    // Si estamos en modo retiro, validar que el operario esté habilitado
    if (modoOp === "retiro") {
      const opHabilitado = operariosHabilitados.find(o => o.legajo === leg);
      if (opHabilitado && !opHabilitado.habilitado) {
        return { ok: false, msg: "⛔ Operario no habilitado para retirar instrumentos. Contactá al Administrador." };
      }
    }

    let est;
    try {
      est = await getPinEstado(leg);
    } catch (e) {
      return { ok: false, msg: "No se pudo verificar el PIN. Revisá la conexión." };
    }

    if (!est || !est.ok) return { ok: false, msg: "Error al verificar el PIN." };
    if (est.bloqueado) return { ok: false, msg: "⛔ Tu PIN está bloqueado por intentos fallidos. Pedile al administrador que lo blanquee." };

    if (!est.existe) {
      const nuevo = await handlePedirPin("alta");
      if (nuevo === null) return { ok: false, msg: null };
      let r;
      try {
        r = await setPin(leg, nuevo);
      } catch (e) {
        return { ok: false, msg: "No se pudo guardar el PIN." };
      }
      if (!r || !r.ok) return { ok: false, msg: "Error al guardar el PIN." };
      return { ok: true, nuevo: true };
    }

    let errText = "";
    while (true) {
      const pin = await handlePedirPin("valida", errText);
      if (pin === null) return { ok: false, msg: null };

      let r;
      try {
        r = await validarPin(leg, pin);
      } catch (e) {
        return { ok: false, msg: "Error al validar el PIN." };
      }

      if (r && r.ok) return { ok: true };
      if (r && r.bloqueado) return { ok: false, msg: "⛔ PIN incorrecto. Tu legajo quedó bloqueado." };

      const rest = typeof r.restantes === "number" ? r.restantes : null;
      errText = `PIN incorrecto.${rest !== null ? ` Te queda${rest === 1 ? "" : "n"} ${rest} intento${rest === 1 ? "" : "s"}.` : ""}`;
    }
  };

  const handleEjecutarAccionBatch = async () => {
    if (!confirmTipo || !carrito.length) return;
    const tipo = confirmTipo;
    setConfirmTipo(null);

    // En devolución, si no hay operario seleccionado en filtro, tomar el operario del primer ítem
    let opTarget = operario;
    if (tipo === "DEV") {
      // Validar que todos los items pertenezcan al mismo legajo
      const legajosDistintos = Array.from(new Set(carrito.map(c => c._quienRetiro?.legajo).filter(Boolean)));
      if (legajosDistintos.length > 1) {
        setResAlert({ type: "warn", text: "Solo se pueden devolver instrumentos de un mismo operario en la misma operación." });
        return;
      }

      if (!opTarget) {
        const firstLegajo = carrito[0]?._quienRetiro?.legajo || movimientosEnUso.find(m => m.codInstrumento === carrito[0]?.cod)?.legajo;
        if (firstLegajo) {
          opTarget = LEGAJOS.find(l => String(l.leg) === String(firstLegajo)) || {
            leg: Number(firstLegajo),
            nombre: carrito[0]?._quienRetiro?.nombre || "Operario",
            sector: ""
          };
        }
      }
    }

    if (!opTarget) {
      setResAlert({ type: "warn", text: "Seleccioná un operario para confirmar la operación." });
      return;
    }

    const pr = await solicitarPinWorkflow(opTarget.leg);
    if (!pr.ok) {
      if (pr.msg) {
        setResAlert({ type: "warn", text: pr.msg });
      }
      return;
    }

    setIsSaving(true);
    try {
      const promesas = carrito.map(item => {
        return tipo === "RET"
          ? registrarRetiro({
            legajo: opTarget!.leg,
            nombre: opTarget!.nombre,
            sector: opTarget!.sector,
            codInstrumento: item.cod,
            instrumento: item.nom,
            maquina: maquinaSel ? (maquinaSel.num ? `${maquinaSel.num} – ${maquinaSel.desc}` : maquinaSel.desc) : ""
          })
          : registrarDevolucion(item.cod);
      });

      await Promise.all(promesas);
      setIsSaving(false);

      const msg = tipo === "RET" ? "Retiro realizado con éxito" : "Devolución realizada con éxito";
      setSuccessModalMsg(msg);

    } catch (e) {
      setIsSaving(false);
      setResAlert({ type: "warn", text: "Error de conexión durante la operación." });
    }
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalMsg(null);
    resetForm();
    cargarDatos();
    cargarEnUso();
  };

  const resetForm = () => {
    setCarrito([]);
    setMaquinaSel(null);
    setResAlert(null);
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <Header
        vistaActual={vistaActual}
        theme={theme}
        onCambiarVista={setVistaActual}
        onToggleTheme={toggleTheme}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      <div className="main">
        {vistaActual === "op" ? (
          <div className="view on">
            <div className="op-area">

              {/* COL IZQUIERDA: Selector Modo + Operario + Máquina */}
              <div className="inst-col">
                <ModeSelector
                  modoActual={modoOp}
                  onCambiarModo={handleCambiarModo}
                />

                <div className="op-inputs-row">
                  <OperarioCard
                    legajos={LEGAJOS}
                    operariosHabilitados={operariosHabilitados}
                    operarioSeleccionado={operario}
                    modo={modoOp}
                    onSeleccionarOperario={setOperario}
                  />

                  <MaquinaCard
                    maquinas={MAQUINAS}
                    maquinaSeleccionada={maquinaSel}
                    onSeleccionarMaquina={setMaquinaSel}
                    visible={true}
                    label={modoOp === "devolucion" ? "Filtrar Máquina / Sector" : "Máquina / Sector"}
                  />
                </div>

                {resAlert && (
                  <div className={`alert ${resAlert.type}`} style={{ display: "block" }}>
                    {resAlert.text}
                  </div>
                )}
              </div>

              {/* COL DERECHA: Buscador según Modo + Lista de Selección */}
              <div className="inst-col">
                {modoOp === "retiro" ? (
                  <InstrumentoSearch
                    instrumentos={instrumentos}
                    loading={loadingInst}
                    error={errorInst}
                    disabled={!operario}
                    carrito={carrito}
                    onAgregarAlCarrito={handleAgregarAlCarritoRetiro}
                    onRetry={cargarDatos}
                  />
                ) : (
                  <DevolucionSearch
                    movimientosEnUso={movimientosEnUso}
                    instrumentos={instrumentos}
                    loading={loadingEnUso}
                    carrito={carrito}
                    filtroLegajo={operario ? operario.leg : null}
                    filtroMaquinaNum={maquinaSel ? (maquinaSel.num || maquinaSel.desc) : null}
                    onToggleDevolucionItem={handleToggleDevolucionItem}
                    onSeleccionarTodos={handleSeleccionarTodosDevolucion}
                    onDeseleccionarTodos={handleDeseleccionarTodosDevolucion}
                    onRefresh={cargarEnUso}
                  />
                )}

                <SelectedTray
                  carrito={carrito}
                  onQuitarDelCarrito={handleQuitarDelCarrito}
                  onVaciarCarrito={handleVaciarCarrito}
                />
              </div>
            </div>

            {/* BOTONES ACCION FLOTANTES (FAB) */}
            <ActionButtons
              modo={modoOp}
              operario={operario}
              carrito={carrito}
              maquina={maquinaSel}
              onConfirmar={setConfirmTipo}
            />
          </div>
        ) : (
          <div className="view on">
            <AdminDashboard
              instrumentos={instrumentos}
              onLogout={() => {
                setVistaActual("op");
                cargarOperariosHabilitados();
              }}
            />
          </div>
        )}
      </div>

      {/* Modal de Confirmación Lote */}
      <ConfirmModal
        isOpen={Boolean(confirmTipo)}
        tipo={confirmTipo}
        operario={operario || (movimientosEnUso.find(m => m.codInstrumento === carrito[0]?.cod) ? {
          leg: Number(movimientosEnUso.find(m => m.codInstrumento === carrito[0]?.cod)?.legajo),
          nombre: movimientosEnUso.find(m => m.codInstrumento === carrito[0]?.cod)?.nombre || "Operario",
          sector: ""
        } : null)}
        carrito={carrito}
        maquina={maquinaSel}
        saving={isSaving}
        onConfirmar={handleEjecutarAccionBatch}
        onCancelar={() => setConfirmTipo(null)}
      />

      {/* Modal de PIN Táctil */}
      <PinModal
        isOpen={pinModalOpen}
        mode={pinMode}
        operario={operario || (movimientosEnUso.find(m => m.codInstrumento === carrito[0]?.cod) ? {
          leg: Number(movimientosEnUso.find(m => m.codInstrumento === carrito[0]?.cod)?.legajo),
          nombre: movimientosEnUso.find(m => m.codInstrumento === carrito[0]?.cod)?.nombre || "Operario",
          sector: ""
        } : null)}
        errorMessage={pinErr}
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
      />

      {/* Modal de Éxito Auto-cerrable (2 segundos) */}
      <SuccessModal
        isOpen={Boolean(successModalMsg)}
        mensaje={successModalMsg || ""}
        onClose={handleCloseSuccessModal}
      />

      <footer>ANEXO II MIC-PG-11-01 · Rev. 2 · Abril 2026</footer>
    </div>
  );
}
