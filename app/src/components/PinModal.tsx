import React, { useState, useEffect } from "react";
import type { Operario } from "../types";

interface PinModalProps {
  isOpen: boolean;
  mode: "alta" | "valida" | null;
  operario: Operario | null;
  errorMessage?: string;
  onSuccess: (pin: string) => void;
  onCancel: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  mode,
  operario,
  errorMessage = "",
  onSuccess,
  onCancel
}) => {
  const [digits, setDigits] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  const [firstPin, setFirstPin] = useState<string>("");
  const [err, setErr] = useState<string>(errorMessage);
  const [isShake, setIsShake] = useState<boolean>(false);

  useEffect(() => {
    setDigits("");
    setStep(1);
    setFirstPin("");
    setErr(errorMessage);
  }, [isOpen, mode, errorMessage]);

  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (!isOpen) return;
      if (/^[0-9]$/.test(ev.key)) {
        ev.preventDefault();
        handleDigit(ev.key);
      } else if (ev.key === "Backspace") {
        ev.preventDefault();
        handleDelete();
      } else if (ev.key === "Escape") {
        ev.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, digits, step, firstPin, mode]);

  if (!isOpen || !mode) return null;

  const triggerErr = (msg: string) => {
    setErr(msg);
    setIsShake(true);
    setTimeout(() => setIsShake(false), 400);
  };

  const isDebil = (p: string) => {
    if (/^(\d)\1{3}$/.test(p)) return "Evitá 4 dígitos iguales.";
    if ("0123456789".indexOf(p) >= 0 || "9876543210".indexOf(p) >= 0) return "Evitá secuencias como 1234 o 4321.";
    return null;
  };

  const handleComplete = (finalDigits: string) => {
    if (mode === "alta") {
      if (step === 1) {
        const dbl = isDebil(finalDigits);
        if (dbl) {
          setDigits("");
          triggerErr(dbl);
          return;
        }
        setFirstPin(finalDigits);
        setStep(2);
        setDigits("");
        setErr("");
        return;
      }
      if (finalDigits !== firstPin) {
        setStep(1);
        setFirstPin("");
        setDigits("");
        triggerErr("Los PIN no coinciden. Probá de nuevo.");
        return;
      }
      onSuccess(finalDigits);
      return;
    }
    onSuccess(finalDigits);
  };

  const handleDigit = (n: string) => {
    if (digits.length >= 4) return;
    const next = digits + n;
    setDigits(next);
    setErr("");
    if (next.length === 4) {
      setTimeout(() => handleComplete(next), 140);
    }
  };

  const handleDelete = () => {
    if (!digits.length) return;
    setDigits(prev => prev.slice(0, -1));
  };

  return (
    <div className={`modal-bg ${isOpen ? "open" : ""}`} style={{ display: isOpen ? "flex" : "none" }}>
      <div className="modal-box" style={{ maxWidth: "340px" }}>
        <div className="pin-tit">
          {mode === "alta"
            ? step === 1
              ? "Creá tu PIN"
              : "Repetí tu PIN"
            : "Ingresá tu PIN"}
        </div>
        <div className="pin-sub">
          {mode === "alta"
            ? step === 1
              ? "Es tu primera operación. Elegí un PIN de 4 dígitos. Te lo vamos a pedir en cada retiro y devolución."
              : "Ingresalo una segunda vez para confirmarlo."
            : operario
            ? `${operario.nombre} · Leg. ${operario.leg}`
            : ""}
        </div>

        <div className={`pin-dots ${err ? "err" : ""} ${isShake ? "shake" : ""}`}>
          <div className={`pin-dot ${digits.length >= 1 ? "full" : ""}`}></div>
          <div className={`pin-dot ${digits.length >= 2 ? "full" : ""}`}></div>
          <div className={`pin-dot ${digits.length >= 3 ? "full" : ""}`}></div>
          <div className={`pin-dot ${digits.length >= 4 ? "full" : ""}`}></div>
        </div>

        <div className="pin-err">{err}</div>

        <div className="pin-pad">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(n => (
            <button key={n} className="pin-key" onClick={() => handleDigit(n)}>
              {n}
            </button>
          ))}
          <button className="pin-key blank"></button>
          <button className="pin-key" onClick={() => handleDigit("0")}>
            0
          </button>
          <button className="pin-key act" onClick={handleDelete}>
            ⌫
          </button>
        </div>

        <button className="btn btn-ghost" style={{ width: "100%", height: "40px" }} onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
};
