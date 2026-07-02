"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

function ResetPasswordContent() {
  const router = useRouter();

  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPwd,     setShowPwd]     = useState(false);
  const [showConf,    setShowConf]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [done,        setDone]        = useState(false);
  const [hasSession,  setHasSession]  = useState<boolean | null>(null);

  useEffect(() => {
    getSupabase().auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const sb = getSupabase();
    const { error: updateError } = await sb.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Sign out the recovery session so the user starts fresh
    await sb.auth.signOut();
    setDone(true);
    setLoading(false);

    setTimeout(() => router.push("/auth/login?reset=success"), 2500);
  };

  // Loading state while checking session
  if (hasSession === null) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[#f39e10] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Expired or invalid link
  if (!hasSession) {
    return (
      <div className="w-full max-w-[400px] text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
          <Lock size={26} className="text-red-400" strokeWidth={1.8} />
        </div>
        <h1 className="text-gray-900 text-[22px] font-black mb-2">Enlace expirado</h1>
        <p className="text-gray-500 text-[14px] leading-relaxed mb-6">
          Este enlace ya fue usado o expiró. Los enlaces de recuperación son válidos por 1 hora.
        </p>
        <Link
          href="/auth/forgot-password"
          className="inline-block px-6 py-3 rounded-xl text-white text-[14px] font-bold"
          style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
            boxShadow:  "0 4px 20px rgba(243,158,16,0.4)",
          }}
        >
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  // Success state
  if (done) {
    return (
      <div className="w-full max-w-[400px] text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={30} className="text-green-500" strokeWidth={2} />
        </div>
        <h1 className="text-gray-900 text-[24px] font-black mb-2">¡Contraseña actualizada!</h1>
        <p className="text-gray-500 text-[14px] leading-relaxed">
          Tu contraseña fue cambiada correctamente. Redirigiendo al inicio de sesión...
        </p>
        <div className="w-6 h-6 border-2 border-[#f39e10] border-t-transparent rounded-full animate-spin mx-auto mt-6" />
      </div>
    );
  }

  const canSubmit = password.length >= 8 && password === confirm;

  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-8">
        <Link
          href="/auth/login"
          className="flex items-center gap-1.5 text-gray-400 text-[13px] font-medium hover:text-gray-700 transition-colors mb-7"
        >
          <ArrowLeft size={14} /> Volver al inicio de sesión
        </Link>
        <h1 className="text-gray-900 text-[28px] font-black tracking-[-0.5px] mb-2">
          Nueva contraseña
        </h1>
        <p className="text-gray-500 text-[14px]">
          Elige una contraseña segura para tu cuenta.
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* New password */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
            Nueva contraseña
          </label>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              autoFocus
              className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 text-[14px] outline-none transition-colors"
              style={{ fontFamily: "inherit" }}
              onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
              onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent"
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {password.length > 0 && password.length < 8 && (
            <p className="text-red-400 text-[12px] mt-1.5 ml-1">Mínimo 8 caracteres</p>
          )}
          {password.length >= 8 && (
            <p className="text-green-500 text-[12px] mt-1.5 ml-1 flex items-center gap-1">
              <CheckCircle size={12} /> Longitud correcta
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
            Confirmar contraseña
          </label>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type={showConf ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repite la contraseña"
              required
              className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 text-[14px] outline-none transition-colors"
              style={{ fontFamily: "inherit" }}
              onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
              onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
            />
            <button
              type="button"
              onClick={() => setShowConf(!showConf)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent"
            >
              {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {confirm.length > 0 && confirm !== password && (
            <p className="text-red-400 text-[12px] mt-1.5 ml-1">Las contraseñas no coinciden</p>
          )}
          {confirm.length > 0 && confirm === password && (
            <p className="text-green-500 text-[12px] mt-1.5 ml-1 flex items-center gap-1">
              <CheckCircle size={12} /> Las contraseñas coinciden
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="w-full rounded-xl py-3.5 text-white text-[15px] font-bold cursor-pointer border-none mt-1 transition-opacity"
          style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
            boxShadow:  "0 4px 20px rgba(243,158,16,0.4)",
            opacity:    loading || !canSubmit ? 0.65 : 1,
          }}
        >
          {loading ? "Guardando..." : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#f39e10] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
