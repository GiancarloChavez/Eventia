"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getSupabase } from "@/lib/supabase";

function ProviderCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const handle = async () => {
      const supabase = getSupabase();
      const code = searchParams.get("code");

      let user = null;

      if (code) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data.user) {
            user = data.user;
          } else if (error) {
            console.error("[provider callback] exchange error:", error.message);
          }
        } catch (e) {
          console.error("[provider callback] exchange threw:", e);
        }
      }

      if (!user) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          user = session?.user ?? null;
        } catch (e) {
          console.error("[provider callback] getSession threw:", e);
        }
      }

      if (!user) {
        router.replace("/auth?error=auth_callback_error");
        return;
      }

      try {
        await supabase.auth.updateUser({ data: { role: "provider" } });
        await supabase.from("profiles").update({ role: "provider" }).eq("id", user.id);
        await fetch("/api/auth/provider-setup", { method: "POST" });
      } catch (e) {
        console.error("[provider callback] setup error:", e);
      }

      router.replace("/proveedor");
    };

    handle();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-7 h-7 rounded-full border-2 border-[#f39e10] border-t-transparent animate-spin" />
    </div>
  );
}

export default function ProviderCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <div className="w-7 h-7 rounded-full border-2 border-[#f39e10] border-t-transparent animate-spin" />
        </div>
      }
    >
      <ProviderCallbackContent />
    </Suspense>
  );
}
