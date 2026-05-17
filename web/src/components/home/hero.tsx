"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, Camera, Music, Sparkles } from "lucide-react";
import { PERUVIAN_CITIES } from "@/lib/data";

const TABS = [
  { label: "Locales",    cat: "local",      icon: Building2 },
  { label: "Fotografía", cat: "fotografia", icon: Camera },
  { label: "Música",     cat: "musica",     icon: Music },
  { label: "Decoración", cat: "decoracion", icon: Sparkles },
];

export type HeroSearchParams = { category: string; city: string; date: string; guests: string };

export function Hero({ onSearch }: { onSearch?: (p: HeroSearchParams) => void }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Locales");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");

  const activeCat = TABS.find((t) => t.label === activeTab)?.cat ?? "local";

  const handleSearch = () => {
    if (onSearch) {
      onSearch({ category: activeCat, city, date, guests });
    } else {
      const params = new URLSearchParams({ category: activeCat });
      if (city) params.set("city", city);
      if (date) params.set("date", date);
      router.push(`/catalogo?${params.toString()}`);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <section
      className="relative flex flex-col items-center justify-center"
      style={{
        minHeight: "92vh",
        backgroundImage: [
          "linear-gradient(180deg,",
          "  rgba(0,0,0,0.52) 0%,",
          "  rgba(0,0,0,0.28) 45%,",
          "  rgba(0,0,0,0.62) 100%",
          "), url('/hero.jpg')",
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
      {/* Trust badges */}
      <div className="flex gap-6 mb-8 flex-wrap justify-center">
        {[
          { dot: "#4ade80", label: "Pago 100% seguro" },
          { dot: "#f59e0b", label: "Proveedores verificados" },
          { dot: "#60a5fa", label: "Soporte 24/7" },
        ].map(({ dot, label }) => (
          <div key={label} className="flex items-center gap-2 text-white/90 text-[13px]">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
            {label}
          </div>
        ))}
      </div>

      {/* Headline */}
      <h1
        className="text-white font-black text-center leading-[1.06] tracking-[-2px] mb-4"
        style={{ fontSize: "clamp(40px, 5.5vw, 64px)", textShadow: "0 2px 24px rgba(0,0,0,0.35)" }}
      >
        Tu evento perfecto,
        <br />
        <span
          style={{
            background: "linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #f39e10 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          en un solo lugar
        </span>
      </h1>

      <p className="text-white/75 text-[17px] text-center max-w-[560px] leading-relaxed mb-10">
        Busca, compara y contrata locales, fotógrafos, DJs y decoradores
        para tu quinceaños, boda o graduación.
      </p>

      {/* Search widget */}
      <div className="w-full max-w-[900px]">
        {/* Category tabs */}
        <div className="flex justify-center mb-3">
          <div
            className="inline-flex items-center gap-1 p-1.5 rounded-full"
            style={{
              background: "rgba(10,10,18,0.88)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.label;
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[13px] font-medium transition-all duration-200 cursor-pointer border-none whitespace-nowrap"
                  style={{
                    background: active
                      ? "linear-gradient(135deg, #fff 0%, #fffdf7 100%)"
                      : "transparent",
                    color: active ? "#111827" : "rgba(255,255,255,0.75)",
                    fontWeight: active ? 700 : 400,
                    boxShadow: active ? "0 2px 12px rgba(0,0,0,0.18)" : "none",
                  }}
                >
                  <Icon size={15} style={{ color: active ? "#f39e10" : "rgba(255,255,255,0.55)" }} strokeWidth={1.8} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search bar */}
        <div
          className="bg-white rounded-2xl flex items-stretch"
          style={{
            padding: "8px 8px 8px 0",
            boxShadow: "0 16px 64px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.15)",
          }}
        >
          <Field label="Ciudad" flex="1.4">
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
          </Field>

          <Divider />

          <Field label="Fecha del evento" flex="1.2">
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border-none outline-none text-[15px] font-medium bg-transparent"
              style={{ color: date ? "#111827" : "#9ca3af" }}
              suppressHydrationWarning
            />
          </Field>

          <Divider />

          <Field label="Invitados" flex="0.9">
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
          </Field>

          <button
            onClick={handleSearch}
            className="rounded-xl text-white text-[15px] font-bold flex items-center gap-2 transition-all cursor-pointer border-none ml-2 shrink-0"
            style={{
              padding: "0 28px",
              background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
              boxShadow: "0 4px 20px rgba(243,158,16,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <Search size={16} strokeWidth={2.5} />
            Buscar
          </button>
        </div>

        {/* Quick stats */}
        <div className="flex justify-center gap-8 mt-5">
          {[
            { val: "+2,400", lbl: "proveedores" },
            { val: "+15K",   lbl: "eventos" },
            { val: "4.8 ★", lbl: "valoración" },
          ].map(({ val, lbl }) => (
            <div key={lbl} className="flex items-center gap-1.5 text-white/60 text-[13px]">
              <span className="text-white/90 font-bold">{val}</span>
              {lbl}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Field({ label, flex, children }: { label: string; flex: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3" style={{ flex }}>
      <span className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.6px]">{label}</span>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="w-px bg-gray-100 self-stretch my-3" />;
}
