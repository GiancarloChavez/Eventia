"use client";

import { useState } from "react";
import { Grid, FileText, Calendar, DollarSign, User, MapPin, Check, X } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import type { ServiceStatus } from "@/lib/data";

const REQUESTS = [
  { id: "SOL-021", client: "Fernanda López",  event: "Quinceaños", date: "12 Jul 2025", guests: 180, city: "Lima",        status: "Pendiente"  as ServiceStatus, budget: 32000, received: "Hace 2h" },
  { id: "SOL-022", client: "Roberto Sánchez", event: "Boda",       date: "5 Sep 2025",  guests: 250, city: "Arequipa",    status: "Pendiente"  as ServiceStatus, budget: 45000, received: "Hace 5h" },
  { id: "SOL-023", client: "Karla Méndez",    event: "Graduación", date: "20 Jun 2025", guests: 120, city: "Trujillo",    status: "Pendiente"  as ServiceStatus, budget: 18000, received: "Ayer" },
  { id: "SOL-024", client: "Diego Fuentes",   event: "Aniversario",date: "3 Ago 2025",  guests: 80,  city: "Lima",        status: "Confirmado" as ServiceStatus, budget: 28000, received: "Hace 2 días" },
  { id: "SOL-025", client: "Ana Torres",      event: "Quinceaños", date: "14 Jun 2025", guests: 200, city: "Cusco",       status: "Cancelado"  as ServiceStatus, budget: 35000, received: "Hace 4 días" },
];

const MONTHLY_DATA = [
  { m: "Ene", v: 20000 },
  { m: "Feb", v: 24000 },
  { m: "Mar", v: 30000 },
  { m: "Abr", v: 32000 },
  { m: "May", v: 38000 },
];

const MAX_V = Math.max(...MONTHLY_DATA.map((d) => d.v));

const SIDEBAR_ITEMS = [
  { id: "servicios",   label: "Mis servicios",  Icon: Grid },
  { id: "solicitudes", label: "Solicitudes",     Icon: FileText,    badge: 3 },
  { id: "contratos",   label: "Contratos",       Icon: Calendar },
  { id: "ingresos",    label: "Ingresos",        Icon: DollarSign },
  { id: "perfil",      label: "Perfil",          Icon: User },
];

const TITLES: Record<string, string> = {
  servicios: "Mis servicios",
  solicitudes: "Panel de solicitudes",
  contratos: "Contratos",
  ingresos: "Mis ingresos",
  perfil: "Mi perfil",
};

