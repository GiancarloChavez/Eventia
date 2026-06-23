"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Eye, EyeOff, User, Mail, Lock, Phone,
  ChevronLeft, Check, ShieldCheck, MailCheck,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";

// ── Wizard ─────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Cuenta" },
  { id: 2, label: "Negocio" },
  { id: 3, label: "Servicio" },
  { id: 4, label: "Pagos" },
  { id: 5, label: "Revisión" },
];

function WizardProgress({ current }: { current: number }) {
  return (
    <div className="flex items-start mb-8 w-full">
      {STEPS.map((step, i) => {
        const done   = step.id < current;
        const active = step.id === current;
        return (
          <div key={step.id} className="flex items-start flex-1 min-w-0">
            <div className="flex flex-col items-center shrink-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all"
                style={{
                  background: active || done ? "#f39e10" : "#f3f4f6",
                  color:      active || done ? "#fff"    : "#9ca3af",
                }}
              >
                {done ? <Check size={12} strokeWidth={2.5} /> : step.id}
              </div>
              <span
                className="text-[10px] mt-1 font-medium text-center"
                style={{ color: active ? "#f39e10" : done ? "#d97706" : "#9ca3af" }}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-px mt-3.5 mx-1"
                style={{ background: done ? "#f39e10" : "#e5e7eb" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Reusable field ──────────────────────────────────────────────

function InputField({
  icon, label, type, value, onChange, placeholder, required, accentColor = "#f39e10",
}: {
  icon: React.ReactNode;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  accentColor?: string;
}) {
  return (
    <div>
      <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] outline-none transition-colors"
          style={{ fontFamily: "inherit" }}
          onFocus={(e)  => (e.target.style.borderColor = accentColor)}
          onBlur={(e)   => (e.target.style.borderColor = "#e5e7eb")}
        />
      </div>
    </div>
  );
}

// ── Main form ───────────────────────────────────────────────────

type Substep = "email" | "profile" | "otp";

function RegistroForm() {
  const searchParams = useSearchParams();

  const isProvider = searchParams.get("tipo") === "proveedor";
  const accent     = isProvider ? "#f39e10" : "#3b82f6";

  const [substep,      setSubstep]      = useState<Substep>("email");
  const [email,        setEmail]        = useState("");
  const [showPwd,      setShowPwd]      = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [userId,       setUserId]       = useState<string | null>(null);
  const [otp,          setOtp]          = useState("");

  const [form, setForm] = useState({
    nombre:   "",
    password: "",
    confirm:  "",
    telefono: "",
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  // ── Google OAuth (proveedor only) ─────────────────────────────

  const handleGoogleOAuth = () => {
    setOauthLoading(true);
    window.location.href = "/api/auth/oauth?flow=provider";
  };

  // ── Sub-paso 1: Validar email y avanzar ───────────────────────

  const handleEmailNext = () => {
    setError(null);
    if (!email || !email.includes("@")) {
      setError("Ingresa un correo válido.");
      return;
    }
    setSubstep("profile");
  };

  // ── Sub-paso 2: Crear cuenta ──────────────────────────────────

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/complete-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        full_name: form.nombre,
        password:  form.password,
        role:      isProvider ? "provider" : "client",
        phone:     form.telefono || null,
      }),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setLoading(false);
      setError(body.error ?? "Error al crear la cuenta.");
      return;
    }

    setUserId(body.user_id);
    setLoading(false);
    setSubstep("otp");
  };

  // ── Sub-paso 3: Verificar código OTP ─────────────────────────

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Ingresa el código de 6 dígitos.");
      return;
    }
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/confirm-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, code: otp }),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setLoading(false);
      setError(body.error ?? "Código incorrecto.");
      return;
    }

    // Code verified — sign in and redirect
    const { error: signInError } = await getSupabase().auth.signInWithPassword({
      email,
      password: form.password,
    });

    setLoading(false);

    if (signInError) {
      setError("Cuenta verificada. Ya puedes iniciar sesión.");
      return;
    }

    window.location.href = isProvider ? "/proveedor/onboarding/negocio" : "/cliente";
  };

  // ── Password strength ──────────────────────────────────────────

  const pwdStrength = form.password.length >= 12 ? 3 : form.password.length >= 8 ? 2 : 1;
  const pwdColors   = ["#ef4444", "#f59e0b", "#22c55e"];
  const pwdLabels   = ["Débil", "Media", "Fuerte"];

  const submitBtnStyle = {
    background: isProvider
      ? "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)"
      : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    boxShadow: isProvider
      ? "0 4px 20px rgba(243,158,16,0.4)"
      : "0 4px 20px rgba(59,130,246,0.35)",
    opacity: loading ? 0.75 : 1,
    transition: "opacity 200ms",
  };

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className={`w-full ${isProvider ? "max-w-[480px]" : "max-w-[440px]"}`}>

      {/* ══ SUB-PASO 1: Email ══════════════════════════════════ */}
      {substep === "email" && (
        <>
          <Link
            href="/auth"
            className="flex items-center gap-1.5 text-gray-400 text-[13px] hover:text-gray-700 transition-colors mb-6"
          >
            <ChevronLeft size={15} />
            Volver
          </Link>

          {isProvider && <WizardProgress current={1} />}

          <div className="mb-7">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 text-[12px] font-semibold"
              style={{ background: `${accent}1a`, color: accent }}
            >
              {isProvider ? "Cuenta de proveedor · Paso 1 de 5" : "Cuenta de organizador"}
            </div>
            <h1 className="text-gray-900 text-[26px] font-black tracking-[-0.5px] mb-1.5">
              Crea tu cuenta
            </h1>
            <p className="text-gray-500 text-[14px]">
              {isProvider
                ? "Ingresa tu correo para comenzar."
                : "Encuentra los mejores proveedores para tu evento."}
            </p>
          </div>

          {/* Google OAuth (proveedor only) */}
          {isProvider && (
            <>
              <button
                type="button"
                onClick={handleGoogleOAuth}
                disabled={oauthLoading}
                className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer bg-white mb-4"
                style={{ opacity: oauthLoading ? 0.75 : 1 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {oauthLoading ? "Redirigiendo..." : "Continuar con Google"}
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-gray-400 text-[12px]">o continúa con tu correo</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            </>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px]">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3.5">
            <InputField
              icon={<Mail size={14} />}
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              accentColor={accent}
              required
            />
            <button
              type="button"
              onClick={handleEmailNext}
              className="w-full rounded-xl py-3.5 text-white text-[15px] font-bold mt-1 cursor-pointer border-none"
              style={submitBtnStyle}
            >
              Continuar →
            </button>
          </div>

          <p className="text-center text-gray-500 text-[13px] mt-5">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/auth/login"
              className="font-semibold hover:underline"
              style={{ color: accent }}
            >
              Iniciar sesión
            </Link>
          </p>
        </>
      )}

      {/* ══ PANTALLA: Código de verificación ══════════════════ */}
      {substep === "otp" && (
        <div className="flex flex-col items-center text-center w-full max-w-[400px]">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: `${accent}1a` }}
          >
            <MailCheck size={32} style={{ color: accent }} strokeWidth={1.8} />
          </div>
          <h1 className="text-gray-900 text-[24px] font-black tracking-[-0.4px] mb-2">
            Verifica tu correo
          </h1>
          <p className="text-gray-500 text-[14px] leading-relaxed mb-1">
            Te enviamos un código de 6 dígitos a
          </p>
          <p className="text-gray-900 font-bold text-[14px] mb-6">{email}</p>

          {error && (
            <div className="w-full mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px]">
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="w-full flex flex-col gap-3">
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(null); }}
              placeholder="000000"
              className="w-full text-center py-4 rounded-xl border border-gray-200 text-[32px] font-black tracking-[12px] outline-none"
              style={{ fontFamily: "monospace" }}
              onFocus={(e) => (e.target.style.borderColor = accent)}
              onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full rounded-xl py-3.5 text-white text-[15px] font-bold cursor-pointer border-none"
              style={{
                background: isProvider
                  ? "linear-gradient(135deg,#f59e0b 0%,#f39e10 55%,#e88e00 100%)"
                  : "linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)",
                opacity: (loading || otp.length !== 6) ? 0.6 : 1,
              }}
            >
              {loading ? "Verificando..." : "Confirmar cuenta"}
            </button>
          </form>

          <p className="text-gray-400 text-[12px] mt-6">
            Revisa también tu carpeta de spam.{" "}
            <button
              type="button"
              onClick={() => { setSubstep("email"); setEmail(""); setOtp(""); setError(null); }}
              className="font-semibold underline bg-transparent border-none cursor-pointer p-0"
              style={{ color: accent }}
            >
              Volver al inicio
            </button>
          </p>
        </div>
      )}

      {/* ══ SUB-PASO 2: Nombre y contraseña ═══════════════════ */}
      {substep === "profile" && (
        <>
          <button
            type="button"
            onClick={() => { setSubstep("email"); setError(null); }}
            className="flex items-center gap-1.5 text-gray-400 text-[13px] hover:text-gray-700 transition-colors mb-6 bg-transparent border-none cursor-pointer p-0"
          >
            <ChevronLeft size={15} />
            Volver
          </button>

          {isProvider && <WizardProgress current={1} />}

          <div className="mb-7">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 text-[12px] font-semibold"
              style={{ background: `${accent}1a`, color: accent }}
            >
              {isProvider ? "Cuenta de proveedor · Paso 1 de 5" : "Cuenta de organizador"}
            </div>
            <h1 className="text-gray-900 text-[26px] font-black tracking-[-0.5px] mb-1.5">
              Completa tu cuenta
            </h1>
            <div
              className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg text-[13px]"
              style={{ background: "rgba(34,197,94,0.08)", color: "#15803d" }}
            >
              <ShieldCheck size={14} strokeWidth={2} />
              <span>{email}</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px]">
              {error}
            </div>
          )}

          <form onSubmit={handleCompleteSignup} className="flex flex-col gap-3.5">
            <InputField
              icon={<User size={14} />}
              label={isProvider ? "Nombre del contacto" : "Nombre completo"}
              type="text"
              value={form.nombre}
              onChange={set("nombre")}
              placeholder={isProvider ? "Tu nombre y apellido" : "Juan Pérez"}
              accentColor={accent}
              required
            />

            {!isProvider && (
              <InputField
                icon={<Phone size={14} />}
                label="Teléfono"
                type="tel"
                value={form.telefono}
                onChange={set("telefono")}
                placeholder="+51 999 999 999"
                accentColor={accent}
              />
            )}

            <div>
              <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 text-[14px] outline-none"
                  style={{ fontFamily: "inherit" }}
                  onFocus={(e) => (e.target.style.borderColor = accent)}
                  onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent"
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-1.5 flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full transition-all"
                      style={{ background: i < pwdStrength ? pwdColors[pwdStrength - 1] : "#e5e7eb" }}
                    />
                  ))}
                  <span className="text-[11px] text-gray-400 ml-1 w-10 shrink-0">
                    {pwdLabels[pwdStrength - 1]}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.confirm}
                  onChange={set("confirm")}
                  placeholder="Repite tu contraseña"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl border text-[14px] outline-none transition-colors"
                  style={{
                    fontFamily: "inherit",
                    borderColor: form.confirm && form.confirm !== form.password ? "#fca5a5" : "#e5e7eb",
                  }}
                  onFocus={(e) => {
                    if (!form.confirm || form.confirm === form.password)
                      e.target.style.borderColor = accent;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor =
                      form.confirm && form.confirm !== form.password ? "#fca5a5" : "#e5e7eb";
                  }}
                />
                {form.confirm && form.confirm === form.password && (
                  <Check size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "#22c55e" }} />
                )}
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p className="text-red-400 text-[11px] mt-1">Las contraseñas no coinciden</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3.5 text-white text-[15px] font-bold mt-1 cursor-pointer border-none"
              style={submitBtnStyle}
            >
              {loading
                ? "Creando cuenta..."
                : isProvider ? "Continuar →" : "Crear mi cuenta"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-[440px] animate-pulse" />}>
      <RegistroForm />
    </Suspense>
  );
}
