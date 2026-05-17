"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, MapPin, Calendar, Users, Camera, Music, Sparkles, Building2, Tag, SlidersHorizontal, X } from "lucide-react";
import { ALL_SERVICES, PERUVIAN_CITIES, type Category } from "@/lib/data";
import { ServiceCard } from "@/components/shared/service-card";

/* ─── Category hero configs ─────────────────────────────────────────── */

type CatKey = "local" | "fotografia" | "musica" | "decoracion";

const HERO_CONFIG: Record<CatKey | "todos", {
  title: string;
  sub: string;
  img: string;
  color: string;
  field3Label: string;
  field3Icon: React.ElementType;
  field3Opts: string[];
}> = {
  todos: {
    title: "Todos los servicios para tu evento",
    sub: "Locales, fotografía, música y decoración en un solo lugar",
    img: "/hero.jpg",
    color: "#f39e10",
    field3Label: "Categoría",
    field3Icon: Tag,
    field3Opts: ["Locales", "Fotografía", "Música", "Decoración"],
  },
  local: {
    title: "El local perfecto para tu evento",
    sub: "Salones, haciendas y espacios únicos para tu celebración especial",
    img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1920&q=80",
    color: "#f59e0b",
    field3Label: "Capacidad",
    field3Icon: Users,
    field3Opts: ["20–50 personas", "50–100 personas", "100–200 personas", "200+ personas"],
  },
  fotografia: {
    title: "Fotógrafos y videógrafos profesionales",
    sub: "Captura cada momento especial con los mejores del Perú",
    img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1920&q=80",
    color: "#3b82f6",
    field3Label: "Tipo de evento",
    field3Icon: Camera,
    field3Opts: ["Boda", "Quinceaños", "Graduación", "Corporativo"],
  },
  musica: {
    title: "Música en vivo para tu celebración",
    sub: "Orquestas, DJs y bandas que hacen vibrar cualquier evento",
    img: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1920&q=80",
    color: "#8b5cf6",
    field3Label: "Tipo",
    field3Icon: Music,
    field3Opts: ["DJ", "Orquesta tropical", "Banda", "Solista"],
  },
  decoracion: {
    title: "Decoración que sorprende",
    sub: "Transforma tu evento con propuestas únicas y personalizadas",
    img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1920&q=80",
    color: "#ec4899",
    field3Label: "Estilo",
    field3Icon: Sparkles,
    field3Opts: ["Clásico", "Moderno", "Rústico", "Temático"],
  },
};

const CATS = [
  { id: "" as Category | "",       label: "Todos",      icon: Tag },
  { id: "local" as Category,       label: "Locales",    icon: Building2 },
  { id: "fotografia" as Category,  label: "Fotografía", icon: Camera },
  { id: "musica" as Category,      label: "Música",     icon: Music },
  { id: "decoracion" as Category,  label: "Decoración", icon: Sparkles },
];

const PER_PAGE = 8;

