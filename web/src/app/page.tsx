import Link from "next/link";
import { Hero } from "@/components/home/hero";
import { ServiceCard } from "@/components/shared/service-card";
import { StarRating } from "@/components/shared/star-rating";
import { Footer } from "@/components/layout/footer";
import { ALL_SERVICES } from "@/lib/data";
import { Search, CalendarCheck, PartyPopper, Building2, Camera, Music, Sparkles, ArrowRight } from "lucide-react";

const FEATURED_IDS = [1, 3, 5, 6];

const CATEGORIES = [
  { label: "Locales",    href: "/catalogo?category=local",       icon: Building2, color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)" },
  { label: "Fotografía", href: "/catalogo?category=fotografia",  icon: Camera,    color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.18)" },
  { label: "Música",     href: "/catalogo?category=musica",      icon: Music,     color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.18)" },
  { label: "Decoración", href: "/catalogo?category=decoracion",  icon: Sparkles,  color: "#ec4899", bg: "rgba(236,72,153,0.08)", border: "rgba(236,72,153,0.18)" },
];

export default function HomePage() {
  const featured = ALL_SERVICES.filter((s) => FEATURED_IDS.includes(s.id));

  return (
    <div className="bg-[#f4f5f7]">
      <Hero />

      {/* Category quick-nav */}
      <section className="py-12 px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-4 gap-4">
            {CATEGORIES.map(({ label, href, icon: Icon, color, bg, border }) => (
              <Link
                key={label}
                href={href}
                className="group flex items-center gap-4 bg-white rounded-2xl px-6 py-5 border transition-all duration-300 hover:scale-[1.02]"
                style={{
                  borderColor: border,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: bg }}
                >
                  <Icon size={22} style={{ color }} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-900 font-bold text-[15px]">{label}</div>
                  <div className="text-gray-400 text-[12px] mt-0.5">Ver servicios →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promo strip */}
      <section className="pb-10 px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-gray-900 text-[22px] font-black tracking-[-0.5px]">Ofertas exclusivas</h2>
              <p className="text-gray-400 text-[13px] mt-0.5">Descuentos para nuevos usuarios verificados</p>
            </div>
            <Link href="/catalogo" className="flex items-center gap-1.5 text-[#f39e10] text-[13px] font-semibold hover:underline">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { pct: null,   title: "¡Bienvenido a Eventia!",    cta: "Ver promociones",   bg: "rgba(243,158,16,0.06)", border: "rgba(243,158,16,0.2)" },
              { pct: "-10%", title: "Locales",    sub: "Primeras 3 reservas",    color: "#b45309", bg: "#fffbeb",    border: "#fde68a" },
              { pct: "-8%",  title: "Fotografía", sub: "Fotógrafos verificados", color: "#1d4ed8", bg: "#eff6ff",    border: "#bfdbfe" },
              { pct: "-12%", title: "Música",     sub: "Orquestas y DJs",        color: "#6d28d9", bg: "#f5f3ff",    border: "#ddd6fe" },
            ].map((promo, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 flex flex-col justify-between min-h-[120px] transition-all duration-200 hover:scale-[1.02]"
                style={{ background: promo.bg, border: `1px solid ${promo.border}` }}
              >
                {promo.pct ? (
                  <>
                    <div className="text-[32px] font-black leading-none" style={{ color: promo.color }}>{promo.pct}</div>
                    <div>
                      <div className="text-gray-900 font-bold text-[15px]">{promo.title}</div>
                      <div className="text-gray-500 text-[12px] mt-0.5">{(promo as { sub?: string }).sub}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-gray-900 font-bold text-[16px] leading-snug">{promo.title}</div>
                    <Link
                      href="/catalogo"
                      className="self-start text-white rounded-xl px-4 py-2 text-[13px] font-bold transition-colors"
                      style={{ background: "linear-gradient(135deg, #f59e0b, #f39e10)" }}
                    >
                      {(promo as { cta?: string }).cta}
                    </Link>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured services */}
      <section className="pb-12 px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-gray-900 text-[22px] font-black tracking-[-0.5px]">Servicios más reservados</h2>
              <p className="text-gray-400 text-[13px] mt-0.5">Los favoritos de esta semana en todo el Perú</p>
            </div>
            <Link
              href="/catalogo"
              className="flex items-center gap-1.5 border border-[rgba(243,158,16,0.4)] text-[#f39e10] rounded-full px-5 py-2 text-[13px] font-semibold hover:bg-[rgba(243,158,16,0.06)] transition-colors"
            >
              Ver catálogo completo <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-5">
            {featured.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="pb-12 px-8">
        <div className="max-w-[1280px] mx-auto">
          <div
            className="rounded-3xl p-12 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #fff 0%, #fffdf5 100%)",
              border: "1px solid rgba(243,158,16,0.12)",
              boxShadow: "0 4px 48px rgba(243,158,16,0.06)",
            }}
          >
            {/* Decorative gradient orb */}
            <div
              className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(243,158,16,0.08) 0%, transparent 70%)" }}
            />
            <h2 className="text-gray-900 text-[22px] font-black text-center tracking-[-0.5px] mb-1">¿Cómo funciona Eventia?</h2>
            <p className="text-gray-400 text-[14px] text-center mb-10">Organiza tu evento en 3 simples pasos</p>
            <div className="grid grid-cols-3 gap-12 relative">
              {[
                { n: "01", title: "Busca",    desc: "Explora cientos de proveedores verificados. Filtra por categoría, ciudad, precio y disponibilidad en tiempo real.", Icon: Search },
                { n: "02", title: "Reserva",  desc: "Elige tu proveedor, selecciona la fecha y paga 100% seguro directamente en la plataforma.", Icon: CalendarCheck },
                { n: "03", title: "Disfruta", desc: "Tu evento está en manos expertas. Nosotros coordinamos, tú disfrutas de cada momento.", Icon: PartyPopper },
              ].map((step, i) => (
                <div key={step.n} className="text-center relative">
                  {i < 2 && (
                    <div
                      className="absolute top-8 h-px"
                      style={{
                        left: "calc(50% + 44px)",
                        width: "calc(100% - 44px)",
                        background: "linear-gradient(90deg, rgba(243,158,16,0.3), rgba(243,158,16,0.05))",
                      }}
                    />
                  )}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10"
                    style={{
                      background: "rgba(243,158,16,0.08)",
                      border: "1.5px solid rgba(243,158,16,0.2)",
                      boxShadow: "0 4px 20px rgba(243,158,16,0.12)",
                    }}
                  >
                    <step.Icon size={26} className="text-[#f39e10]" strokeWidth={1.8} />
                  </div>
                  <div className="text-[#f39e10] text-[11px] font-black tracking-[2px] uppercase mb-2">PASO {step.n}</div>
                  <h3 className="text-gray-900 text-[18px] font-black mb-2.5">{step.title}</h3>
                  <p className="text-gray-500 text-[13px] leading-[1.8]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="pb-12 px-8">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-gray-900 text-[22px] font-black tracking-[-0.5px] mb-1">Lo que dicen nuestros clientes</h2>
          <p className="text-gray-400 text-[13px] mb-6">Experiencias reales de familias peruanas</p>
          <div className="grid grid-cols-3 gap-5">
            {[
              { name: "Fernanda López",  event: "Quinceaños · Lima",     rating: 5, text: "Eventia me ahorró semanas de búsqueda. Encontré el salón perfecto y el fotógrafo en una tarde. ¡Totalmente recomendado!" },
              { name: "Roberto Sánchez", event: "Boda · Arequipa",       rating: 5, text: "La orquesta que encontramos aquí fue espectacular. El proceso de pago fue súper seguro y transparente." },
              { name: "Karla Méndez",    event: "Graduación · Trujillo", rating: 5, text: "No puedo creer lo fácil que fue organizar todo. Los proveedores respondieron al instante. Servicio impecable." },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-6 transition-all duration-200 hover:shadow-lg"
                style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
              >
                <StarRating value={t.rating} showValue={false} />
                <p className="text-gray-600 text-[14px] leading-[1.8] my-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex gap-3 items-center pt-4" style={{ borderTop: "1px solid #f3f4f6" }}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, rgba(243,158,16,0.15), rgba(243,158,16,0.05))", border: "1.5px solid rgba(243,158,16,0.2)" }}
                  >
                    <span className="text-[#f39e10] font-black text-[15px]">{t.name[0]}</span>
                  </div>
                  <div>
                    <div className="text-gray-900 font-bold text-[13px]">{t.name}</div>
                    <div className="text-gray-400 text-[12px]">{t.event}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats banner */}
      <section className="pb-12 px-8">
        <div className="max-w-[1280px] mx-auto">
          <div
            className="rounded-3xl px-12 py-10 flex justify-around relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 40%, #e88e00 80%, #f59e0b 100%)",
              boxShadow: "0 8px 48px rgba(243,158,16,0.4)",
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
            {[
              { val: "+2,400",  lbl: "proveedores activos" },
              { val: "+15,000", lbl: "eventos organizados" },
              { val: "4.8 ★",  lbl: "calificación promedio" },
              { val: "98%",     lbl: "clientes satisfechos" },
            ].map((s) => (
              <div key={s.lbl} className="text-center relative">
                <div className="text-white text-[32px] font-black leading-none">{s.val}</div>
                <div className="text-white/70 text-[13px] mt-1.5">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