export default function ProviderDashboard() {
  const [active, setActive] = useState("solicitudes");

  return (
    <div className="bg-[#f4f5f7] min-h-screen p-6 flex gap-6">
      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 bg-white border border-gray-200 rounded-2xl p-4 self-start sticky top-20">
        <div className="flex flex-col items-center py-3 pb-5 border-b border-gray-100 mb-3">
          <div className="w-14 h-14 rounded-full bg-[rgba(243,158,16,0.08)] border-2 border-[rgba(243,158,16,0.22)] flex items-center justify-center mb-2.5">
            <span className="text-[#f39e10] font-black text-[22px]">E</span>
          </div>
          <div className="text-gray-900 font-bold text-[14px]">Eventos Supremos</div>
          <div className="text-gray-500 text-[12px] mt-0.5 text-center">Proveedor verificado</div>
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
                {badge !== undefined && (
                  <span className="bg-[#f39e10] text-white rounded-full px-1.5 text-[11px] font-bold">{badge}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-gray-900 text-[24px] font-black mb-1">{TITLES[active]}</h1>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-[14px]">Eventos Supremos SAC</span>
            <VerifiedBadge small />
          </div>
        </div>

        {active === "solicitudes" && (
          <div>
            {/* Stats */}
            <div className="flex gap-3.5 mb-6">
              {[
                { label: "Ingresos del mes", value: "S/ 38,000", sub: "PEN · Mayo 2025" },
                { label: "Reservas activas", value: "8",         sub: "Próximas 60 días", color: "#f39e10" },
                { label: "Calificación",     value: "4.8 ★",     sub: "127 reseñas",      color: "#b45309" },
                { label: "Aceptación",       value: "87%",        sub: "Promedio mensual", color: "#1d4ed8" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5 flex-1">
                  <div className="text-gray-500 text-[12px] uppercase tracking-[0.6px] font-semibold mb-2.5">{stat.label}</div>
                  <div className="text-[28px] font-black leading-none" style={{ color: stat.color ?? "#f39e10" }}>{stat.value}</div>
                  {stat.sub && <div className="text-gray-500 text-[12px] mt-1.5">{stat.sub}</div>}
                </div>
              ))}
            </div>

            {/* Requests table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-gray-900 text-[16px] font-bold">Solicitudes entrantes</h3>
                <span className="bg-green-50 border border-green-200 text-green-700 rounded-full px-3 py-1 text-[12px] font-semibold">
                  3 pendientes
                </span>
              </div>
              {REQUESTS.map((r, i) => (
                <div
                  key={r.id}
                  className="grid gap-3.5 px-6 py-4 hover:bg-gray-50 transition-colors items-center"
                  style={{
                    gridTemplateColumns: "44px 1fr auto auto",
                    borderBottom: i < REQUESTS.length - 1 ? "1px solid #f3f4f6" : "none",
                  }}
                >
                  <div className="w-11 h-11 rounded-xl bg-[rgba(243,158,16,0.08)] flex items-center justify-center">
                    <span className="text-[#f39e10] font-black text-[18px]">{r.client[0]}</span>
                  </div>
                  <div>
                    <div className="flex gap-2 items-center mb-0.5 flex-wrap">
                      <span className="text-gray-900 font-bold text-[14px]">{r.client}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-gray-500 text-[13px]">{r.event}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="flex gap-3.5 text-gray-500 text-[12px] flex-wrap">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {r.date}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {r.city}</span>
                      <span>{r.guests} personas</span>
                      <span className="text-gray-300">Recibida: {r.received}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[#f39e10] font-black text-[16px]">S/ {r.budget.toLocaleString("es-PE")}</div>
                    <div className="text-gray-500 text-[11px]">presupuesto</div>
                  </div>
                  {r.status === "Pendiente" ? (
                    <div className="flex gap-1.5 shrink-0">
                      <button className="bg-[#f39e10] border-none text-white rounded-lg px-3 py-1.5 text-[13px] font-bold cursor-pointer hover:bg-[#d4870e] transition-colors flex items-center gap-1">
                        <Check size={14} /> Aceptar
                      </button>
                      <button className="bg-none border border-red-200 text-red-700 rounded-lg px-2.5 py-1.5 text-[13px] cursor-pointer hover:bg-red-50 transition-colors">
                        <X size={14} />
                      </button>
                      <button className="bg-none border border-gray-200 text-gray-500 rounded-lg px-2.5 py-1.5 text-[13px] cursor-pointer hover:bg-gray-50 transition-colors">
                        Cotizar
                      </button>
                    </div>
                  ) : (
                    <button className="bg-none border border-gray-200 text-gray-500 rounded-lg px-3 py-1.5 text-[13px] cursor-pointer hover:bg-gray-50 transition-colors shrink-0">
                      Ver detalle
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {active === "ingresos" && (
          <div>
            <div className="flex gap-3.5 mb-6">
              {[
                { label: "Ingresos Mayo",  value: "S/ 38,000",  sub: "+19% vs Abril" },
                { label: "Ingresos Abril", value: "S/ 32,000",  sub: "+7% vs Marzo", color: "#d4870e" },
                { label: "Total 2025",     value: "S/ 144,000", sub: "Enero – Mayo",  color: "#1d4ed8" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5 flex-1">
                  <div className="text-gray-500 text-[12px] uppercase tracking-[0.6px] font-semibold mb-2.5">{stat.label}</div>
                  <div className="text-[28px] font-black leading-none" style={{ color: stat.color ?? "#f39e10" }}>{stat.value}</div>
                  {stat.sub && <div className="text-gray-500 text-[12px] mt-1.5">{stat.sub}</div>}
                </div>
              ))}
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-gray-900 text-[16px] font-bold mb-5">Ingresos por mes</h3>
              <div className="flex gap-3.5 items-end h-[180px]">
                {MONTHLY_DATA.map((d) => (
                  <div key={d.m} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-gray-500 text-[11px]">S/{Math.round(d.v / 1000)}K</span>
                    <div
                      className="w-full rounded-t-lg transition-all"
                      style={{
                        height: `${(d.v / MAX_V) * 140}px`,
                        background: d.m === "May" ? "#f39e10" : "rgba(243,158,16,0.14)",
                      }}
                    />
                    <span
                      className="text-[12px]"
                      style={{ color: d.m === "May" ? "#f39e10" : "#6b7280", fontWeight: d.m === "May" ? 700 : 400 }}
                    >
                      {d.m}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(active === "servicios" || active === "contratos" || active === "perfil") && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Grid size={28} className="text-gray-400" />
            </div>
            <h3 className="text-gray-500 text-[16px]">Sección en construcción</h3>
            <p className="text-gray-400 text-[13px] mt-1">Disponible próximamente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
