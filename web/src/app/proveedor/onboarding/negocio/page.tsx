"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Camera, Music2, Sparkles, MapPin, Phone, ChevronLeft, Check } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { PERUVIAN_CITIES } from "@/lib/data";

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

// ── Categories ──────────────────────────────────────────────

const CATEGORIES = [
  { id: 1, label: "Locales y salones",  icon: Building2 },
  { id: 2, label: "Fotografía y video", icon: Camera    },
  { id: 3, label: "Música",             icon: Music2    },
  { id: 4, label: "Decoración",         icon: Sparkles  },
];

// ── Page ────────────────────────────────────────────────────

export default function NegocioPage() {
  const router = useRouter();

  const [loading,    setLoading]    = useState(false);
  const [prefilling, setPrefilling] = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [userId,     setUserId]     = useState<string | null>(null);

  const [form, setForm] = useState({
    businessName: "",
    description:  "",
    categoryId:   0,
    city:         "",
    phone:        "",
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  // Pre-fill from existing providers row (if returning to this step)
  useEffect(() => {
    const prefill = async () => {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/auth");
        return;
      }

      setUserId(session.user.id);

      const { data: provider } = await supabase
        .from("providers")
        .select("business_name, description, category_id, city, phone, onboarding_step")
        .eq("user_id", session.user.id)
        .single();

      if (provider) {
        // If already past step 2, redirect to dashboard
        if (provider.onboarding_step >= 2) {
          router.replace("/proveedor");
          return;
        }
        setForm({
          businessName: provider.business_name ?? "",
          description:  provider.description   ?? "",
          categoryId:   provider.category_id   ?? 0,
          city:         provider.city           ?? "",
          phone:        (provider.phone ?? "").replace(/^\+51\s?/, ""),
        });
      }

      setPrefilling(false);
    };
    prefill();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) {
      setError("Selecciona una categoría.");
      return;
    }
    setError(null);
    setLoading(true);

    const { error: dbError } = await getSupabase()
      .from("providers")
      .update({
        business_name:  form.businessName,
        description:    form.description || null,
        category_id:    form.categoryId,
        city:           form.city,
        phone:          form.phone ? `+51${form.phone}` : null,
        onboarding_step: 2,
      })
      .eq("user_id", userId);

    setLoading(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    router.push("/proveedor/onboarding/servicio");
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
      <WizardProgress current={2} />

      {/* Header */}
      <div className="mb-7">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 text-[12px] font-semibold"
          style={{ background: "rgba(243,158,16,0.10)", color: "#f39e10" }}
        >
          Cuenta de proveedor · Paso 2 de 5
        </div>
        <h1 className="text-gray-900 text-[26px] font-black tracking-[-0.5px] mb-1.5">
          Perfil de tu negocio
        </h1>
        <p className="text-gray-500 text-[14px]">
          Esta información aparecerá en tu página pública del catálogo.
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Business name */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
            Nombre del negocio <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Building2
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={form.businessName}
              onChange={set("businessName")}
              placeholder="Ej. Eventos Supremos SAC"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] outline-none transition-colors"
              style={{ fontFamily: "inherit" }}
              onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
              onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-2">
            Categoría principal <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {CATEGORIES.map(({ id, label, icon: Icon }) => {
              const selected = form.categoryId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, categoryId: id }))}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all cursor-pointer bg-white"
                  style={{
                    borderColor: selected ? "#f39e10" : "#e5e7eb",
                    background:  selected ? "rgba(243,158,16,0.06)" : "#fff",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: selected ? "rgba(243,158,16,0.12)" : "#f9fafb",
                    }}
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.8}
                      style={{ color: selected ? "#f39e10" : "#9ca3af" }}
                    />
                  </div>
                  <span
                    className="text-[13px] leading-tight"
                    style={{
                      color:      selected ? "#92400e" : "#4b5563",
                      fontWeight: selected ? 600 : 400,
                    }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
            Descripción del negocio
          </label>
          <textarea
            value={form.description}
            onChange={set("description")}
            placeholder="Cuéntales a tus clientes qué ofreces, tu experiencia y qué te hace especial. (Máx. 300 caracteres)"
            maxLength={300}
            rows={3}
            className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[14px] outline-none resize-none transition-colors"
            style={{ fontFamily: "inherit" }}
            onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
            onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
          />
          <p className="text-gray-400 text-[11px] mt-1 text-right">
            {form.description.length}/300
          </p>
        </div>

        {/* City */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-gray-400" />
              Ciudad principal de operación <span className="text-red-400">*</span>
            </span>
          </label>
          <select
            value={form.city}
            onChange={set("city")}
            required
            className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[14px] outline-none bg-white cursor-pointer transition-colors"
            style={{ fontFamily: "inherit", color: form.city ? "#111827" : "#9ca3af" }}
            onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
            onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
          >
            <option value="">Selecciona tu ciudad</option>
            {PERUVIAN_CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">
            Teléfono de contacto
          </label>
          <div className="flex rounded-xl border border-gray-200 overflow-hidden transition-colors focus-within:border-[#f39e10]">
            <div className="flex items-center gap-1.5 px-3.5 bg-gray-50 border-r border-gray-200 shrink-0">
              <Phone size={13} className="text-gray-400" />
              <span className="text-[14px] text-gray-600 font-medium">+51</span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={9}
              value={form.phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                setForm((f) => ({ ...f, phone: digits }));
              }}
              placeholder="999 999 999"
              className="flex-1 px-3.5 py-3 text-[14px] outline-none bg-white"
              style={{ fontFamily: "inherit" }}
            />
          </div>
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
