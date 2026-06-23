"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const next      = searchParams.get("next") ?? "";
    const code      = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type      = searchParams.get("type");
    const sb        = getSupabase();

    async function handle() {
      let ok = false;

      if (tokenHash) {
        // token_hash flow — works cross-device, no PKCE verifier needed.
        // For initial signup, type="signup". For email change, type="email".
        // Always try both so that any template variation works.
        const primary   = (type === "signup" || type === "email") ? type : "signup";
        const secondary = primary === "signup" ? "email" : "signup";
        for (const t of [primary, secondary] as const) {
          const { error } = await sb.auth.verifyOtp({ token_hash: tokenHash, type: t });
          if (!error) { ok = true; break; }
        }
      } else if (code) {
        // PKCE flow — works when the same browser is used.
        const { error } = await sb.auth.exchangeCodeForSession(code);
        if (!error) ok = true;
      }

      if (!ok) {
        // Wait briefly — the SDK may have set a session via the URL hash.
        await new Promise((r) => setTimeout(r, 400));
        const { data: { user } } = await sb.auth.getUser();
        if (user) ok = true;
      }

      if (!ok) {
        setStatus("error");
        return;
      }

      const { data: { user } } = await sb.auth.getUser();
      if (!user) { setStatus("error"); return; }

      if (next && next !== "/") {
        router.replace(next);
        return;
      }

      const { data: profile } = await sb
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "provider") {
        router.replace("/proveedor/onboarding/negocio");
      } else if (profile?.role === "client") {
        router.replace("/cliente");
      } else {
        router.replace("/");
      }
    }

    handle();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center">
        <p className="text-gray-700 font-semibold text-[15px]">El enlace expiró o ya fue usado.</p>
        <p className="text-gray-400 text-[13px]">Puedes registrarte de nuevo o iniciar sesión si ya verificaste tu correo.</p>
        <div className="flex gap-3 mt-2">
          <a href="/auth/registro" className="px-4 py-2 rounded-xl bg-[#f39e10] text-white text-[13px] font-bold">
            Registrarse
          </a>
          <a href="/auth/login" className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-[13px] font-semibold">
            Iniciar sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="w-10 h-10 border-2 border-[#f39e10] border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 text-[14px]">Verificando tu correo...</p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-[#f39e10] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
