"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Grid, FileText, Calendar, DollarSign, User,
  MapPin, AlertCircle, Clock, Package, Plus, Phone,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";

// ── Types ────────────────────────────────────────────────────

interface ProviderData {
  id:            string;
  business_name: string;
  description:   string | null;
  category_id:   number | null;
  phone:         string | null;
  city:          string | null;
  status:        string;
  onboarding_step: number;
}

interface ServiceData {
  id:           string;
  title:        string;
  pricing_type: string;
  base_price:   number | null;
  status:       string;
  location:     string | null;
  event_types:  string[];
  created_at:   string;
}

interface ProfileData {
  full_name: string;
  email:     string;
}

// ── Constants ────────────────────────────────────────────────

const CATEGORY_LABELS: Record<number, string> = {
  1: "Locales y salones",
  2: "Fotografía y video",
  3: "Música",
  4: "Decoración",
};

const SIDEBAR_ITEMS = [
  { id: "servicios",   label: "Mis servicios", Icon: Grid     },
  { id: "solicitudes", label: "Solicitudes",   Icon: FileText },
  { id: "contratos",   label: "Contratos",     Icon: Calendar },
  { id: "ingresos",    label: "Ingresos",      Icon: DollarSign },
  { id: "perfil",      label: "Perfil",        Icon: User     },
];

const TITLES: Record<string, string> = {
  servicios:   "Mis servicios",
  solicitudes: "Solicitudes",
  contratos:   "Contratos",
  ingresos:    "Ingresos",
  perfil:      "Mi perfil",
};

// ── Empty state ──────────────────────────────────────────────

