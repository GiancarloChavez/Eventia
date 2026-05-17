"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Star, X } from "lucide-react";
import { ALL_SERVICES, type Category } from "@/lib/data";
import { ServiceCard } from "@/components/shared/service-card";
import type { HeroSearchParams } from "./hero";

const CATEGORY_META: Record<string, { title: string; sub: string }> = {
  local:      { title: "Locales para eventos",           sub: "Salones, haciendas y espacios únicos" },
  fotografia: { title: "Fotógrafos y videógrafos",       sub: "Captura cada momento especial" },
  musica:     { title: "Música y entretenimiento",       sub: "Orquestas, DJs y bandas en vivo" },
  decoracion: { title: "Decoración y ambientación",      sub: "Propuestas únicas y personalizadas" },
};

const PER_PAGE = 9;

const RATINGS = [
  { v: 0,   label: "Cualquiera" },
  { v: 4.0, label: "4.0+ ★" },
  { v: 4.5, label: "4.5+ ★" },
  { v: 4.8, label: "4.8+ ★" },
];

export function SearchResultsPanel({ params, onClose }: { params: HeroSearchParams; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("relevancia");
  const [page, setPage] = useState(1);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, []);

  useEffect(() => { setPage(1); }, [maxPrice, minRating, sortBy]);

  const meta = CATEGORY_META[params.category] ?? { title: "Servicios disponibles", sub: "" };

  const filtered = useMemo(() => {
    let list = ALL_SERVICES.filter((s) => {
      if (params.category && s.category !== (params.category as Category)) return false;
      if (s.price > maxPrice) return false;
      if (s.rating < minRating) return false;
      return true;
    });
    if (sortBy === "precio-asc")   list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "precio-desc")  list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === "calificacion") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [params.category, maxPrice, minRating, sortBy]);

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
      {/* ── Panel header ─────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-[11px] uppercase tracking-[1px] font-semibold mb-1">
              Servicios para eventos
            </p>
            <h2 className="text-gray-900 text-[26px] font-black tracking-[-0.5px] leading-none">
              {meta.title}
            </h2>
            {meta.sub && (
              <p className="text-gray-400 text-[13px] mt-1">{meta.sub}</p>
            )}
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

      {/* ── Body: sidebar + grid ─────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-8 py-8 flex gap-6 items-start">

        {/* Sidebar */}
        <aside className="w-[240px] shrink-0 flex flex-col gap-4 sticky top-[88px]">

          {/* Price filter */}
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
              <span className="text-[#f39e10] font-bold">
                S/ {maxPrice.toLocaleString("es-PE")}
              </span>
            </div>
          </div>

          {/* Rating filter */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="text-gray-900 text-[13px] font-bold uppercase tracking-[0.6px] mb-4">
              Calificación
            </h3>
            <div className="flex flex-col gap-3">
              {RATINGS.map((r) => {
                const count = ALL_SERVICES.filter(
                  (s) => (!params.category || s.category === params.category) && s.rating >= r.v
                ).length;
                const active = minRating === r.v;
                return (
                  <label
                    key={r.v}
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() => setMinRating(r.v)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors"
                        style={{
                          borderColor: active ? "#f39e10" : "#d1d5db",
                          background: active ? "#f39e10" : "white",
                        }}
                      >
                        {active && <Star size={9} fill="white" stroke="none" />}
                      </div>
                      <span className="text-[13px]" style={{ color: active ? "#111827" : "#6b7280", fontWeight: active ? 600 : 400 }}>
                        {r.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400">{count}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={() => { setMaxPrice(20000); setMinRating(0); setSortBy("relevancia"); }}
            className="text-gray-400 text-[12px] hover:text-[#f39e10] transition-colors cursor-pointer text-left"
          >
            Limpiar filtros
          </button>
        </aside>

        {/* Main results */}
        <div className="flex-1 min-w-0">

          {/* Toolbar */}
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
              <option value="calificacion">Mejor calificación</option>
            </select>
          </div>

          {/* Grid */}
          {paginated.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
              <p className="text-gray-400 text-[14px]">Sin resultados. Ajusta los filtros.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-5 mb-8">
                {paginated.map((s) => (
                  <ServiceCard key={s.id} service={s} />
                ))}
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
