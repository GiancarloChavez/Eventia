"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, AlertTriangle } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

// ── Google icon ──────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// ── Login content ────────────────────────────────────────────

function LoginContent() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const urlError    = searchParams.get("error");

  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [showPwd,       setShowPwd]       = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error: oauthError } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback/login`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const sb = getSupabase();
    const { data, error: signInError } = await sb.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    const { data: profile } = await sb
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    router.push(profile?.role === "provider" ? "/proveedor" : "/cliente");
  };

  return (
    <div className="w-full max-w-[400px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 text-[28px] font-black tracking-[-0.5px] mb-2">
          Bienvenido de vuelta
        </h1>
        <p className="text-gray-500 text-[14px]">Ingresa a tu cuenta para continuar</p>
      </div>

      {/* OAuth warning: account not found */}
      {urlError === "no_account" && (
        <div className="mb-5 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-amber-800 text-[13px] font-semibold mb-0.5">
              Cuenta no encontrada
            </p>
            <p className="text-amber-700 text-[13px] leading-relaxed">
              No tienes una cuenta de Eventia vinculada a ese correo de Google.{" "}
              <Link href="/auth" className="font-semibold underline underline-offset-2">
                Crea una cuenta nueva →
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Generic OAuth error */}
      {urlError === "oauth_error" && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px]">
          Ocurrió un error al iniciar sesión con Google. Intenta de nuevo.
        </div>
      )}

      {/* Form-level error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px]">
          {error}
        </div>
      )}

      {/* Google button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer bg-white mb-4"
        style={{ opacity: googleLoading ? 0.75 : 1 }}
      >
        <GoogleIcon />
        {googleLoading ? "Redirigiendo..." : "Continuar con Google"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-gray-400 text-[12px]">o continúa con tu correo</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Email / password form */}
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        {/* Email */}
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
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] outline-none transition-colors"
              style={{ fontFamily: "inherit" }}
              onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
              onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-gray-700 text-[13px] font-semibold">Contraseña</label>
            <span className="text-[#f39e10] text-[12px] cursor-pointer hover:underline">
              ¿Olvidaste tu contraseña?
            </span>
          </div>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
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
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-3.5 text-white text-[15px] font-bold mt-1 cursor-pointer border-none transition-opacity"
          style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
            boxShadow: "0 4px 20px rgba(243,158,16,0.4)",
            opacity: loading ? 0.75 : 1,
          }}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-gray-400 text-[12px]">¿No tienes cuenta?</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <Link
        href="/auth"
        className="flex items-center justify-center w-full border-2 border-gray-200 rounded-2xl py-3.5 text-gray-700 text-[14px] font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
      >
        Crear una cuenta
      </Link>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-[400px] h-96 animate-pulse rounded-2xl bg-gray-100" />}>
      <LoginContent />
    </Suspense>
  );
}
