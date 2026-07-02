"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Check, Building2, Camera, Music2, Sparkles,
  MapPin, Phone, FileText, DollarSign, Users, CalendarDays,
  CreditCard, AlertCircle, CheckCircle2, Send,
} from "lucide-react";
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

// ── Constants ───────────────────────────────────────────────

const CATEGORY_LABELS: Record<number, { label: string; Icon: React.ElementType }> = {
  1: { label: "Locales y salones",  Icon: Building2 },
  2: { label: "Fotografía y video", Icon: Camera    },
  3: { label: "Música",             Icon: Music2    },
  4: { label: "Decoración",         Icon: Sparkles  },
};

// ── Types ────────────────────────────────────────────────────

interface ProviderData {
  id: string;
  business_name: string | null;
  description: string | null;
  category_id: number | null;
  city: string | null;
  phone: string | null;
  stripe_payment_method_id: string | null;
  stripe_card_last4: string | null;
  stripe_card_brand: string | null;
  onboarding_step: number;
}

interface ServiceData {
  title: string;
  description: string | null;
  pricing_type: string;
  base_price: number | null;
  capacity_min: number | null;
  capacity_max: number | null;
  event_types: string[];
  advance_days: number;
  location: string | null;
}

// ── Sub-components ───────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden mb-4">
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <span className="text-gray-700 text-[13px] font-bold">{title}</span>
      </div>
      <div className="px-5 py-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-gray-400" strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <div className="text-gray-400 text-[11px] uppercase tracking-[0.5px] font-semibold mb-0.5">{label}</div>
        <div className="text-gray-800 text-[13px] leading-relaxed">{value}</div>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────

