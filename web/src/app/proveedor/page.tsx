"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Grid, FileText, Calendar, DollarSign, User,
  MapPin, Clock, Package, X, Plus, ImageIcon, Save, Pencil, Camera, CreditCard, AlertTriangle,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { AddServiceDialog } from "@/components/provider/AddServiceDialog";

// ── Types ────────────────────────────────────────────────────

interface ServiceImage { id: string; url: string; display_order: number; }

interface ServiceData {
  id:           string;
  title:        string;
  description:  string | null;
  pricing_type: string;
  base_price:   number | null;
  status:       string;
  location:     string | null;
  event_types:  string[];
  created_at:   string;
  images:       ServiceImage[];
}

interface ProviderData {
  id:                       string;
  business_name:            string;
  description:              string | null;
  category_id:              number | null;
  phone:                    string | null;
  city:                     string | null;
  status:                   string;
  onboarding_step:          number;
  logo_url:                 string | null;
  stripe_payment_method_id: string | null;
  stripe_card_last4:        string | null;
  stripe_card_brand:        string | null;
}

interface ProfileData { full_name: string; email: string; }

interface BookingRequest {
  id: string;
  event_date: string;
  status: string;
  quoted_price: number | null;
  created_at: string;
  notes: string | null;
  services: { title: string } | null;
  profiles: { full_name: string | null; phone: string | null } | null;
}

// ── Constants ────────────────────────────────────────────────

const CATEGORY_LABELS: Record<number, string> = {
  1: "Locales y salones",
  2: "Fotografía y video",
  3: "Música",
  4: "Decoración",
};

