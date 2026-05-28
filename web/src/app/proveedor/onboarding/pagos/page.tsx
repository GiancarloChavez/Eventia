"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Check, CreditCard, ShieldCheck, Zap, AlertCircle } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

// ── Wizard ──────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Cuenta" },
  { id: 2, label: "Negocio" },
  { id: 3, label: "Servicio" },
  { id: 4, label: "Pagos" },
  { id: 5, label: "Revisión" },
];

function WizardProgress({ current }: { current: number }) {
  return (
    <div className="flex items-start mb-8 w-full">
      {STEPS.map((step, i) => {
        const done   = step.id < current;
        const active = step.id === current;
        return (
          <div key={step.id} className="flex items-start flex-1 min-w-0">
            <div className="flex flex-col items-center shrink-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all"
                style={{
                  background: active || done ? "#f39e10" : "#f3f4f6",
                  color:      active || done ? "#fff"    : "#9ca3af",
                }}
              >
                {done ? <Check size={12} strokeWidth={2.5} /> : step.id}
              </div>
              <span
                className="text-[10px] mt-1 font-medium text-center"
                style={{ color: active ? "#f39e10" : done ? "#d97706" : "#9ca3af" }}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-px mt-3.5 mx-1"
                style={{ background: done ? "#f39e10" : "#e5e7eb" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────

export default function PagosPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const incomplete   = searchParams.get("incomplete") === "1";

  const [loading,    setLoading]    = useState(false);
  const [prefilling, setPrefilling] = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [hasAccount, setHasAccount] = useState(false);

  useEffect(() => {
    const prefill = async () => {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/auth");
        return;
      }

      const { data: provider } = await supabase
        .from("providers")
        .select("stripe_account_id, stripe_onboarding_complete, onboarding_step")
        .eq("user_id", session.user.id)
        .single();

      if (!provider) {
        router.replace("/auth/registro?tipo=proveedor");
        return;
      }

      if (provider.onboarding_step >= 4) {
        router.replace("/proveedor");
        return;
      }

      setHasAccount(!!provider.stripe_account_id);
      setPrefilling(false);
    };
    prefill();
  }, [router]);

  const handleConnect = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/connect/onboard", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo iniciar la conexión con Stripe.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Error de red. Intenta de nuevo.");
      setLoading(false);
    }
  };

  if (prefilling) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-7 h-7 rounded-full border-2 border-[#f39e10] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Back */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-gray-400 text-[13px] hover:text-gray-700 transition-colors mb-6 bg-transparent border-none cursor-pointer"
      >
        <ChevronLeft size={15} />
        Volver
      </button>

      {/* Wizard */}
      <WizardProgress current={4} />

      {/* Header */}
      <div className="mb-7">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 text-[12px] font-semibold"
          style={{ background: "rgba(243,158,16,0.10)", color: "#f39e10" }}
        >
          Cuenta de proveedor · Paso 4 de 5
        </div>
        <h1 className="text-gray-900 text-[26px] font-black tracking-[-0.5px] mb-1.5">
          Cuenta de pagos
        </h1>
        <p className="text-gray-500 text-[14px]">
          Conecta tu cuenta bancaria para recibir los pagos de tus eventos.
        </p>
      </div>

      {/* Incomplete warning */}
      {incomplete && (
        <div className="mb-5 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-amber-50 border border-amber-200">
          <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-amber-800 text-[13px] leading-relaxed">
            No completaste la configuración en Stripe. Puedes retomar desde donde lo dejaste.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px]">
          {error}
        </div>
      )}

      {/* Stripe Connect card */}
      <div
        className="rounded-2xl border p-6 mb-5"
        style={{ background: "#fafafa", borderColor: "#e5e7eb" }}
      >
        {/* Card header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(243,158,16,0.10)" }}
          >
            <CreditCard size={22} style={{ color: "#f39e10" }} strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-gray-900 text-[15px] font-bold">Stripe Connect Express</div>
            <div className="text-gray-500 text-[12px]">Procesamiento de pagos seguro</div>
          </div>
        </div>

        {/* Benefits */}
        <div className="flex flex-col gap-3 mb-6">
          {[
            { icon: Zap,         text: "Recibe el pago directo a tu cuenta bancaria." },
            { icon: ShieldCheck, text: "Eventia retiene la comisión automáticamente." },
            { icon: CreditCard,  text: "Acepta tarjetas de crédito, débito y más." },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(243,158,16,0.08)" }}
              >
                <Icon size={14} style={{ color: "#f39e10" }} strokeWidth={1.8} />
              </div>
              <span className="text-gray-600 text-[13px]">{text}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mb-5" />

        {/* Info note */}
        <p className="text-gray-400 text-[12px] leading-relaxed">
          Serás redirigido a Stripe para completar el proceso. Solo te tomará unos minutos.
          Necesitarás tu DNI o RUC y datos bancarios.
        </p>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={handleConnect}
        disabled={loading}
        className="w-full rounded-xl py-3.5 text-white text-[15px] font-bold cursor-pointer border-none"
        style={{
          background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
          boxShadow: "0 4px 20px rgba(243,158,16,0.4)",
          opacity: loading ? 0.75 : 1,
          transition: "opacity 200ms",
        }}
      >
        {loading
          ? "Redirigiendo a Stripe..."
          : hasAccount
          ? "Retomar configuración →"
          : "Conectar cuenta de pagos →"}
      </button>

      <p className="text-center text-gray-400 text-[11px] mt-3">
        Tus datos financieros son gestionados directamente por Stripe. Eventia no almacena
        información bancaria.
      </p>
    </div>
  );
}