function EmptyState({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-14 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Icon size={26} className="text-gray-400" />
      </div>
      <h3 className="text-gray-700 text-[16px] font-bold mb-1">{title}</h3>
      <p className="text-gray-400 text-[13px]">{subtitle}</p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function ProviderDashboard() {
  const router = useRouter();
  const [active,    setActive]    = useState("servicios");
  const [ready,     setReady]     = useState(false);
  const [provider,  setProvider]  = useState<ProviderData | null>(null);
  const [profile,   setProfile]   = useState<ProfileData | null>(null);
  const [services,  setServices]  = useState<ServiceData[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) { router.replace("/auth"); return; }

      const [{ data: prov }, { data: prof }] = await Promise.all([
        supabase.from("providers").select("id,business_name,description,category_id,phone,city,status,onboarding_step").eq("user_id", session.user.id).single(),
        supabase.from("profiles").select("full_name,email").eq("id", session.user.id).single(),
      ]);

      if (!prov) { router.replace("/auth/registro?tipo=proveedor"); return; }

      // Redirect to pending onboarding step
      if (prov.status === "draft" && prov.onboarding_step < 5) {
        const stepRoutes: Record<number, string> = {
          1: "/proveedor/onboarding/negocio",
          2: "/proveedor/onboarding/servicio",
          3: "/proveedor/onboarding/pagos",
          4: "/proveedor/onboarding/revision",
        };
        router.replace(stepRoutes[prov.onboarding_step] ?? "/proveedor/onboarding/negocio");
        return;
      }

      const { data: svcs } = await supabase
        .from("services")
        .select("id,title,pricing_type,base_price,status,location,event_types,created_at")
        .eq("provider_id", prov.id)
        .order("created_at", { ascending: false });

      setProvider(prov);
      setProfile(prof);
      setServices(svcs ?? []);
      setReady(true);
    };
    load();
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7]">
        <div className="w-8 h-8 rounded-full border-2 border-[#f39e10] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (provider?.status === "pending_review") {
    return (
      <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 max-w-[440px] w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
            <Clock size={26} style={{ color: "#f39e10" }} strokeWidth={1.6} />
          </div>
          <h2 className="text-gray-900 text-[20px] font-black mb-2">Solicitud en revisión</h2>
          <p className="text-gray-500 text-[14px] leading-relaxed">
            Recibimos tu solicitud. Nuestro equipo la revisará en un plazo de 48 horas hábiles y te notificaremos por correo.
          </p>
        </div>
      </div>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name.trim().split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : profile?.email?.[0]?.toUpperCase() ?? "?";

  const categoryLabel = provider?.category_id ? CATEGORY_LABELS[provider.category_id] : null;

  return (
    <div className="bg-[#f4f5f7] min-h-screen px-6 pb-6 pt-[96px] flex gap-6">

      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 bg-white border border-gray-200 rounded-2xl p-4 self-start sticky top-[88px]">
        <div className="flex flex-col items-center py-3 pb-5 border-b border-gray-100 mb-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-2.5 text-white font-black text-[20px]"
            style={{ background: "linear-gradient(135deg, #f59e0b, #e88e00)" }}
          >
            {initials}
          </div>
          <div className="text-gray-900 font-bold text-[14px] text-center leading-tight">
            {provider?.business_name}
          </div>
          {categoryLabel && (
            <div className="text-gray-400 text-[12px] mt-0.5 text-center">{categoryLabel}</div>
          )}
        </div>

        <nav className="flex flex-col gap-0.5">
          {SIDEBAR_ITEMS.map(({ id, label, Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-[14px] text-left transition-all border cursor-pointer"
                style={{
                  background:   isActive ? "rgba(243,158,16,0.08)" : "none",
                  borderColor:  isActive ? "rgba(243,158,16,0.22)" : "transparent",
                  color:        isActive ? "#f39e10" : "#6b7280",
                  fontWeight:   isActive ? 600 : 400,
                }}
              >
                <Icon size={16} style={{ color: isActive ? "#f39e10" : "#9ca3af" }} strokeWidth={1.8} />
                {label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-gray-900 text-[24px] font-black mb-0.5">{TITLES[active]}</h1>
          <p className="text-gray-400 text-[13px]">{provider?.business_name}</p>
        </div>

        {/* ── Mis servicios ── */}
        {active === "servicios" && (
          <div>
            {services.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Sin servicios aún"
                subtitle="Agrega tu primer servicio para aparecer en el catálogo."
              />
            ) : (
              <div className="flex flex-col gap-3">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 font-bold text-[15px] mb-0.5 truncate">{svc.title}</div>
                      <div className="flex items-center gap-3 text-gray-400 text-[12px] flex-wrap">
                        {svc.location && (
                          <span className="flex items-center gap-1"><MapPin size={11} />{svc.location}</span>
                        )}
                        {svc.event_types?.length > 0 && (
                          <span>{svc.event_types.join(", ")}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {svc.pricing_type === "fixed" && svc.base_price != null ? (
                        <div className="text-[#f39e10] font-black text-[16px]">
                          S/ {svc.base_price.toLocaleString("es-PE")}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-[13px] italic">Cotización</div>
                      )}
                      <div
                        className="text-[11px] font-semibold mt-0.5"
                        style={{ color: svc.status === "active" ? "#16a34a" : "#9ca3af" }}
                      >
                        {svc.status === "active" ? "Activo" : "Inactivo"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Solicitudes ── */}
        {active === "solicitudes" && (
          <EmptyState
            icon={FileText}
            title="Sin solicitudes aún"
            subtitle="Cuando un cliente reserve tu servicio, aparecerá aquí."
          />
        )}

        {/* ── Contratos ── */}
        {active === "contratos" && (
          <EmptyState
            icon={Calendar}
            title="Sin contratos aún"
            subtitle="Los contratos generados por reservas confirmadas aparecerán aquí."
          />
        )}

        {/* ── Ingresos ── */}
        {active === "ingresos" && (
          <EmptyState
            icon={DollarSign}
            title="Sin ingresos registrados"
            subtitle="Tus ganancias se mostrarán aquí una vez que completes tu primer servicio."
          />
        )}

        {/* ── Perfil ── */}
        {active === "perfil" && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-gray-900 text-[15px] font-bold">Información del negocio</h3>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              {[
                { label: "Nombre del negocio", value: provider?.business_name },
                { label: "Categoría",          value: categoryLabel },
                { label: "Ciudad",             value: provider?.city },
                { label: "Teléfono",           value: provider?.phone },
                { label: "Descripción",        value: provider?.description },
                { label: "Correo de contacto", value: profile?.email },
              ].map(({ label, value }) =>
                value ? (
                  <div key={label}>
                    <div className="text-gray-400 text-[11px] uppercase tracking-[0.5px] font-semibold mb-0.5">{label}</div>
                    <div className="text-gray-800 text-[14px]">{value}</div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
