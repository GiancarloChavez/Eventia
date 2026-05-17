import Link from "next/link";
import { Hero } from "@/components/home/hero";
import { ServiceCard } from "@/components/shared/service-card";
import { StarRating } from "@/components/shared/star-rating";
import { Footer } from "@/components/layout/footer";
import { ALL_SERVICES } from "@/lib/data";
import { Search, CalendarCheck, PartyPopper } from "lucide-react";

const FEATURED_IDS = [1, 3, 5, 6];

export default function HomePage() {
  const featured = ALL_SERVICES.filter((s) => FEATURED_IDS.includes(s.id));

  return (
    <div className="bg-[#f4f5f7]">
      <Hero />

      {/* Spacer for floating widget */}
      <div className="h-28" />

      {/* Promo strip */}
      <section className="px-10 pt-8">
        <h2 className="text-gray-900 text-[20px] font-bold mb-4">
          Ventajas exclusivas para nuevos usuarios
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { pct: null, title: "¡Ahorra con tus descuentos de bienvenida!", cta: "Ver promociones", bg: "rgba(243,158,16,0.08)" },
            { pct: "-10%", title: "Locales",    sub: "Primeras 3 reservas",    color: "#b45309", bg: "#fffbeb" },
            { pct: "-8%",  title: "Fotografía", sub: "Fotógrafos verificados", color: "#1d4ed8", bg: "#eff6ff" },
            { pct: "-12%", title: "Música",     sub: "Orquestas y DJs",        color: "#6d28d9", bg: "#f5f3ff" },
          ].map((promo, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-xl p-5 flex flex-col justify-between min-h-[110px]"
              style={{ background: promo.bg }}
            >
              {promo.pct ? (
                <>
                  <div className="text-[28px] font-black" style={{ color: promo.color }}>{promo.pct}</div>
                  <div>
                    <div className="text-gray-900 font-bold text-[14px]">{promo.title}</div>
                    <div className="text-gray-500 text-[12px]">{(promo as { sub?: string }).sub}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-gray-900 font-bold text-[15px] leading-snug">{promo.title}</div>
                  <Link
                    href="/catalogo"
                    className="self-start bg-[#f39e10] text-white rounded-lg px-3.5 py-1.5 text-[13px] font-semibold hover:bg-[#d4870e] transition-colors"
                  >
                    {(promo as { cta?: string }).cta}
                  </Link>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Featured services */}
      <section className="px-10 pt-10">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-gray-900 text-[20px] font-bold mb-0.5">Servicios más reservados</h2>
            <p className="text-gray-500 text-[13px]">Los favoritos de esta semana</p>
          </div>
          <Link
            href="/catalogo"
            className="border border-[#f39e10] text-[#f39e10] rounded-lg px-4 py-2 text-[13px] font-semibold hover:bg-[rgba(243,158,16,0.08)] transition-colors"
          >
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {featured.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-10 pt-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-10">
          <h2 className="text-gray-900 text-[20px] font-bold mb-2 text-center">¿Cómo funciona Eventia?</h2>
          <p className="text-gray-500 text-[14px] text-center mb-9">Organiza tu evento en 3 simples pasos</p>
          <div className="grid grid-cols-3 gap-10">
            {[
              { n: "01", title: "Busca",    desc: "Explora cientos de proveedores verificados. Filtra por categoría, ciudad, precio y disponibilidad en tiempo real.", Icon: Search },
              { n: "02", title: "Reserva",  desc: "Elige tu proveedor, selecciona la fecha y paga de forma 100% segura directamente en la plataforma.",               Icon: CalendarCheck },
              { n: "03", title: "Disfruta", desc: "Tu evento está en manos expertas. Nosotros coordinamos, tú disfrutas de cada momento.",                           Icon: PartyPopper },
            ].map((step, i) => (
              <div key={step.n} className="text-center relative">
                {i < 2 && (
                  <div
                    className="absolute top-8 h-px"
                    style={{ left: "calc(50% + 44px)", width: "calc(100% - 88px)", background: "linear-gradient(90deg, rgba(243,158,16,0.22), transparent)" }}
                  />
                )}
                <div className="w-16 h-16 rounded-2xl bg-[rgba(243,158,16,0.08)] border border-[rgba(243,158,16,0.22)] flex items-center justify-center mx-auto mb-4 relative z-10">
                  <step.Icon size={26} className="text-[#f39e10]" strokeWidth={1.8} />
                </div>
                <div className="text-[#f39e10] text-[11px] font-bold tracking-[1.5px] uppercase mb-1.5">Paso {step.n}</div>
                <h3 className="text-gray-900 text-[17px] font-bold mb-2">{step.title}</h3>
                <p className="text-gray-500 text-[13px] leading-7">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-10 pt-10">
        <h2 className="text-gray-900 text-[20px] font-bold mb-4">Lo que dicen nuestros clientes</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: "Fernanda López",  event: "Quinceaños · Lima",     rating: 5, text: '"Eventia me ahorró semanas de búsqueda. Encontré el salón perfecto y el fotógrafo en una tarde. ¡Totalmente recomendado!"' },
            { name: "Roberto Sánchez", event: "Boda · Arequipa",       rating: 5, text: '"La orquesta que encontramos aquí fue espectacular. El proceso de pago fue súper seguro y transparente."' },
            { name: "Karla Méndez",    event: "Graduación · Trujillo", rating: 5, text: '"No puedo creer lo fácil que fue organizar todo. Los proveedores respondieron al instante."' },
          ].map((t) => (
            <div key={t.name} className="bg-white border border-gray-200 rounded-xl p-6">
              <StarRating value={t.rating} showValue={false} />
              <p className="text-gray-700 text-[14px] leading-7 my-3 italic">{t.text}</p>
              <div className="flex gap-2.5 items-center">
                <div className="w-9 h-9 rounded-full bg-[rgba(243,158,16,0.08)] flex items-center justify-center">
                  <span className="text-[#f39e10] font-black text-[14px]">{t.name[0]}</span>
                </div>
                <div>
                  <div className="text-gray-900 font-bold text-[13px]">{t.name}</div>
                  <div className="text-gray-500 text-[12px]">{t.event}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats banner */}
      <section className="mx-10 mt-10 bg-[#f39e10] rounded-2xl px-10 py-8 flex justify-around">
        {[
          { val: "+2,400",  lbl: "proveedores activos" },
          { val: "+15,000", lbl: "eventos organizados" },
          { val: "4.8 ★",  lbl: "calificación promedio" },
          { val: "98%",     lbl: "clientes satisfechos" },
        ].map((s) => (
          <div key={s.lbl} className="text-center">
            <div className="text-white text-[28px] font-black">{s.val}</div>
            <div className="text-white/75 text-[13px] mt-0.5">{s.lbl}</div>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
}
