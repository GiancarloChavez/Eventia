"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, FileText, CreditCard, User } from "lucide-react";
import { formatPrice } from "@/lib/data";
import { getSupabase } from "@/lib/supabase";

interface Profile {
  full_name: string | null;
  email: string;
  phone: string | null;
  role: string;
}

interface Booking {
  id: string;
  event_date: string;
  status: string;
  quoted_price: number | null;
  created_at: string;
  services: {
    title: string;
    base_price: number | null;
    service_categories: { name: string } | null;
    providers: { business_name: string } | null;
    service_images: { url: string }[];
  } | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pendiente",  color: "#b45309", bg: "rgba(180,83,9,0.08)"   },
  confirmed: { label: "Confirmada", color: "#1d4ed8", bg: "rgba(29,78,216,0.08)"  },
  completed: { label: "Completada", color: "#15803d", bg: "rgba(21,128,61,0.08)"  },
  cancelled: { label: "Cancelada",  color: "#6b7280", bg: "rgba(107,114,128,0.08)" },
};

const SIDEBAR_ITEMS = [
  { id: "reservas",  label: "Mis reservas",  Icon: Calendar },
  { id: "contratos", label: "Mis contratos", Icon: FileText },
  { id: "pagos",     label: "Pagos",         Icon: CreditCard },
  { id: "perfil",    label: "Mi perfil",     Icon: User },
];

const TITLES: Record<string, string> = {
  reservas: "Mis reservas",
  contratos: "Contratos",
  pagos: "Pagos",
  perfil: "Mi perfil",
};

