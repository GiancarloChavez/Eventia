"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SERVICE_SELECT, type DbService } from "@/lib/data";
import { getSupabase } from "@/lib/supabase";
import { ServiceCard } from "@/components/shared/service-card";
import type { HeroSearchParams } from "./hero";

const CATEGORY_META: Record<string, { title: string; sub: string }> = {
  local:      { title: "Locales para eventos",         sub: "Salones, haciendas y espacios únicos" },
  fotografia: { title: "Fotógrafos y videógrafos",     sub: "Captura cada momento especial" },
  musica:     { title: "Música y entretenimiento",     sub: "Orquestas, DJs y bandas en vivo" },
  decoracion: { title: "Decoración y ambientación",    sub: "Propuestas únicas y personalizadas" },
};

const PER_PAGE = 9;

export function SearchResultsPanel({ params, onClose }: { params: HeroSearchParams; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [sortBy, setSortBy] = useState("relevancia");
  const [page, setPage] = useState(1);
  const [visible, setVisible] = useState(false);
  const [services, setServices] = useState<DbService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, []);

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      const sb = getSupabase();
      let query = sb
        .from("services")
        .select(SERVICE_SELECT)
        .eq("status", "active");

      if (params.category) {
        const { data: cat } = await sb
          .from("service_categories")
          .select("id")
          .eq("slug", params.category)
          .single();
        if (cat) query = query.eq("category_id", cat.id);
      }

      if (params.city) query = query.eq("location", params.city) as typeof query;

      const { data } = await query;
      setServices((data as unknown as DbService[]) ?? []);
      setLoading(false);
    }
    fetchServices();
  }, [params.category, params.city]);

  useEffect(() => { setPage(1); }, [maxPrice, sortBy]);

  const meta = CATEGORY_META[params.category] ?? { title: "Servicios disponibles", sub: "" };

  const filtered = useMemo(() => {
    let list = services.filter((s) => s.base_price == null || s.base_price <= maxPrice);
    if (sortBy === "precio-asc")  list = [...list].sort((a, b) => (a.base_price ?? 0) - (b.base_price ?? 0));
    if (sortBy === "precio-desc") list = [...list].sort((a, b) => (b.base_price ?? 0) - (a.base_price ?? 0));
    return list;
  }, [services, maxPrice, sortBy]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div
      ref={panelRef}
      style={{
        background: "#f4f5f7",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 380ms ease, transform 380ms ease",
      }}
    >
      {/* Panel header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-[11px] uppercase tracking-[1px] font-semibold mb-1">
              Servicios para eventos
            </p>
            <h2 className="text-gray-900 text-[26px] font-black tracking-[-0.5px] leading-none">
              {meta.title}
            </h2>
            {meta.sub && <p className="text-gray-400 text-[13px] mt-1">{meta.sub}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-500 font-semibold cursor-pointer bg-white hover:border-[rgba(243,158,16,0.4)] hover:text-[#f39e10] transition-colors"
          >
            <X size={14} />
            Modificar búsqueda
          </button>
        </div>
      </div>

      {/* Body: sidebar + grid */}
      <div className="max-w-[1280px] mx-auto px-8 py-8 flex gap-6 items-start">

        {/* Sidebar */}
        <aside className="w-[240px] shrink-0 flex flex-col gap-4 sticky top-[88px]">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="text-gray-900 text-[13px] font-bold uppercase tracking-[0.6px] mb-4">
              Precio por evento
            </h3>
            <input
              type="range"
              min={500} max={20000} step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(+e.target.value)}
              className="w-full accent-[#f39e10] mb-2"
            />
            <div className="flex justify-between text-[12px]">
              <span className="text-gray-400">S/ 500</span>
              <span className="text-[#f39e10] font-bold">S/ {maxPrice.toLocaleString("es-PE")}</span>
            </div>
          </div>

          <button
            onClick={() => { setMaxPrice(20000); setSortBy("relevancia"); }}
            className="text-gray-400 text-[12px] hover:text-[#f39e10] transition-colors cursor-pointer text-left"
          >
            Limpiar filtros
          </button>
        </aside>

        {/* Main results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <span className="text-gray-900 text-[15px]">
              <strong className="font-black">{filtered.length}</strong>{" "}
              {filtered.length === 1 ? "servicio disponible" : "servicios disponibles"}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-2 text-[13px] font-medium outline-none cursor-pointer"
            >
              <option value="relevancia">Más populares</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
            </select>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
              <div className="w-8 h-8 border-2 border-[#f39e10] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400 text-[14px]">Buscando servicios...</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
              <div className="text-5xl mb-4">🎪</div>
              <h3 className="text-gray-700 font-bold text-[18px] mb-2">Aún no hay servicios disponibles</h3>
              <p className="text-gray-400 text-[14px]">Pronto los mejores proveedores del Perú estarán aquí.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-5 mb-8">
                {paginated.map((s) => <ServiceCard key={s.id} service={s} />)}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1.5">
                  <PagBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft size={16} />
                  </PagBtn>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <PagBtn key={n} active={page === n} onClick={() => setPage(n)}>{n}</PagBtn>
                  ))}
                  <PagBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    <ChevronRight size={16} />
                  </PagBtn>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PagBtn({ children, onClick, disabled, active }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-9 h-9 rounded-lg flex items-center justify-center text-[14px] transition-all cursor-pointer"
      style={{
        border: `1px solid ${active ? "#f39e10" : "#e5e7eb"}`,
        background: active ? "#f39e10" : "#fff",
        color: active ? "#fff" : disabled ? "#d1d5db" : "#374151",
        fontWeight: active ? 700 : 400,
      }}
    >
      {children}
    </button>
  );
}
