"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Check, Building2, Camera, Music, Sparkles } from "lucide-react";
import { PERUVIAN_CITIES } from "@/lib/data";

const TABS = [
  { label: "Locales",     cat: "local",       icon: Building2 },
  { label: "Fotografía",  cat: "fotografia",  icon: Camera },
  { label: "Música",      cat: "musica",       icon: Music },
  { label: "Decoración",  cat: "decoracion",  icon: Sparkles },
];

export function Hero() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Locales");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");

  const activeCat = TABS.find((t) => t.label === activeTab)?.cat ?? "local";

  const handleSearch = () => {
    const params = new URLSearchParams({ category: activeCat });
    if (city) params.set("city", city);
    if (date) params.set("date", date);
    router.push(`/catalogo?${params.toString()}`);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <section
      className="relative flex flex-col items-center justify-center px-10"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.54) 0%, rgba(0,0,0,0.32) 50%, rgba(0,0,0,0.58) 100%), url('/hero.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: 400,
        paddingTop: 56,
        paddingBottom: 130,
      }}
    >
      {/* Trust chips */}
      <div className="flex gap-5 mb-6 flex-wrap justify-center">
        {["Pago seguro", "Proveedores verificados", "Soporte 24/7"].map((label) => (
          <div key={label} className="flex items-center gap-1.5 text-white/90 text-[13px]">
            <span className="text-green-400">
              <Check size={13} strokeWidth={3} />
            </span>
            {label}
          </div>
        ))}
      </div>

      <h1 className="text-white text-[52px] font-black text-center mb-2.5 leading-[1.1] tracking-[-1.5px] [text-shadow:0_2px_12px_rgba(0,0,0,0.3)]">
        Tu evento perfecto,<br />en un solo lugar
      </h1>
      <p className="text-white/80 text-[17px] text-center max-w-[560px] leading-relaxed">
        Busca, compara y contrata locales, fotógrafos, DJs y decoradores para tu quinceaños, boda o graduación.
      </p>

      {/* Floating search widget */}
      <div
        className="absolute bottom-[-76px] left-1/2 -translate-x-1/2 z-10"
        style={{ width: "calc(100% - 80px)", maxWidth: 880 }}
      >
        {/* Dark pill tabs */}
        <div className="flex justify-center mb-2.5">
          <div
            className="inline-flex items-center gap-0.5 rounded-full p-1.5"
            style={{
              background: "rgba(14,14,22,0.95)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
            }}
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.label;
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border-none text-[14px] font-medium transition-all duration-150 cursor-pointer whitespace-nowrap"
                  style={{
                    background: active ? "#fff" : "transparent",
                    color: active ? "#111827" : "rgba(255,255,255,0.82)",
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  <Icon
                    size={16}
                    className={active ? "text-[#f39e10]" : "text-white/60"}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* White search bar */}
        <div
          className="bg-white rounded-2xl flex items-stretch px-5 py-4"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.22)" }}
        >
          <SearchField label="Ciudad" flex="1.4">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border-none outline-none text-[15px] font-medium bg-transparent cursor-pointer"
              style={{ color: city ? "#111827" : "#9ca3af" }}
            >
              <option value="">Seleccionar ciudad</option>
              {PERUVIAN_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </SearchField>

          <div className="w-px bg-gray-200 mx-2 self-stretch" />

          <SearchField label="Fecha del evento" flex="1.2">
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border-none outline-none text-[15px] font-medium bg-transparent"
              style={{ color: date ? "#111827" : "#9ca3af" }}
              suppressHydrationWarning
            />
          </SearchField>

          <div className="w-px bg-gray-200 mx-2 self-stretch" />

          <SearchField label="Invitados" flex="0.9">
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full border-none outline-none text-[15px] font-medium bg-transparent cursor-pointer"
              style={{ color: guests ? "#111827" : "#9ca3af" }}
            >
              <option value="">¿Cuántos?</option>
              <option value="20-50">20 – 50</option>
              <option value="50-100">50 – 100</option>
              <option value="100-200">100 – 200</option>
              <option value="200+">200+</option>
            </select>
          </SearchField>

          <button
            onClick={handleSearch}
            className="bg-[#f39e10] hover:bg-[#d4870e] text-white rounded-xl px-7 text-[15px] font-bold flex items-center gap-2 ml-3 shrink-0 transition-colors cursor-pointer border-none"
          >
            <Search size={16} /> Buscar
          </button>
        </div>
      </div>
    </section>
  );
}

function SearchField({
  label,
  flex,
  children,
}: {
  label: string;
  flex: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 px-3.5" style={{ flex }}>
      <div className="text-gray-300 text-[11px] font-bold uppercase tracking-[0.5px]">{label}</div>
      {children}
    </div>
  );
}
