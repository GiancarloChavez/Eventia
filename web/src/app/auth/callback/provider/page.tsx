"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { getSupabase } from "@/lib/supabase";

function ProviderCallbackContent() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const hasCode = new URLSearchParams(window.location.search).has("code");
    if (!hasCode) {
      router.replace("/auth");
      return;
    }

    const supabase = getSupabase();
    let subRef: { unsubscribe: () => void } | null = null;

    const timer = setTimeout(() => {
      subRef?.unsubscribe();
      router.replace("/auth?error=auth_callback_error");
    }, 15000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event !== "SIGNED_IN" || !session?.user) return;

      clearTimeout(timer);
      subscription.unsubscribe();

      try {
        await supabase.auth.updateUser({ data: { role: "provider" } });
        await supabase.from("profiles").update({ role: "provider" }).eq("id", session.user.id);
        await fetch("/api/auth/provider-setup", { method: "POST" });
      } catch (e) {
        console.error("[provider callback] setup error:", e);
      }

      router.replace("/proveedor");
    });
    subRef = subscription;

    return () => {
      clearTimeout(timer);
      subRef?.unsubscribe();
    };
  }, [router]);

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
