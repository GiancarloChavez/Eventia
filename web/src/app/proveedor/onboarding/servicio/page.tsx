"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, DollarSign, Users, CalendarDays, MapPin, ChevronLeft, Check,
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

const EVENT_TYPES = [
  "Boda",
  "Quinceaños",
  "Graduación",
  "Aniversario",
  "Corporativo",
  "Otro",
];

// ── Page ────────────────────────────────────────────────────

export default function ServicioPage() {
  const router = useRouter();

  const [loading,    setLoading]    = useState(false);
  const [prefilling, setPrefilling] = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [serviceId,  setServiceId]  = useState<string | null>(null);

  const [form, setForm] = useState({
    title:       "",
    description: "",
    pricingType: "fixed" as "fixed" | "quote",
    basePrice:   "",
    capacityMin: "",
    capacityMax: "",
    eventTypes:  [] as string[],
    advanceDays: "",
    location:    "",
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleEventType = (type: string) =>
    setForm((f) => ({
      ...f,
      eventTypes: f.eventTypes.includes(type)
        ? f.eventTypes.filter((t) => t !== type)
        : [...f.eventTypes, type],
    }));

  // Pre-fill from existing provider + service rows
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
        .select("id, category_id, onboarding_step")
        .eq("user_id", session.user.id)
        .single();

      if (!provider) {
        router.replace("/auth/registro?tipo=proveedor");
        return;
      }

      if (provider.onboarding_step >= 3) {
        router.replace("/proveedor");
        return;
      }

      setProviderId(provider.id);
      setCategoryId(provider.category_id);

      // Pre-fill if they already started this step
      const { data: service } = await supabase
        .from("services")
        .select("id, title, description, pricing_type, base_price, capacity_min, capacity_max, event_types, advance_days, location")
        .eq("provider_id", provider.id)
        .limit(1)
        .maybeSingle();

      if (service) {
        setServiceId(service.id);
        setForm({
          title:       service.title        ?? "",
          description: service.description  ?? "",
          pricingType: (service.pricing_type as "fixed" | "quote") ?? "fixed",
          basePrice:   service.base_price   != null ? String(service.base_price) : "",
          capacityMin: service.capacity_min != null ? String(service.capacity_min) : "",
          capacityMax: service.capacity_max != null ? String(service.capacity_max) : "",
          eventTypes:  service.event_types  ?? [],
          advanceDays: service.advance_days != null ? String(service.advance_days) : "",
          location:    service.location     ?? "",
        });
      }

      setPrefilling(false);
    };
    prefill();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.eventTypes.length === 0) {
      setError("Selecciona al menos un tipo de evento.");
      return;
    }
    if (form.pricingType === "fixed" && !form.basePrice) {
      setError("Ingresa el precio base del servicio.");
      return;
    }

    setError(null);
    setLoading(true);

    const supabase = getSupabase();

    const payload = {
      provider_id:   providerId,
      category_id:   categoryId,
      title:         form.title,
      description:   form.description || null,
      pricing_type:  form.pricingType,
      base_price:    form.pricingType === "fixed" ? parseFloat(form.basePrice) : null,
      capacity_min:  form.capacityMin ? parseInt(form.capacityMin) : null,
      capacity_max:  form.capacityMax ? parseInt(form.capacityMax) : null,
      event_types:   form.eventTypes,
      advance_days:  form.advanceDays ? parseInt(form.advanceDays) : 0,
      location:      form.location || null,
    };

    let dbError;

    if (serviceId) {
      ({ error: dbError } = await supabase
        .from("services")
        .update(payload)
        .eq("id", serviceId));
    } else {
      ({ error: dbError } = await supabase
        .from("services")
        .insert(payload));
    }

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    await supabase
      .from("providers")
      .update({ onboarding_step: 3 })
      .eq("id", providerId);

    setLoading(false);
    router.push("/proveedor/onboarding/pagos");
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
      <WizardProgress current={3} />

      {/* Header */}
      <div className="mb-7">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 text-[12px] font-semibold"
          style={{ background: "rgba(243,158,16,0.10)", color: "#f39e10" }}
        >
          Cuenta de proveedor · Paso 3 de 5
        </div>
        <h1 className="text-gray-900 text-[26px] font-black tracking-[-0.5px] mb-1.5">
          Tu primer servicio
        </h1>
        <p className="text-gray-500 text-[14px]">
          Este servicio aparecerá en el catálogo cuando tu perfil sea aprobado.
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Service name */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
            Nombre del servicio <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <FileText
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={form.title}
              onChange={set("title")}
              placeholder="Ej. Salón de eventos para 200 personas"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] outline-none transition-colors"
              style={{ fontFamily: "inherit" }}
              onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
              onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
            Descripción del servicio
          </label>
          <textarea
            value={form.description}
            onChange={set("description")}
            placeholder="Describe qué incluye el servicio, qué lo diferencia, equipamiento, etc. (Máx. 500 caracteres)"
            maxLength={500}
            rows={3}
            className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[14px] outline-none resize-none transition-colors"
            style={{ fontFamily: "inherit" }}
            onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
            onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
          />
          <p className="text-gray-400 text-[11px] mt-1 text-right">
            {form.description.length}/500
          </p>
        </div>

        {/* Pricing type */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-2">
            Tipo de precio <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {(["fixed", "quote"] as const).map((type) => {
              const selected = form.pricingType === type;
              const labels   = { fixed: "Precio fijo", quote: "Cotizar" };
              const descs    = {
                fixed: "El cliente ve un precio definido",
                quote: "El cliente solicita una cotización",
              };
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, pricingType: type }))}
                  className="flex flex-col px-4 py-3.5 rounded-xl border-2 text-left transition-all cursor-pointer"
                  style={{
                    borderColor: selected ? "#f39e10" : "#e5e7eb",
                    background:  selected ? "rgba(243,158,16,0.06)" : "#fff",
                  }}
                >
                  <span
                    className="text-[13px] font-semibold"
                    style={{ color: selected ? "#92400e" : "#374151" }}
                  >
                    {labels[type]}
                  </span>
                  <span className="text-[11px] text-gray-400 mt-0.5">{descs[type]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Base price (only for fixed) */}
        {form.pricingType === "fixed" && (
          <div>
            <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
              Precio base (S/) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <DollarSign
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="number"
                value={form.basePrice}
                onChange={set("basePrice")}
                placeholder="Ej. 5000"
                min="0"
                step="1"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] outline-none transition-colors"
                style={{ fontFamily: "inherit" }}
                onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
                onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>
          </div>
        )}

        {/* Capacity */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
            <span className="flex items-center gap-1.5">
              <Users size={13} className="text-gray-400" />
              Capacidad (personas)
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[12px] pointer-events-none">
                Mín.
              </span>
              <input
                type="number"
                value={form.capacityMin}
                onChange={set("capacityMin")}
                placeholder="50"
                min="1"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] outline-none transition-colors"
                style={{ fontFamily: "inherit" }}
                onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
                onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[12px] pointer-events-none">
                Máx.
              </span>
              <input
                type="number"
                value={form.capacityMax}
                onChange={set("capacityMax")}
                placeholder="300"
                min="1"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] outline-none transition-colors"
                style={{ fontFamily: "inherit" }}
                onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
                onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>
          </div>
        </div>

        {/* Event types */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-2">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={13} className="text-gray-400" />
              Tipos de evento que atiendes <span className="text-red-400">*</span>
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((type) => {
              const selected = form.eventTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleEventType(type)}
                  className="px-3.5 py-2 rounded-xl border-2 text-[13px] transition-all cursor-pointer"
                  style={{
                    borderColor: selected ? "#f39e10" : "#e5e7eb",
                    background:  selected ? "rgba(243,158,16,0.08)" : "#fff",
                    color:       selected ? "#92400e" : "#6b7280",
                    fontWeight:  selected ? 600 : 400,
                  }}
                >
                  {selected && (
                    <span className="mr-1 text-[#f39e10]">✓</span>
                  )}
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Advance days */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={13} className="text-gray-400" />
              Días de anticipación requeridos
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={form.advanceDays}
              onChange={set("advanceDays")}
              placeholder="Ej. 30"
              min="0"
              className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[14px] outline-none transition-colors"
              style={{ fontFamily: "inherit" }}
              onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
              onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[12px] pointer-events-none">
              días
            </span>
          </div>
          <p className="text-gray-400 text-[11px] mt-1">
            Con cuántos días de anticipación debe reservarse el servicio.
          </p>
        </div>

        {/* Location */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-gray-400" />
              Ubicación / Zona de cobertura
            </span>
          </label>
          <input
            type="text"
            value={form.location}
            onChange={set("location")}
            placeholder="Ej. Miraflores, Lima — o 'Todo Lima'"
            className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[14px] outline-none transition-colors"
            style={{ fontFamily: "inherit" }}
            onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
            onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-3.5 text-white text-[15px] font-bold mt-1 cursor-pointer border-none"
          style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
            boxShadow: "0 4px 20px rgba(243,158,16,0.4)",
            opacity: loading ? 0.75 : 1,
            transition: "opacity 200ms",
          }}
        >
          {loading ? "Guardando..." : "Guardar y continuar →"}
        </button>
      </form>
    </div>
  );
}
