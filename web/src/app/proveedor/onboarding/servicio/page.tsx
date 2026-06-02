"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, DollarSign, Users, CalendarDays, MapPin, ChevronLeft, Check,
  Camera, Music2, Sparkles, Clock, Package,
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

const EVENT_TYPES = ["Boda", "Quinceaños", "Graduación", "Aniversario", "Corporativo", "Otro"];

const SPACE_TYPES = [
  { value: "interior", label: "Interior" },
  { value: "exterior", label: "Exterior" },
  { value: "mixto",    label: "Mixto" },
];

const AMENITIES_OPTIONS = [
  "Cocina equipada",
  "Sistema de audio",
  "Iluminación profesional",
  "Mesas y sillas",
  "Frigobar / Bar",
  "Proyector / Pantalla",
];

const PHOTO_MODALITIES = [
  { value: "solo_fotos",  label: "Solo fotografía" },
  { value: "solo_video",  label: "Solo video" },
  { value: "foto_video",  label: "Foto + Video" },
];

const MUSIC_TYPES = ["DJ", "Orquesta", "Grupo musical", "Mariachi", "Otro"];

const MUSIC_GENRES = ["Cumbia", "Salsa", "Pop / Rock", "Reggaeton", "Baladas", "Variado"];

const DECO_TYPES = [
  "Flores naturales",
  "Globos",
  "Telas y drapeados",
  "Centros de mesa",
  "Arcos y estructuras",
  "Temática completa",
];

