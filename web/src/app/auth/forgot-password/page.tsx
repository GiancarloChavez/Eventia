"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const sb = getSupabase();
    const { error: resetError } = await sb.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="w-full max-w-[400px] text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={30} className="text-green-500" strokeWidth={2} />
        </div>
        <h1 className="text-gray-900 text-[24px] font-black mb-2">Revisa tu correo</h1>
        <p className="text-gray-500 text-[14px] leading-relaxed mb-2">
          Enviamos un enlace de recuperación a
        </p>
        <p className="text-gray-900 text-[14px] font-bold mb-6">{email}</p>
        <p className="text-gray-400 text-[13px] mb-8 leading-relaxed">
          Haz clic en el enlace del correo para crear tu nueva contraseña.
          Si no lo ves, revisa tu carpeta de spam.
        </p>
        <button
          onClick={() => setSent(false)}
          className="text-[#f39e10] text-[13px] font-semibold hover:underline bg-transparent border-none cursor-pointer mb-6"
        >
          ¿No recibiste el correo? Intentar de nuevo
        </button>
        <div className="flex items-center justify-center">
          <Link
            href="/auth/login"
            className="flex items-center gap-1.5 text-gray-400 text-[13px] font-medium hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={14} /> Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

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
          ¿Olvidaste tu contraseña?
        </h1>
        <p className="text-gray-500 text-[14px] leading-relaxed">
          Ingresa tu correo y te enviaremos un enlace para recuperar tu acceso.
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              autoFocus
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] outline-none transition-colors"
              style={{ fontFamily: "inherit" }}
              onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
              onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full rounded-xl py-3.5 text-white text-[15px] font-bold cursor-pointer border-none mt-1 transition-opacity"
          style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
            boxShadow:  "0 4px 20px rgba(243,158,16,0.4)",
            opacity:    loading || !email.trim() ? 0.7 : 1,
          }}
        >
          {loading ? "Enviando..." : "Enviar enlace de recuperación"}
        </button>
      </form>
    </div>
  );
}
