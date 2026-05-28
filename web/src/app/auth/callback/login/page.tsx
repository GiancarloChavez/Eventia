"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getSupabase } from "@/lib/supabase";

function LoginCallbackContent() {
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
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.user) {
          user = data.user;
        }
      }

      if (!user) {
        const { data: { session } } = await supabase.auth.getSession();
        user = session?.user ?? null;
      }

      if (!user) {
        router.replace("/auth/login?error=oauth_error");
        return;
      }

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
    };

    handle();
  }, [router, searchParams]);

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
