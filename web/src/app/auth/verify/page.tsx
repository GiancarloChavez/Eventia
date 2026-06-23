"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const next = searchParams.get("next") ?? "/";
    const sb = getSupabase();

    async function handle() {
      // In PKCE flow, Supabase appends ?code=xxx; exchange it for a session.
      // In implicit flow, the SDK reads the hash automatically on init.
      const code = searchParams.get("code");
      if (code) {
        const { error } = await sb.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("[verify] exchangeCodeForSession:", error.message);
          setStatus("error");
          return;
        }
      }

      // Wait briefly for the SDK to finish processing hash-based tokens.
      await new Promise((r) => setTimeout(r, 300));

      const { data: { user } } = await sb.auth.getUser();
      if (!user) {
        setStatus("error");
        return;
      }

      // If a specific redirect was requested, honour it
      if (next && next !== "/") {
        router.replace(next);
        return;
      }

      // Otherwise redirect based on the user's role
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
        <p className="text-gray-700 font-semibold">El enlace expiró o ya fue usado.</p>
        <a href="/auth/registro" className="text-[#f39e10] font-bold underline text-[14px]">
          Volver al registro
        </a>
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