// ── Sub-components ───────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-[0.6px] shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function ChipSelector({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className="px-3.5 py-2 rounded-xl border-2 text-[13px] transition-all cursor-pointer"
            style={{
              borderColor: active ? "#f39e10" : "#e5e7eb",
              background:  active ? "rgba(243,158,16,0.08)" : "#fff",
              color:       active ? "#92400e" : "#6b7280",
              fontWeight:  active ? 600 : 400,
            }}
          >
            {active && <span className="mr-1 text-[#f39e10]">✓</span>}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function CardSelector({
  options,
  value,
  onChange,
  cols = 2,
}: {
  options: { value: string; label: string; desc?: string }[];
  value: string;
  onChange: (v: string) => void;
  cols?: 2 | 3;
}) {
  return (
    <div className={`grid gap-2.5 ${cols === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
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
              {opt.label}
            </span>
            {opt.desc && (
              <span className="text-[11px] text-gray-400 mt-0.5">{opt.desc}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function BoolToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-gray-200 bg-white">
      <span className="text-[13px] text-gray-700 font-medium">{label}</span>
      <div className="flex gap-2">
        {[true, false].map((opt) => (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            className="px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer border"
            style={{
              background:  value === opt ? (opt ? "#f39e10" : "#f3f4f6") : "#f9fafb",
              color:       value === opt ? (opt ? "#fff"    : "#6b7280") : "#9ca3af",
              borderColor: value === opt ? (opt ? "#f39e10" : "#d1d5db") : "#e5e7eb",
            }}
          >
            {opt ? "Sí" : "No"}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Category-specific config ─────────────────────────────────

const CATEGORY_CONFIG: Record<number, { titlePlaceholder: string; locationLabel: string; locationPlaceholder: string }> = {
  1: {
    titlePlaceholder:    "Ej. Salón El Paraíso — capacidad 200 personas",
    locationLabel:       "Dirección del local",
    locationPlaceholder: "Ej. Av. La Marina 1234, Iquitos",
  },
  2: {
    titlePlaceholder:    "Ej. Paquete completo foto + video HD",
    locationLabel:       "Zona de cobertura",
    locationPlaceholder: "Ej. Iquitos y alrededores",
  },
  3: {
    titlePlaceholder:    "Ej. DJ Alexei — música variada para eventos",
    locationLabel:       "Zona de cobertura",
    locationPlaceholder: "Ej. Iquitos y alrededores",
  },
  4: {
    titlePlaceholder:    "Ej. Decoración floral temática romántica",
    locationLabel:       "Zona de cobertura",
    locationPlaceholder: "Ej. Iquitos y alrededores",
  },
};

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
    // ── Common ──
    title:       "",
    description: "",
    pricingType: "fixed" as "fixed" | "quote",
    basePrice:   "",
    capacityMin: "",
    capacityMax: "",
    eventTypes:  [] as string[],
    advanceDays: "",
    location:    "",
    // ── Cat 1: Locales ──
    spaceType:  "",
    parking:    false,
    amenities:  [] as string[],
    // ── Cat 2: Fotografía ──
    photoModality: "",
    coverageHours: "",
    deliveryDays:  "",
    albumIncluded: false,
    // ── Cat 3: Música ──
    musicType:        "",
    musicGenres:      [] as string[],
    soundEquipment:   false,
    lightingIncluded: false,
    // ── Cat 4: Decoración ──
    decoTypes:     [] as string[],
    setupIncluded: false,
    customDesign:  false,
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleChip = (k: "eventTypes" | "amenities" | "musicGenres" | "decoTypes") =>
    (val: string) =>
      setForm((f) => ({
        ...f,
        [k]: (f[k] as string[]).includes(val)
          ? (f[k] as string[]).filter((x) => x !== val)
          : [...(f[k] as string[]), val],
      }));

  // ── Pre-fill ─────────────────────────────────────────────

  useEffect(() => {
    const prefill = async () => {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) { router.replace("/auth"); return; }

      const { data: provider } = await supabase
        .from("providers")
        .select("id, category_id, onboarding_step")
        .eq("user_id", session.user.id)
        .single();

      if (!provider) { router.replace("/auth/registro?tipo=proveedor"); return; }
      if (provider.onboarding_step >= 3) { router.replace("/proveedor"); return; }

      setProviderId(provider.id);
      setCategoryId(provider.category_id);

      const { data: service } = await supabase
        .from("services")
        .select(`id, title, description, pricing_type, base_price,
                 capacity_min, capacity_max, event_types, advance_days, location,
                 space_type, parking, amenities,
                 photo_modality, coverage_hours, delivery_days, album_included,
                 music_type, music_genres, sound_equipment, lighting_included,
                 deco_types, setup_included, custom_design`)
        .eq("provider_id", provider.id)
        .limit(1)
        .maybeSingle();

      if (service) {
        setServiceId(service.id);
        setForm({
          title:       service.title       ?? "",
          description: service.description ?? "",
          pricingType: (service.pricing_type as "fixed" | "quote") ?? "fixed",
          basePrice:   service.base_price   != null ? String(service.base_price)   : "",
          capacityMin: service.capacity_min != null ? String(service.capacity_min) : "",
          capacityMax: service.capacity_max != null ? String(service.capacity_max) : "",
          eventTypes:  service.event_types  ?? [],
          advanceDays: service.advance_days != null ? String(service.advance_days) : "",
          location:    service.location     ?? "",
          spaceType:   service.space_type   ?? "",
          parking:     service.parking      ?? false,
          amenities:   service.amenities    ?? [],
          photoModality: service.photo_modality ?? "",
          coverageHours: service.coverage_hours != null ? String(service.coverage_hours) : "",
          deliveryDays:  service.delivery_days  != null ? String(service.delivery_days)  : "",
          albumIncluded: service.album_included ?? false,
          musicType:        service.music_type        ?? "",
          musicGenres:      service.music_genres      ?? [],
          soundEquipment:   service.sound_equipment   ?? false,
          lightingIncluded: service.lighting_included ?? false,
          decoTypes:     service.deco_types    ?? [],
          setupIncluded: service.setup_included ?? false,
          customDesign:  service.custom_design  ?? false,
        });
      }

      setPrefilling(false);
    };
    prefill();
  }, [router]);

  // ── Submit ───────────────────────────────────────────────

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
    if (categoryId === 2 && !form.photoModality) {
      setError("Selecciona la modalidad del servicio fotográfico.");
      return;
    }
    if (categoryId === 3 && !form.musicType) {
      setError("Selecciona el tipo de agrupación musical.");
      return;
    }
    if (categoryId === 4 && form.decoTypes.length === 0) {
      setError("Selecciona al menos un tipo de decoración.");
      return;
    }

    setError(null);
    setLoading(true);

    const supabase = getSupabase();

    const payload = {
      provider_id:  providerId,
      category_id:  categoryId,
      title:        form.title,
      description:  form.description || null,
      pricing_type: form.pricingType,
      base_price:   form.pricingType === "fixed" ? parseFloat(form.basePrice) : null,
      capacity_min: categoryId === 1 && form.capacityMin ? parseInt(form.capacityMin) : null,
      capacity_max: categoryId === 1 && form.capacityMax ? parseInt(form.capacityMax) : null,
      event_types:  form.eventTypes,
      advance_days: form.advanceDays ? parseInt(form.advanceDays) : 0,
      location:     form.location || null,
      // Cat 1
      space_type:  categoryId === 1 ? form.spaceType || null : null,
      parking:     categoryId === 1 ? form.parking : null,
      amenities:   categoryId === 1 ? form.amenities : null,
      // Cat 2
      photo_modality: categoryId === 2 ? form.photoModality || null : null,
      coverage_hours: (categoryId === 2 || categoryId === 3) && form.coverageHours
        ? parseFloat(form.coverageHours) : null,
      delivery_days:  categoryId === 2 && form.deliveryDays ? parseInt(form.deliveryDays) : null,
      album_included: categoryId === 2 ? form.albumIncluded : null,
      // Cat 3
      music_type:       categoryId === 3 ? form.musicType || null : null,
      music_genres:     categoryId === 3 ? form.musicGenres : null,
      sound_equipment:  categoryId === 3 ? form.soundEquipment : null,
      lighting_included: categoryId === 3 ? form.lightingIncluded : null,
      // Cat 4
      deco_types:    categoryId === 4 ? form.decoTypes : null,
      setup_included: categoryId === 4 ? form.setupIncluded : null,
      custom_design:  categoryId === 4 ? form.customDesign : null,
    };

    let dbError;
    if (serviceId) {
      ({ error: dbError } = await supabase.from("services").update(payload).eq("id", serviceId));
    } else {
      ({ error: dbError } = await supabase.from("services").insert(payload));
    }

    if (dbError) { setError(dbError.message); setLoading(false); return; }

    await supabase.from("providers").update({ onboarding_step: 3 }).eq("id", providerId);

    setLoading(false);
    router.push("/proveedor/onboarding/pagos");
  };

  // ── Render ───────────────────────────────────────────────

  if (prefilling) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-7 h-7 rounded-full border-2 border-[#f39e10] border-t-transparent animate-spin" />
      </div>
    );
  }

  const catCfg = categoryId ? CATEGORY_CONFIG[categoryId] : CATEGORY_CONFIG[1];

  const inputCls = "w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[14px] outline-none transition-colors";
  const inputStyle = { fontFamily: "inherit" };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.target.style.borderColor = "#f39e10");
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.target.style.borderColor = "#e5e7eb");

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

        {/* ── Service name ── */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
            Nombre del servicio <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <FileText size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={form.title}
              onChange={set("title")}
              placeholder={catCfg.titlePlaceholder}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] outline-none transition-colors"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        </div>

        {/* ── Description ── */}
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
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          <p className="text-gray-400 text-[11px] mt-1 text-right">{form.description.length}/500</p>
        </div>

        {/* ── Pricing type ── */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-2">
            Tipo de precio <span className="text-red-400">*</span>
          </label>
          <CardSelector
            options={[
              { value: "fixed", label: "Precio fijo",  desc: "El cliente ve un precio definido" },
              { value: "quote", label: "Cotizar",       desc: "El cliente solicita una cotización" },
            ]}
            value={form.pricingType}
            onChange={(v) => setForm((f) => ({ ...f, pricingType: v as "fixed" | "quote" }))}
          />
        </div>

        {/* ── Base price ── */}
        {form.pricingType === "fixed" && (
          <div>
            <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
              Precio base (S/) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="number"
                value={form.basePrice}
                onChange={set("basePrice")}
                placeholder="Ej. 5000"
                min="0"
                step="1"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] outline-none transition-colors"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
          </div>
        )}

        {/* ── Event types ── */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-2">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={13} className="text-gray-400" />
              Tipos de evento que atiendes <span className="text-red-400">*</span>
            </span>
          </label>
          <ChipSelector
            options={EVENT_TYPES}
            selected={form.eventTypes}
            onToggle={toggleChip("eventTypes")}
          />
        </div>

        {/* ── Capacity (Locales only) ── */}
        {categoryId === 1 && (
          <div>
            <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
              <span className="flex items-center gap-1.5">
                <Users size={13} className="text-gray-400" />
                Capacidad (personas)
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[12px] pointer-events-none">Mín.</span>
                <input
                  type="number"
                  value={form.capacityMin}
                  onChange={set("capacityMin")}
                  placeholder="50"
                  min="1"
                  className={inputCls + " pl-10"}
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[12px] pointer-events-none">Máx.</span>
                <input
                  type="number"
                  value={form.capacityMax}
                  onChange={set("capacityMax")}
                  placeholder="300"
                  min="1"
                  className={inputCls + " pl-10"}
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Advance days ── */}
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
              className={inputCls}
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[12px] pointer-events-none">días</span>
          </div>
          <p className="text-gray-400 text-[11px] mt-1">
            Con cuántos días de anticipación debe reservarse el servicio.
          </p>
        </div>

        {/* ── Location ── */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-gray-400" />
              {catCfg.locationLabel}
            </span>
          </label>
          <input
            type="text"
            value={form.location}
            onChange={set("location")}
            placeholder={catCfg.locationPlaceholder}
            className={inputCls}
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        {/* ══════════════════════════════════════════════════
            CATEGORY-SPECIFIC FIELDS
        ══════════════════════════════════════════════════ */}

        {/* ── Cat 1: Locales ── */}
        {categoryId === 1 && (
          <>
            <SectionDivider label="Detalles del local" />

            <div>
              <label className="text-gray-700 text-[13px] font-semibold block mb-2">
                Tipo de espacio <span className="text-red-400">*</span>
              </label>
              <CardSelector
                options={SPACE_TYPES}
                value={form.spaceType}
                onChange={(v) => setForm((f) => ({ ...f, spaceType: v }))}
                cols={3}
              />
            </div>

            <BoolToggle
              label="¿Cuenta con estacionamiento?"
              value={form.parking}
              onChange={(v) => setForm((f) => ({ ...f, parking: v }))}
            />

            <div>
              <label className="text-gray-700 text-[13px] font-semibold block mb-2">
                Amenidades incluidas
              </label>
              <ChipSelector
                options={AMENITIES_OPTIONS}
                selected={form.amenities}
                onToggle={toggleChip("amenities")}
              />
            </div>
          </>
        )}

        {/* ── Cat 2: Fotografía y video ── */}
        {categoryId === 2 && (
          <>
            <SectionDivider label="Detalles fotográficos" />

            <div>
              <label className="text-gray-700 text-[13px] font-semibold block mb-2">
                <span className="flex items-center gap-1.5">
                  <Camera size={13} className="text-gray-400" />
                  Modalidad del servicio <span className="text-red-400">*</span>
                </span>
              </label>
              <CardSelector
                options={PHOTO_MODALITIES}
                value={form.photoModality}
                onChange={(v) => setForm((f) => ({ ...f, photoModality: v }))}
              />
            </div>

            <div>
              <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-gray-400" />
                  Horas de cobertura del evento
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={form.coverageHours}
                  onChange={set("coverageHours")}
                  placeholder="Ej. 6"
                  min="1"
                  step="0.5"
                  className={inputCls}
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[12px] pointer-events-none">hrs</span>
              </div>
            </div>

            <div>
              <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Package size={13} className="text-gray-400" />
                  Plazo de entrega de fotos editadas
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={form.deliveryDays}
                  onChange={set("deliveryDays")}
                  placeholder="Ej. 15"
                  min="1"
                  className={inputCls}
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[12px] pointer-events-none">días</span>
              </div>
            </div>

            <BoolToggle
              label="¿Incluye álbum físico?"
              value={form.albumIncluded}
              onChange={(v) => setForm((f) => ({ ...f, albumIncluded: v }))}
            />
          </>
        )}

        {/* ── Cat 3: Música ── */}
        {categoryId === 3 && (
          <>
            <SectionDivider label="Detalles musicales" />

            <div>
              <label className="text-gray-700 text-[13px] font-semibold block mb-2">
                <span className="flex items-center gap-1.5">
                  <Music2 size={13} className="text-gray-400" />
                  Tipo de agrupación <span className="text-red-400">*</span>
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {MUSIC_TYPES.map((type) => {
                  const active = form.musicType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, musicType: type }))}
                      className="px-3.5 py-2 rounded-xl border-2 text-[13px] transition-all cursor-pointer"
                      style={{
                        borderColor: active ? "#f39e10" : "#e5e7eb",
                        background:  active ? "rgba(243,158,16,0.08)" : "#fff",
                        color:       active ? "#92400e" : "#6b7280",
                        fontWeight:  active ? 600 : 400,
                      }}
                    >
                      {active && <span className="mr-1 text-[#f39e10]">✓</span>}
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-gray-400" />
                  Duración del servicio
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={form.coverageHours}
                  onChange={set("coverageHours")}
                  placeholder="Ej. 4"
                  min="1"
                  step="0.5"
                  className={inputCls}
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[12px] pointer-events-none">hrs</span>
              </div>
            </div>

            <div>
              <label className="text-gray-700 text-[13px] font-semibold block mb-2">
                Géneros musicales
              </label>
              <ChipSelector
                options={MUSIC_GENRES}
                selected={form.musicGenres}
                onToggle={toggleChip("musicGenres")}
              />
            </div>

            <BoolToggle
              label="¿Incluye equipo de sonido?"
              value={form.soundEquipment}
              onChange={(v) => setForm((f) => ({ ...f, soundEquipment: v }))}
            />
            <BoolToggle
              label="¿Incluye iluminación?"
              value={form.lightingIncluded}
              onChange={(v) => setForm((f) => ({ ...f, lightingIncluded: v }))}
            />
          </>
        )}

        {/* ── Cat 4: Decoración ── */}
        {categoryId === 4 && (
          <>
            <SectionDivider label="Detalles de decoración" />

            <div>
              <label className="text-gray-700 text-[13px] font-semibold block mb-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={13} className="text-gray-400" />
                  Tipos de decoración que ofreces <span className="text-red-400">*</span>
                </span>
              </label>
              <ChipSelector
                options={DECO_TYPES}
                selected={form.decoTypes}
                onToggle={toggleChip("decoTypes")}
              />
            </div>

            <BoolToggle
              label="¿Incluye armado y desmontaje?"
              value={form.setupIncluded}
              onChange={(v) => setForm((f) => ({ ...f, setupIncluded: v }))}
            />
            <BoolToggle
              label="¿Ofrece diseño personalizado?"
              value={form.customDesign}
              onChange={(v) => setForm((f) => ({ ...f, customDesign: v }))}
            />
          </>
        )}

        {/* ── Submit ── */}
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