export default function ClientDashboard() {
  const router   = useRouter();
  const [active,   setActive]   = useState("reservas");
  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const sb = getSupabase();

    async function load() {
      const { data: { user }, error: userError } = await sb.auth.getUser();

      if (userError || !user) {
        router.replace("/auth/login");
        return;
      }

      const [profResult, bookResult] = await Promise.all([
        sb.from("profiles").select("full_name, phone, role").eq("id", user.id).single(),
        sb.from("bookings")
          .select(`
            id, event_date, status, quoted_price, created_at,
            services (
              title, base_price,
              service_categories ( name ),
              providers ( business_name ),
              service_images ( url )
            )
          `)
          .eq("client_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      setProfile({
        full_name: profResult.data?.full_name ?? null,
        email:     user.email ?? "",
        phone:     profResult.data?.phone ?? null,
        role:      profResult.data?.role ?? "client",
      });

      setBookings((bookResult.data as unknown as Booking[]) ?? []);
      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="bg-[#f4f5f7] min-h-screen flex items-center justify-center pt-[72px]">
        <div className="w-10 h-10 border-2 border-[#f39e10] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = profile?.full_name ?? profile?.email ?? "Usuario";
  const initial     = displayName[0]?.toUpperCase() ?? "U";

  const totalInvested = bookings.reduce((acc, b) => acc + (b.quoted_price ?? 0), 0);
  const activeCount   = bookings.filter((b) => b.status === "confirmed").length;
  const pendingCount  = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="bg-[#f4f5f7] min-h-screen px-6 pb-6 pt-[96px] flex gap-6">
      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 bg-white border border-gray-200 rounded-2xl p-4 self-start sticky top-[88px]">
        <div className="flex flex-col items-center py-3 pb-5 border-b border-gray-100 mb-3">
          <div className="w-14 h-14 rounded-full bg-[rgba(59,130,246,0.08)] border-2 border-[rgba(59,130,246,0.22)] flex items-center justify-center mb-2.5">
            <span className="text-[#3b82f6] font-black text-[22px]">{initial}</span>
          </div>
          <div className="text-gray-900 font-bold text-[14px]">{displayName}</div>
          <div className="text-gray-500 text-[12px] mt-0.5">Organizador</div>
        </div>
        <nav className="flex flex-col gap-0.5">
          {SIDEBAR_ITEMS.map(({ id, label, Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-[14px] text-left transition-all border"
                style={{
                  background:  isActive ? "rgba(59,130,246,0.08)" : "none",
                  borderColor: isActive ? "rgba(59,130,246,0.22)" : "transparent",
                  color:       isActive ? "#3b82f6" : "#6b7280",
                  fontWeight:  isActive ? 600 : 400,
                }}
              >
                <Icon size={16} style={{ color: isActive ? "#3b82f6" : "#9ca3af" }} strokeWidth={1.8} />
                <span className="flex-1">{label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-gray-900 text-[24px] font-black mb-0.5">{TITLES[active]}</h1>
          <p className="text-gray-500 text-[14px]">Bienvenido, {profile?.full_name?.split(" ")[0] ?? "usuario"}</p>
        </div>

        {/* Reservas */}
        {active === "reservas" && (
          <div>
            <div className="flex gap-3.5 mb-6">
              {[
                { label: "Total reservas",  value: bookings.length,       sub: "Historial completo" },
                { label: "Activas",         value: activeCount,           sub: "En proceso",       color: "#3b82f6" },
                { label: "Pendientes",      value: pendingCount,          sub: "Por confirmar",    color: "#b45309" },
                { label: "Total invertido", value: formatPrice(totalInvested), sub: "Soles peruanos" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5 flex-1">
                  <div className="text-gray-500 text-[12px] uppercase tracking-[0.6px] font-semibold mb-2.5">{stat.label}</div>
                  <div className="text-[28px] font-black leading-none" style={{ color: stat.color ?? "#3b82f6" }}>{stat.value}</div>
                  {stat.sub && <div className="text-gray-500 text-[12px] mt-1.5">{stat.sub}</div>}
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-gray-900 text-[16px] font-bold">Historial de reservas</h3>
                <Link href="/catalogo" className="bg-[#3b82f6] text-white rounded-lg px-4 py-2 text-[13px] font-bold hover:bg-[#2563eb] transition-colors">
                  + Nueva reserva
                </Link>
              </div>

              {bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Calendar size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-[15px] font-semibold mb-1">Aún no tienes reservas</p>
                  <p className="text-gray-400 text-[13px] mb-6">Explora el catálogo y reserva tu primer servicio</p>
                  <Link href="/catalogo" className="bg-[#3b82f6] text-white rounded-xl px-5 py-2.5 text-[14px] font-bold hover:bg-[#2563eb] transition-colors">
                    Explorar servicios
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {bookings.map((b) => {
                    const svc    = b.services;
                    const thumb  = svc?.service_images?.[0]?.url ?? null;
                    const status = STATUS_LABELS[b.status] ?? STATUS_LABELS.pending;
                    const price  = b.quoted_price ?? svc?.base_price ?? 0;
                    const date   = new Date(b.event_date + "T00:00:00").toLocaleDateString("es-PE", {
                      day: "numeric", month: "long", year: "numeric",
                    });

                    return (
                      <div key={b.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                          {thumb ? (
                            <img src={thumb} alt={svc?.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Calendar size={20} className="text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 text-[14px] font-bold truncate">{svc?.title ?? "Servicio"}</p>
                          <p className="text-gray-500 text-[12px] mt-0.5">
                            {svc?.service_categories?.name ?? "—"} · {svc?.providers?.business_name ?? "—"}
                          </p>
                          <p className="text-gray-400 text-[12px] mt-0.5">{date}</p>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                          <p className="text-gray-900 text-[14px] font-black">{formatPrice(price)}</p>
                        </div>

                        {/* Status badge */}
                        <div
                          className="px-3 py-1 rounded-full text-[12px] font-bold shrink-0"
                          style={{ color: status.color, background: status.bg }}
                        >
                          {status.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Perfil */}
        {active === "perfil" && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-[520px]">
            <h2 className="text-gray-900 text-[18px] font-black mb-6">Información de la cuenta</h2>
            <div className="flex flex-col gap-5">
              {[
                { label: "Nombre completo", value: profile?.full_name ?? "—" },
                { label: "Correo electrónico", value: profile?.email ?? "—" },
                { label: "Teléfono", value: profile?.phone ?? "—" },
                { label: "Tipo de cuenta", value: "Organizador" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-gray-400 text-[12px] font-semibold uppercase tracking-[0.6px] mb-1">{label}</div>
                  <div className="text-gray-900 text-[15px] font-semibold">{value}</div>
                  <div className="h-px bg-gray-100 mt-4" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contratos y Pagos */}
        {(active === "contratos" || active === "pagos") && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              {active === "contratos"
                ? <FileText size={28} className="text-gray-400" />
                : <CreditCard size={28} className="text-gray-400" />}
            </div>
            <h3 className="text-gray-500 text-[16px]">Sección en construcción</h3>
            <p className="text-gray-400 text-[13px] mt-1">Disponible próximamente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
