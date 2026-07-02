"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Lock, Mail, ShieldCheck, AlertTriangle } from "lucide-react";

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const sb = getSupabase();
    const { data, error: signInError } = await sb.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Credenciales incorrectas");
      setLoading(false);
      return;
    }

    const { data: profile } = await sb
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role !== "admin") {
      await sb.auth.signOut();
      setError("Esta cuenta no tiene acceso al panel de administración");
      setLoading(false);
      return;
    }

    router.push("/proveedores");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #f59e0b, #f39e10)" }}
          >
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Eventia Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Acceso restringido a administradores</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          {error && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
              <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-gray-700 text-sm font-semibold block mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eventia.pe"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-colors"
                  onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
                  onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
            </div>

            <div>
              <label className="text-gray-700 text-sm font-semibold block mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-colors"
                  onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
                  onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white text-sm font-bold transition-opacity cursor-pointer border-none mt-2"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #f39e10)",
                opacity: loading ? 0.75 : 1,
              }}
            >
              {loading ? "Verificando..." : "Ingresar al panel"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          Solo personal autorizado de Eventia
        </p>
      </div>
    </div>
  );
}