export default function RevisionPage() {
  const router = useRouter();

  const [loading,    setLoading]    = useState(false);
  const [prefilling, setPrefilling] = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [provider,   setProvider]   = useState<ProviderData | null>(null);
  const [service,    setService]    = useState<ServiceData | null>(null);

  useEffect(() => {
    const prefill = async () => {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/auth");
        return;
      }

      const { data: prov } = await supabase
        .from("providers")
        .select("id, business_name, description, category_id, city, phone, stripe_payment_method_id, stripe_card_last4, stripe_card_brand, onboarding_step")
        .eq("user_id", session.user.id)
        .single();

      if (!prov) {
        router.replace("/auth/registro?tipo=proveedor");
        return;
      }

      if (prov.onboarding_step >= 5) {
        router.replace("/proveedor");
        return;
      }

      if (prov.onboarding_step < 4) {
        router.replace("/proveedor");
        return;
      }

      const { data: svc } = await supabase
        .from("services")
        .select("title, description, pricing_type, base_price, capacity_min, capacity_max, event_types, advance_days, location")
        .eq("provider_id", prov.id)
        .limit(1)
        .maybeSingle();

      if (!svc) {
        router.replace("/proveedor/onboarding/servicio");
        return;
      }

      setProvider(prov);
      setService(svc);
      setPrefilling(false);
    };
    prefill();
  }, [router]);

  const handleSubmit = async () => {
    if (!provider) return;
    setError(null);
    setLoading(true);

    const { error: dbError } = await getSupabase()
      .from("providers")
      .update({ status: "pending", onboarding_step: 5 })
      .eq("id", provider.id);

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    router.replace("/proveedor");
  };

  if (prefilling) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-7 h-7 rounded-full border-2 border-[#f39e10] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!provider || !service) return null;

  const category = provider.category_id ? CATEGORY_LABELS[provider.category_id] : null;

  const capacityText = (() => {
    const { capacity_min: mn, capacity_max: mx } = service;
    if (mn && mx) return `${mn} – ${mx} personas`;
    if (mn) return `Mín. ${mn} personas`;
    if (mx) return `Máx. ${mx} personas`;
    return null;
  })();

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
      <WizardProgress current={5} />

      {/* Header */}
      <div className="mb-7">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 text-[12px] font-semibold"
          style={{ background: "rgba(243,158,16,0.10)", color: "#f39e10" }}
        >
          Cuenta de proveedor · Paso 5 de 5
        </div>
        <h1 className="text-gray-900 text-[26px] font-black tracking-[-0.5px] mb-1.5">
          Revisión final
        </h1>
        <p className="text-gray-500 text-[14px]">
          Confirma que toda la información es correcta antes de enviar tu solicitud.
        </p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px]">
          {error}
        </div>
      )}

      {/* ── Negocio ── */}
      <SectionCard title="Tu negocio">
        {provider.business_name && (
          <Row icon={Building2} label="Nombre" value={provider.business_name} />
        )}
        {category && (
          <Row icon={category.Icon} label="Categoría" value={category.label} />
        )}
        {provider.city && (
          <Row icon={MapPin} label="Ciudad" value={provider.city} />
        )}
        {provider.phone && (
          <Row icon={Phone} label="Teléfono" value={provider.phone} />
        )}
        {provider.description && (
          <Row icon={FileText} label="Descripción" value={provider.description} />
        )}
      </SectionCard>

      {/* ── Servicio ── */}
      <SectionCard title="Tu servicio">
        <Row icon={FileText} label="Nombre del servicio" value={service.title} />
        <Row
          icon={DollarSign}
          label="Tipo de precio"
          value={
            service.pricing_type === "fixed" && service.base_price != null
              ? `Precio fijo — S/ ${service.base_price.toLocaleString("es-PE")}`
              : "Cotización por solicitud"
          }
        />
        {capacityText && (
          <Row icon={Users} label="Capacidad" value={capacityText} />
        )}
        {service.event_types.length > 0 && (
          <Row icon={CalendarDays} label="Tipos de evento" value={service.event_types.join(", ")} />
        )}
        {service.advance_days > 0 && (
          <Row icon={CalendarDays} label="Anticipación requerida" value={`${service.advance_days} días`} />
        )}
        {service.location && (
          <Row icon={MapPin} label="Ubicación / Cobertura" value={service.location} />
        )}
        {service.description && (
          <Row icon={FileText} label="Descripción" value={service.description} />
        )}
      </SectionCard>

      {/* ── Pagos ── */}
      <SectionCard title="Método de pago">
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: provider.stripe_payment_method_id
                ? "rgba(16,185,129,0.10)"
                : "rgba(243,158,16,0.10)",
            }}
          >
            <CreditCard
              size={13}
              strokeWidth={1.8}
              style={{ color: provider.stripe_payment_method_id ? "#10b981" : "#f39e10" }}
            />
          </div>
          <div>
            <div className="text-gray-400 text-[11px] uppercase tracking-[0.5px] font-semibold mb-0.5">
              Tarjeta de débito
            </div>
            {provider.stripe_payment_method_id ? (
              <div className="flex items-center gap-1.5 text-[13px] text-emerald-700 font-semibold">
                <CheckCircle2 size={13} />
                {provider.stripe_card_brand
                  ? `${provider.stripe_card_brand.charAt(0).toUpperCase() + provider.stripe_card_brand.slice(1)} •••• ${provider.stripe_card_last4}`
                  : "Tarjeta guardada"}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[13px] text-amber-600">
                <AlertCircle size={13} />
                Pendiente de configurar
              </div>
            )}
          </div>
        </div>

        {!provider.stripe_payment_method_id && (
          <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-amber-50 border border-amber-200 mt-1">
            <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-amber-800 text-[12px] leading-relaxed">
              No agregaste una tarjeta. Puedes enviar tu solicitud igual, pero necesitarás
              configurarla antes de que tu perfil sea aprobado.
            </p>
          </div>
        )}
      </SectionCard>

      {/* ── Legal notice ── */}
      <div
        className="rounded-xl border px-4 py-3.5 mb-6 text-[12px] text-gray-500 leading-relaxed"
        style={{ background: "#fafafa", borderColor: "#e5e7eb" }}
      >
        Al enviar tu solicitud aceptas los{" "}
        <span className="text-[#f39e10] font-semibold cursor-pointer hover:underline">
          Términos de servicio
        </span>{" "}
        y la{" "}
        <span className="text-[#f39e10] font-semibold cursor-pointer hover:underline">
          Política de privacidad
        </span>{" "}
        de Eventia. Nuestro equipo revisará tu perfil en un plazo de 48 horas hábiles y te
        notificará por correo.
      </div>

      {/* ── Submit ── */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="w-full rounded-xl py-3.5 text-white text-[15px] font-bold cursor-pointer border-none flex items-center justify-center gap-2"
        style={{
          background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
          boxShadow: "0 4px 20px rgba(243,158,16,0.4)",
          opacity: loading ? 0.75 : 1,
          transition: "opacity 200ms",
        }}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            Enviando solicitud...
          </>
        ) : (
          <>
            <Send size={16} />
            Enviar solicitud
          </>
        )}
      </button>
    </div>
  );
}