export default function CatalogPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [category, setCategory] = useState<Category | "">((searchParams.get("category") as Category) ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [date, setDate] = useState(searchParams.get("date") ?? "");
  const [field3, setField3] = useState("");
  const [maxPrice, setMaxPrice] = useState(20000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("relevancia");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const cat = searchParams.get("category") as Category | null;
    setCategory(cat ?? "");
    setPage(1);
  }, [searchParams]);

  useEffect(() => { setPage(1); }, [category, maxPrice, minRating, sortBy, city]);

  const heroKey = (category as CatKey) || "todos";
  const hero = HERO_CONFIG[heroKey];
  const Field3Icon = hero.field3Icon;

  const filtered = useMemo(() => {
    let list = ALL_SERVICES.filter((s) => {
      if (category && s.category !== category) return false;
      if (s.price > maxPrice) return false;
      if (s.rating < minRating) return false;
      return true;
    });
    if (sortBy === "precio-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "precio-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === "calificacion") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [category, maxPrice, minRating, sortBy]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function switchCategory(cat: Category | "") {
    setCategory(cat);
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    router.push(cat ? `/catalogo?${params.toString()}` : "/catalogo", { scroll: false });
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (city) params.set("city", city);
    if (date) params.set("date", date);
    router.push(`/catalogo?${params.toString()}`, { scroll: false });
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="bg-[#f4f5f7] min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center"
        style={{
          minHeight: "86vh",
          backgroundImage: [
            "linear-gradient(180deg,",
            "  rgba(0,0,0,0.56) 0%,",
            "  rgba(0,0,0,0.30) 48%,",
            "  rgba(0,0,0,0.65) 100%",
            `), url('${hero.img}')`,
          ].join(""),
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          paddingTop: 100,
          paddingLeft: 40,
          paddingRight: 40,
          paddingBottom: 80,
        }}
      >
        {/* Category pills */}
        <div className="flex gap-2 mb-7 flex-wrap justify-center">
          {CATS.map(({ id, label, icon: Icon }) => {
            const active = category === id;
            return (
              <button
                key={id}
                onClick={() => switchCategory(id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 cursor-pointer border"
                style={{
                  background: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.12)",
                  borderColor: active ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)",
                  color: active ? "#111827" : "rgba(255,255,255,0.88)",
                  backdropFilter: "blur(12px)",
                  fontWeight: active ? 700 : 400,
                }}
              >
                <Icon size={13} strokeWidth={1.8} style={{ color: active ? hero.color : "inherit" }} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Headline */}
        <h1
          className="text-white font-black text-center leading-[1.08] tracking-[-1.5px] mb-3"
          style={{ fontSize: "clamp(34px, 4.5vw, 56px)", textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}
        >
          {hero.title}
        </h1>
        <p className="text-white/72 text-[16px] text-center max-w-[520px] leading-relaxed mb-9">
          {hero.sub}
        </p>

        {/* Search widget */}
        <div className="w-full max-w-[860px]">
          <div
            className="bg-white rounded-2xl flex items-stretch"
            style={{
              padding: "8px 8px 8px 0",
              boxShadow: "0 16px 64px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.12)",
            }}
          >
            {/* Ciudad */}
            <div className="flex flex-col gap-1 px-4 py-3 flex-1">
              <span className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.6px] flex items-center gap-1">
                <MapPin size={10} /> Ciudad
              </span>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border-none outline-none text-[14px] font-medium bg-transparent cursor-pointer"
                style={{ color: city ? "#111827" : "#9ca3af" }}
              >
                <option value="">Seleccionar ciudad</option>
                {PERUVIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="w-px bg-gray-100 self-stretch my-3" />

            {/* Fecha */}
            <div className="flex flex-col gap-1 px-4 py-3" style={{ flex: "1.1" }}>
              <span className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.6px] flex items-center gap-1">
                <Calendar size={10} /> Fecha del evento
              </span>
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border-none outline-none text-[14px] font-medium bg-transparent"
                style={{ color: date ? "#111827" : "#9ca3af" }}
                suppressHydrationWarning
              />
            </div>

            <div className="w-px bg-gray-100 self-stretch my-3" />

            {/* Category-specific field */}
            <div className="flex flex-col gap-1 px-4 py-3 flex-1">
              <span className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.6px] flex items-center gap-1">
                <Field3Icon size={10} /> {hero.field3Label}
              </span>
              <select
                value={field3}
                onChange={(e) => setField3(e.target.value)}
                className="w-full border-none outline-none text-[14px] font-medium bg-transparent cursor-pointer"
                style={{ color: field3 ? "#111827" : "#9ca3af" }}
              >
                <option value="">Seleccionar</option>
                {hero.field3Opts.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <button
              onClick={handleSearch}
              className="rounded-xl text-white text-[14px] font-bold flex items-center gap-2 transition-all cursor-pointer border-none ml-2 shrink-0"
              style={{
                padding: "0 24px",
                background: `linear-gradient(135deg, #f59e0b 0%, ${hero.color} 60%, #e88e00 100%)`,
                boxShadow: `0 4px 20px rgba(243,158,16,0.5), inset 0 1px 0 rgba(255,255,255,0.2)`,
              }}
            >
              <Search size={16} strokeWidth={2.5} />
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* ── RESULTS ──────────────────────────────────────────────────── */}
      <section id="results" className="px-8 py-8">
        <div className="max-w-[1280px] mx-auto">

          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 items-center mb-6">
            <span className="text-gray-900 font-black text-[18px] mr-auto tracking-[-0.3px]">
              {filtered.length} {filtered.length === 1 ? "servicio encontrado" : "servicios encontrados"}
            </span>

            {/* Quick category pills */}
            <div className="flex gap-1.5">
              {CATS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => switchCategory(id)}
                  className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer border"
                  style={{
                    background: category === id ? "#f39e10" : "#fff",
                    borderColor: category === id ? "#f39e10" : "#e5e7eb",
                    color: category === id ? "#fff" : "#6b7280",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all cursor-pointer"
              style={{
                background: showFilters ? "rgba(243,158,16,0.08)" : "#fff",
                borderColor: showFilters ? "rgba(243,158,16,0.4)" : "#e5e7eb",
                color: showFilters ? "#f39e10" : "#6b7280",
              }}
            >
              <SlidersHorizontal size={13} strokeWidth={2} />
              Filtros
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 text-gray-900 rounded-full px-4 py-1.5 text-[12px] font-semibold outline-none cursor-pointer"
            >
              <option value="relevancia">Relevancia</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="calificacion">Mejor calificación</option>
            </select>
          </div>

          {/* Expandable filters */}
          {showFilters && (
            <div
              className="bg-white rounded-2xl p-5 mb-6 grid gap-6"
              style={{ gridTemplateColumns: "repeat(3, 1fr)", border: "1px solid rgba(243,158,16,0.12)" }}
            >
              {/* Price */}
              <div>
                <div className="text-gray-700 text-[12px] font-bold uppercase tracking-[0.8px] mb-3">Precio máximo (S/)</div>
                <input
                  type="range" min={500} max={20000} step={500} value={maxPrice}
                  onChange={(e) => setMaxPrice(+e.target.value)}
                  className="w-full accent-[#f39e10] mb-1"
                />
                <div className="flex justify-between">
                  <span className="text-gray-400 text-[12px]">S/ 500</span>
                  <span className="text-[#f39e10] font-bold text-[13px]">S/ {maxPrice.toLocaleString("es-PE")}</span>
                </div>
              </div>

              {/* Rating */}
              <div>
                <div className="text-gray-700 text-[12px] font-bold uppercase tracking-[0.8px] mb-3">Calificación mínima</div>
                <div className="flex flex-col gap-2">
                  {[{ v: 0, l: "Cualquiera" }, { v: 4, l: "4+ estrellas" }, { v: 4.5, l: "4.5+ ★" }, { v: 4.8, l: "4.8+ ★" }].map((r) => (
                    <label key={r.v} className="flex items-center gap-2 cursor-pointer" onClick={() => setMinRating(r.v)}>
                      <div className="w-4 h-4 rounded-full border flex items-center justify-center" style={{ borderColor: minRating === r.v ? "#f39e10" : "#e5e7eb" }}>
                        {minRating === r.v && <div className="w-2 h-2 rounded-full bg-[#f39e10]" />}
                      </div>
                      <span className="text-[13px]" style={{ color: minRating === r.v ? "#111827" : "#6b7280" }}>{r.l}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <div className="flex items-end">
                <button
                  onClick={() => { setMaxPrice(20000); setMinRating(0); setShowFilters(false); }}
                  className="flex items-center gap-1.5 text-gray-500 text-[13px] hover:text-[#f39e10] transition-colors cursor-pointer"
                >
                  <X size={14} /> Limpiar filtros
                </button>
              </div>
            </div>
          )}

          {/* Results grid */}
          {paginated.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
              <div className="text-gray-300 text-[48px] mb-3">🔍</div>
              <h3 className="text-gray-700 font-bold text-[18px] mb-1">Sin resultados</h3>
              <p className="text-gray-400 text-[14px]">Prueba ajustando los filtros de búsqueda.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-5 mb-8">
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
      </section>
    </div>
  );
}

function PagBtn({ children, onClick, disabled, active }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-9 h-9 rounded-lg flex items-center justify-center text-[14px] transition-all"
      style={{
        border: `1px solid ${active ? "#f39e10" : "#e5e7eb"}`,
        background: active ? "#f39e10" : "#fff",
        color: active ? "#fff" : disabled ? "#d1d5db" : "#374151",
        fontWeight: active ? 700 : 400,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}
