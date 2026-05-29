"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { getSupabase } from "@/lib/supabase";

function LoginCallbackContent() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const hasCode = new URLSearchParams(window.location.search).has("code");
    if (!hasCode) {
      router.replace("/auth/login");
      return;
    }

    const supabase = getSupabase();
    let subRef: { unsubscribe: () => void } | null = null;

    const timer = setTimeout(() => {
      subRef?.unsubscribe();
      router.replace("/auth/login?error=oauth_error");
    }, 15000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event !== "SIGNED_IN" || !session?.user) return;

      clearTimeout(timer);
      subscription.unsubscribe();

      const user = session.user;
      const secondsSinceCreation =
        (Date.now() - new Date(user.created_at).getTime()) / 1000;

      if (secondsSinceCreation < 30) {
        await fetch("/api/auth/delete-unregistered-user", { method: "POST" });
        router.replace("/auth/login?error=no_account");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const dest = profile?.role === "provider" ? "/proveedor" : "/cliente";
      router.replace(dest);
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

export default function LoginCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <div className="w-7 h-7 rounded-full border-2 border-[#f39e10] border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginCallbackContent />
    </Suspense>
  );
}
