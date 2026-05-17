"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, FileText, CreditCard, User, Check } from "lucide-react";
import { ALL_SERVICES, type ServiceStatus, formatPrice } from "@/lib/data";
import { StatusBadge } from "@/components/shared/status-badge";

const RESERVATIONS = [
  { id: "RES-001", service: "Salón Grand Imperial",        provider: "Eventos Supremos SAC",      category: "Local",      eventDate: "15 Jun 2025", status: "Confirmado" as ServiceStatus, price: 8500,  imgId: 1 },
  { id: "RES-002", service: "Luna Fotografía & Video",     provider: "Luna Fotografía",            category: "Fotografía", eventDate: "15 Jun 2025", status: "Pendiente"  as ServiceStatus, price: 3500,  imgId: 3 },
  { id: "RES-003", service: "Orquesta Tropical Los Reyes", provider: "Música y Fiesta Perú",       category: "Música",     eventDate: "15 Jun 2025", status: "Confirmado" as ServiceStatus, price: 6500,  imgId: 5 },
  { id: "RES-004", service: "Magia Floral Decoraciones",   provider: "Encanto Eventos",            category: "Decoración", eventDate: "20 Abr 2025", status: "Completado" as ServiceStatus, price: 2800,  imgId: 6 },
  { id: "RES-005", service: "DJ Éxtasis & Animación",      provider: "Éxtasis Entretenimiento",    category: "Música",     eventDate: "10 Mar 2025", status: "Cancelado"  as ServiceStatus, price: 2200,  imgId: 4 },
];

const SIDEBAR_ITEMS = [
  { id: "reservas",  label: "Mis reservas",  Icon: Calendar,    badge: 3 },
  { id: "contratos", label: "Mis contratos", Icon: FileText },
  { id: "pagos",     label: "Pagos",         Icon: CreditCard },
  { id: "perfil",    label: "Mi perfil",     Icon: User },
];

