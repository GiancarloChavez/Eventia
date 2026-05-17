"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ALL_SERVICES, type Category } from "@/lib/data";
import { ServiceCard } from "@/components/shared/service-card";

const CATS = [
  { id: "" as Category | "",  label: "Todos" },
  { id: "local" as Category,       label: "Locales" },
  { id: "fotografia" as Category,  label: "Fotografía" },
  { id: "musica" as Category,      label: "Música" },
  { id: "decoracion" as Category,  label: "Decoración" },
];

const PER_PAGE = 6;

export default function CatalogPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [category, setCategory] = useState<Category | "">((searchParams.get("category") as Category) ?? "");
  const [maxPrice, setMaxPrice] = useState(20000);
  const [minRating, setMinRating] = useState(0);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState("relevancia");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const cat = searchParams.get("category") as Category | null;
    setCategory(cat ?? "");
  }, [searchParams]);

  useEffect(() => { setPage(1); }, [category, maxPrice, minRating, onlyVerified, sortBy]);

  const filtered = useMemo(() => {
    let list = ALL_SERVICES.filter((s) => {
      if (category && s.category !== category) return false;
      if (s.price > maxPrice) return false;
      if (s.rating < minRating) return false;
      if (onlyVerified && !s.verified) return false;
      return true;
    });
    if (sortBy === "precio-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "precio-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === "calificacion") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [category, maxPrice, minRating, onlyVerified, sortBy]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function setUrlCategory(cat: Category | "") {
    setCategory(cat);
    const params = new URLSearchParams(searchParams.toString());
    if (cat) params.set("category", cat);
    else params.delete("category");
    router.push(`/catalogo?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="bg-[#f4f5f7] min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-10 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/" className="text-gray-500 text-[13px] hover:text-[#f39e10]">Inicio</Link>
          <span className="text-gray-300">›</span>
          <span className="text-gray-900 text-[13px] font-semibold">Catálogo de servicios</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-gray-500 text-[13px]">{filtered.length} resultados</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-1.5 text-[13px] outline-none cursor-pointer"
            >
              <option value="relevancia">Relevancia</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="calificacion">Mejor calificación</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-10 py-6" style={{ gridTemplateColumns: "260px 1fr" }}>
        {/* Filters sidebar */}
        <aside className="sticky top-[84px] self-start">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-gray-900 text-[16px] font-bold">Filtros</h3>
              <button
                onClick={() => { setUrlCategory(""); setMaxPrice(20000); setMinRating(0); setOnlyVerified(false); }}
                className="text-[#f39e10] text-[12px] font-semibold bg-none border-none cursor-pointer"
              >
                Limpiar todo
              </button>
            </div>

            {/* Category */}
            <div className="mb-5">
              <h4 className="text-gray-700 text-[12px] font-bold tracking-[0.8px] uppercase mb-2.5">Categoría</h4>
              {CATS.map((cat) => (
                <CheckRow
                  key={cat.id}
                  checked={category === cat.id}
                  onChange={() => setUrlCategory(cat.id)}
                  label={cat.label}
                />
              ))}
            </div>

            <div className="h-px bg-gray-100 my-5" />

            {/* Price */}
            <div className="mb-5">
              <h4 className="text-gray-700 text-[12px] font-bold tracking-[0.8px] uppercase mb-3">Precio máximo (S/)</h4>
              <input
                type="range" min={500} max={20000} step={500} value={maxPrice}
                onChange={(e) => setMaxPrice(+e.target.value)}
                className="w-full accent-[#f39e10]"
              />
              <div className="flex justify-between mt-1.5">
                <span className="text-gray-400 text-[12px]">S/ 500</span>
                <span className="text-[#f39e10] font-bold text-[13px]">S/ {maxPrice.toLocaleString("es-PE")}</span>
              </div>
            </div>

            <div className="h-px bg-gray-100 my-5" />

            {/* Rating */}
            <div className="mb-5">
              <h4 className="text-gray-700 text-[12px] font-bold tracking-[0.8px] uppercase mb-2.5">Calificación mínima</h4>
              {[{ v: 0, l: "Cualquiera" }, { v: 4, l: "4+ estrellas" }, { v: 4.5, l: "4.5+ estrellas" }, { v: 4.8, l: "4.8+ estrellas" }].map((r) => (
                <RadioRow key={r.v} checked={minRating === r.v} onSelect={() => setMinRating(r.v)} label={r.l} />
              ))}
            </div>

            <div className="h-px bg-gray-100 my-5" />

            {/* Verified */}
            <div>
              <h4 className="text-gray-700 text-[12px] font-bold tracking-[0.8px] uppercase mb-2.5">Proveedor</h4>
              <CheckRow checked={onlyVerified} onChange={() => setOnlyVerified(!onlyVerified)} label="Solo verificados" />
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          {/* Active filter chips */}
          {(category || maxPrice < 20000 || minRating > 0 || onlyVerified) && (
            <div className="flex gap-2 flex-wrap mb-4">
              {category && (
                <Chip label={CATS.find((c) => c.id === category)?.label ?? ""} onRemove={() => setUrlCategory("")} />
              )}
              {maxPrice < 20000 && (
                <Chip label={`Hasta S/ ${maxPrice.toLocaleString("es-PE")}`} onRemove={() => setMaxPrice(20000)} />
              )}
              {minRating > 0 && (
                <Chip label={`${minRating}+ ★`} onRemove={() => setMinRating(0)} />
              )}
              {onlyVerified && (
                <Chip label="Verificados" onRemove={() => setOnlyVerified(false)} />
              )}
            </div>
          )}

          {paginated.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
              <h3 className="text-gray-900 mb-2">Sin resultados</h3>
              <p className="text-gray-500 text-[14px]">Prueba ajustando los filtros de búsqueda.</p>
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
                    <PagBtn key={n} active={page === n} onClick={() => setPage(n)}>
                      {n}
                    </PagBtn>
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

function CheckRow({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer py-1.5">
      <button
        onClick={onChange}
        className="w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center shrink-0 transition-all"
        style={{ background: checked ? "#f39e10" : "#fff", borderColor: checked ? "#f39e10" : "#e5e7eb" }}
      >
        {checked && (
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>
      <span className="text-[14px]" style={{ color: checked ? "#111827" : "#6b7280" }}>{label}</span>
    </label>
  );
}

function RadioRow({ checked, onSelect, label }: { checked: boolean; onSelect: () => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer py-1.5" onClick={onSelect}>
      <div
        className="w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 transition-all"
        style={{ borderColor: checked ? "#f39e10" : "#e5e7eb" }}
      >
        {checked && <div className="w-2 h-2 rounded-full bg-[#f39e10]" />}
      </div>
      <span className="text-[14px]" style={{ color: checked ? "#111827" : "#6b7280" }}>{label}</span>
    </label>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[rgba(243,158,16,0.08)] border border-[rgba(243,158,16,0.22)] text-[#f39e10] rounded-full px-3 py-1 text-[12px] font-semibold">
      {label}
      <button onClick={onRemove} className="bg-none border-none text-[#f39e10] cursor-pointer text-[14px] leading-none">&times;</button>
    </span>
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