const SIDEBAR_ITEMS = [
  { id: "servicios",   label: "Mis servicios", Icon: Grid        },
  { id: "solicitudes", label: "Solicitudes",   Icon: FileText    },
  { id: "contratos",   label: "Contratos",     Icon: Calendar    },
  { id: "ingresos",    label: "Ingresos",      Icon: DollarSign  },
  { id: "perfil",      label: "Perfil",        Icon: User        },
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
  const [active,   setActive]   = useState("servicios");
  const [ready,    setReady]    = useState(false);
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [profile,  setProfile]  = useState<ProfileData | null>(null);
  const [services,  setServices]  = useState<ServiceData[]>([]);
  const [requests,  setRequests]  = useState<BookingRequest[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ── Edit state ────────────────────────────────────────────
  const [editing,         setEditing]         = useState<ServiceData | null>(null);
  const [editTitle,       setEditTitle]       = useState("");
  const [editDesc,        setEditDesc]        = useState("");
  const [editPricingType, setEditPricingType] = useState<"fixed"|"quote">("fixed");
  const [editPrice,       setEditPrice]       = useState("");
  const [editLocation,    setEditLocation]    = useState("");
  const [editImages,      setEditImages]      = useState<ServiceImage[]>([]);
  const [removedIds,      setRemovedIds]      = useState<string[]>([]);
  const [newPhotos,       setNewPhotos]       = useState<File[]>([]);
  const [newPreviews,     setNewPreviews]     = useState<string[]>([]);
  const [saving,          setSaving]          = useState(false);
  const [saveError,       setSaveError]       = useState<string | null>(null);
  const [logoUploading,     setLogoUploading]     = useState(false);
  const [addingService,     setAddingService]     = useState(false);
  const [editingBizName,    setEditingBizName]    = useState(false);
  const [bizNameInput,      setBizNameInput]      = useState("");
  const [bizNameSaving,     setBizNameSaving]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // ── Load data ─────────────────────────────────────────────

  const loadRequests = async () => {
    const res = await fetch("/api/provider/bookings");
    if (!res.ok) return;
    const { bookings } = await res.json();
    setRequests((bookings as BookingRequest[]) ?? []);
  };

  const loadServices = async (providerId: string) => {
    const supabase = getSupabase();
    const { data: svcs } = await supabase
      .from("services")
      .select("id,title,description,pricing_type,base_price,status,location,event_types,created_at")
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false });

    if (!svcs) { setServices([]); return; }

    const withImages = await Promise.all(
      svcs.map(async (svc) => {
        const { data: imgs } = await supabase
          .from("service_images")
          .select("id,url,display_order")
          .eq("service_id", svc.id)
          .order("display_order");
        return { ...svc, images: imgs ?? [] };
      })
    );
    setServices(withImages);
  };

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/auth"); return; }

      const [{ data: prov }, { data: prof }] = await Promise.all([
        supabase.from("providers").select("id,business_name,description,category_id,phone,city,status,onboarding_step,logo_url,stripe_payment_method_id,stripe_card_last4,stripe_card_brand").eq("user_id", session.user.id).single(),
        supabase.from("profiles").select("full_name,email").eq("id", session.user.id).single(),
      ]);

      if (!prov) { router.replace("/auth/registro?tipo=proveedor"); return; }

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

      setProvider(prov);
      setProfile(prof);
      await Promise.all([loadServices(prov.id), loadRequests()]);
      setReady(true);
    };
    load();
  }, [router]);

  // ── Edit handlers ─────────────────────────────────────────

  const openEdit = (svc: ServiceData) => {
    setEditing(svc);
    setEditTitle(svc.title);
    setEditDesc(svc.description ?? "");
    setEditPricingType(svc.pricing_type as "fixed"|"quote");
    setEditPrice(svc.base_price != null ? String(svc.base_price) : "");
    setEditLocation(svc.location ?? "");
    setEditImages([...svc.images]);
    setRemovedIds([]);
    setNewPhotos([]);
    setNewPreviews([]);
    setSaveError(null);
  };

  const closeEdit = () => {
    newPreviews.forEach((url) => URL.revokeObjectURL(url));
    setEditing(null);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setNewPhotos((p) => [...p, ...files]);
    setNewPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeExisting = (id: string) => {
    setEditImages((p) => p.filter((img) => img.id !== id));
    setRemovedIds((p) => [...p, id]);
  };

  const removeNew = (i: number) => {
    URL.revokeObjectURL(newPreviews[i]);
    setNewPhotos((p) => p.filter((_, j) => j !== i));
    setNewPreviews((p) => p.filter((_, j) => j !== i));
  };

  const handleSave = async () => {
    if (!editing || !provider) return;
    setSaveError(null);
    setSaving(true);

    const supabase = getSupabase();

    const { error: updateErr } = await supabase
      .from("services")
      .update({
        title:        editTitle,
        description:  editDesc || null,
        pricing_type: editPricingType,
        base_price:   editPricingType === "fixed" && editPrice ? parseFloat(editPrice) : null,
        location:     editLocation || null,
      })
      .eq("id", editing.id);

    if (updateErr) { setSaveError(updateErr.message); setSaving(false); return; }

    // Borrar imágenes eliminadas
    if (removedIds.length > 0) {
      await supabase.from("service_images").delete().in("id", removedIds);
    }

    // Subir fotos nuevas
    if (newPhotos.length > 0) {
      const baseOrder = editImages.length;
      for (let i = 0; i < newPhotos.length; i++) {
        const file = newPhotos[i];
        const ext  = file.name.split(".").pop() ?? "jpg";
        const path = `${provider.id}/${editing.id}/${Date.now()}_${i}.${ext}`;
        const { data: uploaded } = await supabase.storage
          .from("service-images")
          .upload(path, file, { upsert: true });
        if (uploaded) {
          const { data: { publicUrl } } = supabase.storage
            .from("service-images")
            .getPublicUrl(uploaded.path);
          await supabase.from("service_images").insert({
            service_id:    editing.id,
            url:           publicUrl,
            display_order: baseOrder + i,
            is_cover:      baseOrder + i === 0,
          });
        }
      }
    }

    await loadServices(provider.id);
    setSaving(false);
    closeEdit();
  };

  // ── Logo upload ───────────────────────────────────────────

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !provider) return;
    setLogoUploading(true);
    const supabase = getSupabase();
    const ext  = file.name.split(".").pop() ?? "jpg";
    const path = `logos/${provider.id}/logo.${ext}`;
    const { data: uploaded } = await supabase.storage
      .from("service-images")
      .upload(path, file, { upsert: true });
    if (uploaded) {
      const { data: { publicUrl } } = supabase.storage
        .from("service-images")
        .getPublicUrl(uploaded.path);
      await supabase.from("providers").update({ logo_url: publicUrl }).eq("id", provider.id);
      setProvider((p) => p ? { ...p, logo_url: publicUrl } : p);
    }
    e.target.value = "";
    setLogoUploading(false);
  };

  // ── Business name edit ───────────────────────────────────

  const handleSaveBizName = async () => {
    if (!provider || !bizNameInput.trim()) return;
    setBizNameSaving(true);
    const supabase = getSupabase();
    await supabase.from("providers").update({ business_name: bizNameInput.trim() }).eq("id", provider.id);
    setProvider((p) => p ? { ...p, business_name: bizNameInput.trim() } : p);
    setEditingBizName(false);
    setBizNameSaving(false);
  };

  // ── Render ────────────────────────────────────────────────

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
          {/* Clickable logo/avatar */}
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="relative w-14 h-14 rounded-full mb-2.5 group cursor-pointer border-none p-0 bg-transparent"
            title="Cambiar logo del negocio"
          >
            {provider?.logo_url ? (
              <img
                src={provider.logo_url}
                alt="Logo"
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-[20px]"
                style={{ background: "linear-gradient(135deg, #f59e0b, #e88e00)" }}
              >
                {logoUploading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : initials
                }
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {logoUploading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Camera size={16} color="#fff" />
              }
            </div>
          </button>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={handleLogoUpload}
          />
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
                  background:  isActive ? "rgba(243,158,16,0.08)" : "none",
                  borderColor: isActive ? "rgba(243,158,16,0.22)" : "transparent",
                  color:       isActive ? "#f39e10" : "#6b7280",
                  fontWeight:  isActive ? 600 : 400,
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

        {/* Banner: sin tarjeta configurada */}
        {!provider?.stripe_payment_method_id && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5 mb-5">
            <AlertTriangle size={17} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-amber-800 text-[13px] font-semibold leading-snug">
                Configura tu tarjeta para recibir reservas
              </p>
              <p className="text-amber-700 text-[12px] mt-0.5 leading-relaxed">
                Tus servicios no podrán ser reservados hasta que agregues un método de pago. Solo se usará cuando el cliente confirme una reserva.
              </p>
            </div>
            <a
              href="/proveedor/onboarding/pagos"
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-bold text-white border-none cursor-pointer whitespace-nowrap"
              style={{ background: "#f39e10" }}
            >
              <CreditCard size={13} />
              Agregar tarjeta
            </a>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-gray-900 text-[24px] font-black mb-0.5">{TITLES[active]}</h1>
          <p className="text-gray-400 text-[13px]">{provider?.business_name}</p>
        </div>

        {/* Mis servicios */}
        {active === "servicios" && (
          <div className="flex flex-col gap-3">
            {/* Add service button */}
            <div className="flex justify-end">
              <button
                onClick={() => setAddingService(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-none text-white text-[13px] font-bold cursor-pointer transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
                  boxShadow: "0 2px 12px rgba(243,158,16,0.35)",
                }}
              >
                <Plus size={15} />
                Añadir servicio
              </button>
            </div>

            {services.length === 0
              ? <EmptyState icon={Package} title="Sin servicios aún" subtitle="Agrega tu primer servicio para aparecer en el catálogo." />
              : services.map((svc) => (
                  <div key={svc.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {/* Cover photo */}
                    {svc.images.length > 0 && (
                      <div className="h-[180px] w-full overflow-hidden">
                        <img
                          src={svc.images[0].url}
                          alt={svc.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="px-5 py-4 flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-900 font-bold text-[15px] mb-0.5 truncate">{svc.title}</div>
                        <div className="flex items-center gap-3 text-gray-400 text-[12px] flex-wrap">
                          {svc.location && (
                            <span className="flex items-center gap-1"><MapPin size={11} />{svc.location}</span>
                          )}
                          {svc.images.length > 0 && (
                            <span className="flex items-center gap-1">
                              <ImageIcon size={11} />{svc.images.length} foto{svc.images.length !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          {svc.pricing_type === "fixed" && svc.base_price != null
                            ? <div className="text-[#f39e10] font-black text-[16px]">S/ {svc.base_price.toLocaleString("es-PE")}</div>
                            : <div className="text-gray-400 text-[13px] italic">Cotización</div>
                          }
                          <div className="text-[11px] font-semibold mt-0.5" style={{ color: svc.status === "active" ? "#16a34a" : "#9ca3af" }}>
                            {svc.status === "active" ? "Activo" : "Inactivo"}
                          </div>
                        </div>
                        <button
                          onClick={() => openEdit(svc)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-[13px] font-medium hover:bg-gray-50 transition-colors cursor-pointer bg-white"
                        >
                          <Pencil size={13} />
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            }
          </div>
        )}

        {active === "solicitudes" && (
          requests.length === 0
            ? <EmptyState icon={FileText} title="Sin solicitudes aún" subtitle="Cuando un cliente reserve tu servicio, aparecerá aquí." />
            : (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-gray-900 text-[16px] font-bold">Solicitudes de reserva</h3>
                  <p className="text-gray-400 text-[13px] mt-0.5">{requests.length} solicitud{requests.length !== 1 ? "es" : ""}</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {requests.map((req) => {
                    const clientName = req.profiles?.full_name ?? "Cliente";
                    const date = new Date(req.event_date + "T00:00:00").toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });
                    const isPending = req.status === "pending";
                    return (
                      <div key={req.id} className="px-6 py-4 flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.2)] flex items-center justify-center shrink-0">
                          <span className="text-[#3b82f6] font-black text-[14px]">{clientName[0]?.toUpperCase()}</span>
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 text-[14px] font-bold truncate">{clientName}</p>
                          <p className="text-gray-500 text-[12px]">
                            {req.services?.title ?? "Servicio"} · {date}
                          </p>
                          {req.quoted_price != null && (
                            <p className="text-[#f39e10] text-[12px] font-semibold mt-0.5">S/ {req.quoted_price.toLocaleString("es-PE")}</p>
                          )}
                          {req.notes && <p className="text-gray-400 text-[11px] mt-0.5 truncate">{req.notes}</p>}
                        </div>
                        {/* Status / actions */}
                        {isPending ? (
                          <div className="flex gap-2 shrink-0">
                            <button
                              disabled={updatingId === req.id}
                              onClick={async () => {
                                setUpdatingId(req.id);
                                await fetch("/api/provider/bookings", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ id: req.id, status: "confirmed" }),
                                });
                                await loadRequests();
                                setUpdatingId(null);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.25)] text-green-700 text-[12px] font-bold cursor-pointer hover:bg-[rgba(34,197,94,0.15)] transition-colors"
                            >
                              Aceptar
                            </button>
                            <button
                              disabled={updatingId === req.id}
                              onClick={async () => {
                                setUpdatingId(req.id);
                                await fetch("/api/provider/bookings", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ id: req.id, status: "cancelled" }),
                                });
                                await loadRequests();
                                setUpdatingId(null);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.2)] text-red-600 text-[12px] font-bold cursor-pointer hover:bg-[rgba(239,68,68,0.12)] transition-colors"
                            >
                              Rechazar
                            </button>
                          </div>
                        ) : (
                          <span
                            className="px-3 py-1 rounded-full text-[12px] font-bold shrink-0"
                            style={{
                              color:      req.status === "confirmed" ? "#15803d" : "#6b7280",
                              background: req.status === "confirmed" ? "rgba(21,128,61,0.08)" : "rgba(107,114,128,0.08)",
                            }}
                          >
                            {req.status === "confirmed" ? "Aceptada" : "Rechazada"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )
        )}
        {active === "contratos"   && <EmptyState icon={Calendar}   title="Sin contratos aún"           subtitle="Los contratos generados por reservas confirmadas aparecerán aquí." />}
        {active === "ingresos"    && <EmptyState icon={DollarSign} title="Sin ingresos registrados"    subtitle="Tus ganancias se mostrarán aquí una vez que completes tu primer servicio." />}

        {active === "perfil" && (
          <div className="flex flex-col gap-4">
            {/* Logo card */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-gray-900 text-[15px] font-bold">Logo del negocio</h3>
              </div>
              <div className="px-6 py-5 flex items-center gap-5">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                  {provider?.logo_url ? (
                    <img src={provider.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white font-black text-[28px]"
                      style={{ background: "linear-gradient(135deg, #f59e0b, #e88e00)" }}
                    >
                      {initials}
                    </div>
                  )}
                  {logoUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 text-[13px] font-medium mb-1">
                    {provider?.logo_url ? "Logo actual del negocio" : "Sin logo configurado"}
                  </p>
                  <p className="text-gray-400 text-[12px] mb-3">
                    Se muestra en tu panel y en la vista de tus servicios. JPG, PNG o WebP · Máx. 5 MB.
                  </p>
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoUploading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-[13px] font-medium hover:bg-gray-50 transition-colors cursor-pointer bg-white"
                  >
                    <Camera size={13} />
                    {provider?.logo_url ? "Cambiar logo" : "Subir logo"}
                  </button>
                </div>
              </div>
            </div>

            {/* Info card */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-gray-900 text-[15px] font-bold">Información del negocio</h3>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              {/* Nombre del negocio — editable */}
              <div>
                <div className="text-gray-400 text-[11px] uppercase tracking-[0.5px] font-semibold mb-1">Nombre del negocio</div>
                {editingBizName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={bizNameInput}
                      onChange={(e) => setBizNameInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-[14px] outline-none"
                      style={{ fontFamily: "inherit" }}
                      onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
                      onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
                      autoFocus
                    />
                    <button
                      onClick={handleSaveBizName}
                      disabled={bizNameSaving || !bizNameInput.trim()}
                      className="px-3 py-2 rounded-lg text-white text-[12px] font-bold border-none cursor-pointer"
                      style={{ background: "#f39e10", opacity: bizNameSaving ? 0.7 : 1 }}
                    >
                      {bizNameSaving ? "..." : "Guardar"}
                    </button>
                    <button
                      onClick={() => setEditingBizName(false)}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-gray-500 text-[12px] font-medium bg-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-800 text-[14px]">{provider?.business_name}</span>
                    <button
                      onClick={() => { setBizNameInput(provider?.business_name ?? ""); setEditingBizName(true); }}
                      className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-[#f39e10] transition-colors bg-transparent border-none cursor-pointer p-0"
                    >
                      <Pencil size={12} />
                      Editar
                    </button>
                  </div>
                )}
              </div>

              {/* Resto de campos de solo lectura */}
              {[
                { label: "Categoría",           value: categoryLabel },
                { label: "Ciudad",              value: provider?.city },
                { label: "Teléfono",            value: provider?.phone },
                { label: "Descripción",         value: provider?.description },
                { label: "Correo de contacto",  value: profile?.email },
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
          </div>
        )}
      </div>

      {/* ── Add service dialog ───────────────────────────── */}
      {provider && (
        <AddServiceDialog
          open={addingService}
          onClose={() => setAddingService(false)}
          providerId={provider.id}
          categoryId={provider.category_id}
          onSuccess={async () => { await loadServices(provider.id); }}
        />
      )}

      {/* ── Edit slide-over ───────────────────────────────── */}
      {editing && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-[400]"
            onClick={closeEdit}
          />

          {/* Panel */}
          <div
            className="fixed right-0 top-0 bottom-0 w-full max-w-[480px] bg-white z-[401] flex flex-col shadow-2xl"
            style={{ borderLeft: "1px solid #e5e7eb" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-gray-900 text-[17px] font-black">Editar servicio</h2>
              <button onClick={closeEdit} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer border-none bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">

              {saveError && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px]">
                  {saveError}
                </div>
              )}

              {/* Título */}
              <div>
                <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">Nombre del servicio</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[14px] outline-none"
                  style={{ fontFamily: "inherit" }}
                  onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
                  onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">Descripción</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[14px] outline-none resize-none"
                  style={{ fontFamily: "inherit" }}
                  onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
                  onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>

              {/* Precio */}
              <div>
                <label className="text-gray-700 text-[13px] font-semibold block mb-2">Tipo de precio</label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {(["fixed","quote"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditPricingType(t)}
                      className="py-2.5 rounded-xl border-2 text-[13px] font-semibold cursor-pointer transition-all"
                      style={{
                        borderColor: editPricingType === t ? "#f39e10" : "#e5e7eb",
                        background:  editPricingType === t ? "rgba(243,158,16,0.06)" : "#fff",
                        color:       editPricingType === t ? "#92400e" : "#6b7280",
                      }}
                    >
                      {t === "fixed" ? "Precio fijo" : "Cotización"}
                    </button>
                  ))}
                </div>
                {editPricingType === "fixed" && (
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="Precio en S/"
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[14px] outline-none"
                    style={{ fontFamily: "inherit" }}
                    onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
                    onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
                  />
                )}
              </div>

              {/* Ubicación */}
              <div>
                <label className="text-gray-700 text-[13px] font-semibold block mb-1.5">Ubicación / Cobertura</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[14px] outline-none"
                  style={{ fontFamily: "inherit" }}
                  onFocus={(e) => (e.target.style.borderColor = "#f39e10")}
                  onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>

              {/* Fotografías */}
              <div>
                <label className="text-gray-700 text-[13px] font-semibold block mb-2">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon size={13} className="text-gray-400" />
                    Fotografías
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {editImages.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExisting(img.id)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center cursor-pointer border-none"
                      >
                        <X size={12} color="#fff" />
                      </button>
                    </div>
                  ))}
                  {newPreviews.map((url, i) => (
                    <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-[#f39e10]">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNew(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center cursor-pointer border-none"
                      >
                        <X size={12} color="#fff" />
                      </button>
                    </div>
                  ))}
                  {editImages.length + newPhotos.length < 8 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#f39e10] transition-all bg-transparent"
                    >
                      <Plus size={20} className="text-gray-400" />
                      <span className="text-gray-400 text-[11px]">Agregar</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-xl py-3.5 text-white text-[15px] font-bold cursor-pointer border-none flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
                  boxShadow:  "0 4px 20px rgba(243,158,16,0.4)",
                  opacity: saving ? 0.75 : 1,
                }}
              >
                {saving
                  ? <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Guardando...</>
                  : <><Save size={16} />Guardar cambios</>
                }
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
