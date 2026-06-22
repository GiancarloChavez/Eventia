"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe, StripeCardElement } from "@stripe/stripe-js";
import { ChevronLeft, Check, CreditCard, ShieldCheck, Lock } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

// Loaded once at module level to avoid recreating the Promise on each render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
  const router = useRouter();

  const cardMountRef  = useRef<HTMLDivElement>(null);
  const stripeRef     = useRef<Stripe | null>(null);
  const cardRef       = useRef<StripeCardElement | null>(null);
  const mountedRef    = useRef(false);

  const [prefilling,    setPrefilling]    = useState(true);
  const [providerId,    setProviderId]    = useState<string | null>(null);
  const [clientSecret,  setClientSecret]  = useState<string | null>(null);
  const [cardReady,     setCardReady]     = useState(false);
  const [cardMountFail, setCardMountFail] = useState(false);
  const [cardComplete,  setCardComplete]  = useState(false);
  const [cardError,     setCardError]     = useState<string | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  // ── Load provider + create SetupIntent ───────────────────

  useEffect(() => {
    const init = async () => {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) { router.replace("/auth"); return; }

      const { data: provider } = await supabase
        .from("providers")
        .select("id, onboarding_step")
        .eq("user_id", session.user.id)
        .single();

      if (!provider) { router.replace("/auth/registro?tipo=proveedor"); return; }
      if (provider.onboarding_step >= 4) { router.replace("/proveedor"); return; }

      setProviderId(provider.id);

      const res  = await fetch("/api/stripe/setup-intent", { method: "POST" });
      const data = await res.json();

      if (!res.ok) { setError(data.error ?? "Error al inicializar el formulario."); setPrefilling(false); return; }

      setClientSecret(data.clientSecret);
      setPrefilling(false);
    };
    init();
  }, [router]);

  // ── Mount Stripe Card Element when clientSecret is ready ─

  useEffect(() => {
    if (!clientSecret || !cardMountRef.current || mountedRef.current) return;
    mountedRef.current = true;

    stripePromise.then((stripe) => {
      if (!stripe || !cardMountRef.current) return;
      stripeRef.current = stripe;

      const elements   = stripe.elements();
      const cardElement = elements.create("card", {
        hidePostalCode: true,
        style: {
          base: {
            fontSize: "14px",
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: "400",
            color: "#111827",
            "::placeholder": { color: "#9ca3af" },
          },
          invalid: { color: "#ef4444", iconColor: "#ef4444" },
        },
      });

      cardElement.mount(cardMountRef.current);
      cardRef.current = cardElement;

      const readyRef = { value: false };

      cardElement.on("ready", () => {
        readyRef.value = true;
        setCardReady(true);
      });
      cardElement.on("change", (e) => {
        setCardError(e.error?.message ?? null);
        setCardComplete(e.complete);
      });

      // If card never becomes ready in 12s → connection error
      const timeout = setTimeout(() => {
        if (!readyRef.value) setCardMountFail(true);
      }, 12_000);

      return () => clearTimeout(timeout);
    });
  }, [clientSecret]);

  // ── Skip ─────────────────────────────────────────────────

  const handleSkip = async () => {
    setLoading(true);
    await getSupabase()
      .from("providers")
      .update({ onboarding_step: 4 })
      .eq("id", providerId);
    router.push("/proveedor/onboarding/revision");
  };

  // ── Submit ───────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripeRef.current || !cardRef.current || !clientSecret) return;

    setError(null);
    setLoading(true);

    const { setupIntent, error: stripeError } = await stripeRef.current.confirmCardSetup(
      clientSecret,
      { payment_method: { card: cardRef.current } }
    );

    if (stripeError || !setupIntent?.payment_method) {
      setError(stripeError?.message ?? "No se pudo validar la tarjeta. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/stripe/save-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethodId: setupIntent.payment_method }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error al guardar la tarjeta.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/proveedor/onboarding/revision");
  };

  // ── Render ───────────────────────────────────────────────

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
          Método de pago
        </h1>
        <p className="text-gray-500 text-[14px]">
          Agrega tu tarjeta de débito para recibir los pagos de tus servicios.
        </p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Card input card */}
        <div
          className="rounded-2xl border p-5"
          style={{ background: "#fafafa", borderColor: "#e5e7eb" }}
        >
          {/* Card icon + label */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(243,158,16,0.10)" }}
            >
              <CreditCard size={20} style={{ color: "#f39e10" }} strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-gray-900 text-[14px] font-bold">Datos de la tarjeta</div>
              <div className="text-gray-400 text-[12px]">Débito / Crédito</div>
            </div>
          </div>

          {/* Stripe card element container */}
          <div className="relative">
            {/* Loading / error overlay — shown until card is ready */}
            {!cardReady && !cardMountFail && (
              <div
                className="w-full px-3.5 py-3.5 rounded-xl border border-gray-200 bg-white flex items-center gap-2"
                style={{ minHeight: "44px" }}
              >
                <div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-gray-400 animate-spin shrink-0" />
                <span className="text-gray-300 text-[13px]">Cargando formulario seguro…</span>
              </div>
            )}

            {cardMountFail && (
              <div className="w-full px-3.5 py-3.5 rounded-xl border border-red-100 bg-red-50 text-red-600 text-[13px]">
                No se pudo conectar con Stripe. Verifica tu conexión a internet y recarga la página.
              </div>
            )}

            {/* Stripe mounts its iframe here — must ALWAYS stay in the DOM */}
            <div
              ref={cardMountRef}
              className="w-full px-3.5 py-3.5 rounded-xl border border-gray-200 bg-white"
              style={{
                minHeight: "44px",
                visibility: cardReady ? "visible" : "hidden",
                position:   cardReady ? "relative" : "absolute",
                top: 0, left: 0, right: 0,
              }}
            />
          </div>

          {cardError && (
            <p className="text-red-500 text-[12px] mt-2">{cardError}</p>
          )}
        </div>

        {/* Security badges */}
        <div className="flex flex-col gap-2.5">
          {[
            { icon: ShieldCheck, text: "Tus datos son procesados directamente por Stripe. Eventia nunca almacena el número de tu tarjeta." },
            { icon: Lock,        text: "Conexión cifrada SSL. Solo validamos la tarjeta — no se realizará ningún cobro en este paso." },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "rgba(243,158,16,0.08)" }}
              >
                <Icon size={13} style={{ color: "#f39e10" }} strokeWidth={1.8} />
              </div>
              <span className="text-gray-400 text-[12px] leading-relaxed">{text}</span>
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !cardComplete}
          className="w-full rounded-xl py-3.5 text-white text-[15px] font-bold cursor-pointer border-none flex items-center justify-center gap-2 mt-1"
          style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
            boxShadow: "0 4px 20px rgba(243,158,16,0.4)",
            opacity: loading || !cardComplete ? 0.6 : 1,
            transition: "opacity 200ms",
          }}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Validando tarjeta…
            </>
          ) : (
            "Guardar tarjeta →"
          )}
        </button>

        {/* Skip */}
        <button
          type="button"
          onClick={handleSkip}
          disabled={loading}
          className="w-full py-2.5 text-gray-400 text-[13px] cursor-pointer bg-transparent border-none hover:text-gray-600 transition-colors"
        >
          Omitir por ahora
        </button>

      </form>
    </div>
  );
}