export default function ClientDashboard() {
  const [active, setActive] = useState("reservas");

  const TITLES: Record<string, string> = {
    reservas: "Mis reservas",
    contratos: "Contratos",
    pagos: "Pagos",
    perfil: "Mi perfil",
  };

  return (
    <div className="bg-[#f4f5f7] min-h-screen px-6 pb-6 pt-[96px] flex gap-6">
      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 bg-white border border-gray-200 rounded-2xl p-4 self-start sticky top-[88px]">
        <div className="flex flex-col items-center py-3 pb-5 border-b border-gray-100 mb-3">
          <div className="w-14 h-14 rounded-full bg-[rgba(243,158,16,0.08)] border-2 border-[rgba(243,158,16,0.22)] flex items-center justify-center mb-2.5">
            <span className="text-[#f39e10] font-black text-[22px]">V</span>
          </div>
          <div className="text-gray-900 font-bold text-[14px]">Valeria Ríos</div>
          <div className="text-gray-500 text-[12px] mt-0.5">Cliente</div>
        </div>
        <nav className="flex flex-col gap-0.5">
          {SIDEBAR_ITEMS.map(({ id, label, Icon, badge }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-[14px] text-left transition-all border"
                style={{
                  background: isActive ? "rgba(243,158,16,0.08)" : "none",
                  borderColor: isActive ? "rgba(243,158,16,0.22)" : "transparent",
                  color: isActive ? "#f39e10" : "#6b7280",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <Icon size={16} style={{ color: isActive ? "#f39e10" : "#9ca3af" }} strokeWidth={1.8} />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="bg-[#f39e10] text-white rounded-full px-1.5 text-[11px] font-bold">{badge}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-gray-900 text-[24px] font-black mb-0.5">{TITLES[active]}</h1>
          <p className="text-gray-500 text-[14px]">Bienvenida, Valeria · Quinceaños — 15 de Junio 2025</p>
        </div>

        {active === "reservas" && (
          <div>
            {/* Stats */}
            <div className="flex gap-3.5 mb-6">
              {[
                { label: "Total reservas",  value: RESERVATIONS.length,                                              sub: "Historial completo" },
                { label: "Activas",         value: RESERVATIONS.filter((r) => r.status === "Confirmado").length,    sub: "En proceso",        color: "#f39e10" },
                { label: "Pendientes",      value: RESERVATIONS.filter((r) => r.status === "Pendiente").length,     sub: "Por confirmar",     color: "#b45309" },
                { label: "Total invertido", value: formatPrice(RESERVATIONS.filter((r) => r.status !== "Cancelado").reduce((a, r) => a + r.price, 0)), sub: "Soles peruanos" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5 flex-1">
                  <div className="text-gray-500 text-[12px] uppercase tracking-[0.6px] font-semibold mb-2.5">{stat.label}</div>
                  <div className="text-[28px] font-black leading-none" style={{ color: stat.color ?? "#f39e10" }}>{stat.value}</div>
                  {stat.sub && <div className="text-gray-500 text-[12px] mt-1.5">{stat.sub}</div>}
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-gray-900 text-[16px] font-bold">Historial de reservas</h3>
                <Link href="/catalogo" className="bg-[#f39e10] text-white rounded-lg px-4 py-2 text-[13px] font-bold hover:bg-[#d4870e] transition-colors">
                  + Nueva reserva
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      {["Servicio", "Proveedor", "Fecha evento", "Estado", "Precio", "Acciones"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-gray-500 text-[11px] font-bold uppercase tracking-[0.8px] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {RESERVATIONS.map((r, i) => {
                      const svc = ALL_SERVICES.find((s) => s.id === r.imgId);
                      return (
                        <tr
                          key={r.id}
                          className="hover:bg-gray-50 transition-colors"
                          style={{ borderBottom: i < RESERVATIONS.length - 1 ? "1px solid #f3f4f6" : "none" }}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              {svc && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={svc.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                              )}
                              <div>
                                <div className="text-gray-900 font-semibold text-[14px]">{r.service}</div>
                                <div className="text-gray-500 text-[12px]">{r.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 text-[13px]">{r.provider}</td>
                          <td className="px-5 py-3.5 text-gray-900 text-[13px] whitespace-nowrap">{r.eventDate}</td>
                          <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                          <td className="px-5 py-3.5 text-[#f39e10] font-bold text-[14px] whitespace-nowrap">{formatPrice(r.price)}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex gap-1.5">
                              <Link href={`/servicios/${r.imgId}`} className="border border-gray-200 text-gray-500 rounded-lg px-2.5 py-1 text-[12px] hover:border-[#f39e10] hover:text-[#f39e10] transition-colors">Ver</Link>
                              {r.status === "Pendiente" && (
                                <button className="border border-red-200 text-red-700 rounded-lg px-2.5 py-1 text-[12px] cursor-pointer bg-none hover:bg-red-50 transition-colors">Cancelar</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {active === "pagos" && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-gray-900 text-[16px] font-bold">Historial de pagos</h3>
            </div>
            {RESERVATIONS.filter((r) => r.status !== "Cancelado").map((r, i, arr) => (
              <div key={i} className="flex justify-between items-center px-6 py-4" style={{ borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <div className="flex gap-3.5 items-center">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(243,158,16,0.08)] flex items-center justify-center">
                    <CreditCard size={18} className="text-[#f39e10]" />
                  </div>
                  <div>
                    <div className="text-gray-900 font-semibold text-[14px]">{r.service}</div>
                    <div className="text-gray-500 text-[12px]">{r.eventDate}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#f39e10] font-black text-[16px]">{formatPrice(r.price)}</div>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        )}

        {(active === "contratos" || active === "perfil") && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              {active === "contratos" ? <FileText size={28} className="text-gray-400" /> : <User size={28} className="text-gray-400" />}
            </div>
            <h3 className="text-gray-500 text-[16px]">Sección en construcción</h3>
            <p className="text-gray-400 text-[13px] mt-1">Disponible próximamente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
