import Link from "next/link";
import { ArrowRight, ChevronRight, Check, ShieldCheck, Star, Zap, Headphones } from "lucide-react";
import { Footer } from "@/components/layout/footer";

// ── Photo library ──────────────────────────────────────────────
const P = {
  venue:      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=85",
  photo:      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=1000&q=85",
  music:      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1000&q=85",
  deco:       "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=85",
  client:     "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=85",
  provider:   "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=85",
  steps:      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=900&q=85",
  about:      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=85",
};

const CATEGORIES = [
  { label: "Locales y salones",  desc: "Salones de fiestas, jardines y centros de eventos.",        href: "/catalogo?category=local",      photo: P.venue },
  { label: "Fotografía y video", desc: "Fotógrafos profesionales que capturan cada momento.",        href: "/catalogo?category=fotografia", photo: P.photo },
  { label: "Música y DJ",        desc: "DJs, orquestas y grupos musicales para tu celebración.",     href: "/catalogo?category=musica",     photo: P.music },
  { label: "Decoración",         desc: "Decoradores que transforman cualquier espacio.",              href: "/catalogo?category=decoracion", photo: P.deco  },
];

const STEPS = [
  { n: "01", title: "Busca en tu ciudad",   desc: "Explora cientos de proveedores verificados en Iquitos. Filtra por categoría, precio y disponibilidad." },
  { n: "02", title: "Compara y cotiza",     desc: "Revisa perfiles completos con fotos reales y precios. Solicita cotizaciones directamente al proveedor." },
  { n: "03", title: "Reserva con seguridad", desc: "Confirma con pago 100% seguro y recibe confirmación inmediata. Soporte en cada paso del proceso." },
];

const FEATURES = [
  { Icon: ShieldCheck, title: "Proveedores verificados",  desc: "Cada proveedor pasa por verificación de documentos e identidad antes de aparecer en el catálogo.", color: "#16a34a" },
  { Icon: Star,        title: "Sin intermediarios",       desc: "Precios directos entre cliente y proveedor. Sin comisiones ocultas ni cargos adicionales.",          color: "#f39e10" },
  { Icon: Zap,         title: "Reserva en minutos",       desc: "Desde buscar hasta confirmar tu evento puede tomar menos de 10 minutos.",                            color: "#3b82f6" },
  { Icon: Headphones,  title: "Soporte dedicado",         desc: "Nuestro equipo te acompaña en cada etapa de la planificación de tu evento.",                         color: "#8b5cf6" },
];

const STATS = [
  { val: "+2,400", lbl: "Proveedores"    },
  { val: "+15K",   lbl: "Eventos"        },
  { val: "4.8",    lbl: "Valoración"     },
  { val: "100%",   lbl: "Pago seguro"    },
];

const TESTIMONIALS = [
  { name: "Sofía Ramírez",  role: "Quinceaños en Iquitos",  quote: "Encontré el salón perfecto en menos de 20 minutos. Todo el proceso fue transparente y el proveedor muy profesional.", init: "SR", color: "#f39e10" },
  { name: "Carlos Mendoza", role: "Boda en Iquitos",        quote: "Contratamos fotógrafo, decoración y DJ desde Eventia. Coordinarlo todo desde una sola plataforma fue increíble.",     init: "CM", color: "#3b82f6" },
  { name: "Lucía Torres",   role: "Graduación universitaria", quote: "La variedad es impresionante. Pude comparar precios y elegir lo que se ajustaba a mi presupuesto sin presión.",     init: "LT", color: "#8b5cf6" },
];

const FAQS = [
  { q: "¿Qué es Eventia?",                        a: "El marketplace de servicios para eventos sociales en Iquitos, Perú. Conectamos a personas que organizan bodas, quinceaños y graduaciones con los mejores proveedores locales verificados." },
  { q: "¿Cómo sé que los proveedores son confiables?", a: "Todos los proveedores pasan por verificación de documentos e identidad. Además puedes leer reseñas reales de otros clientes antes de reservar." },
  { q: "¿Cuánto cuesta usar Eventia?",             a: "Registrarte y explorar el catálogo es completamente gratis. Solo pagas cuando decides reservar, y el precio es exactamente el que acuerdas con el proveedor." },
  { q: "¿Puedo cancelar una reserva?",             a: "Sí. Las reservas pueden cancelarse gratuitamente hasta 7 días antes del evento, sujeto a las condiciones específicas del proveedor." },
];

// ── Shared overlay gradient ────────────────────────────────────
const DARK_OVERLAY = "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.82) 100%)";
const DARKER_OVERLAY = "linear-gradient(160deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.72) 100%)";

export default function HomePage() {
  return (
    <div style={{ fontFamily: "inherit" }}>

      {/* ═══════════════════════════════════════════════════
          HERO — full viewport, photo background
      ═══════════════════════════════════════════════════ */}
      <section
        className="relative flex flex-col items-center justify-center text-center"
        style={{
          minHeight: "100svh",
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.72) 80%, rgba(0,0,0,0.96) 100%), url('/hero.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          paddingTop: 110,
          paddingBottom: 80,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        {/* Pill label */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-[12px] font-bold tracking-[0.8px] uppercase"
          style={{ background: "rgba(243,158,16,0.18)", border: "1px solid rgba(243,158,16,0.40)", color: "#fde68a" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]" />
          Iquitos · Perú
        </div>

        {/* Headline */}
        <h1
          className="text-white font-black text-center leading-[1.02] mb-6 max-w-[820px]"
          style={{
            fontSize: "clamp(44px, 6.5vw, 78px)",
            letterSpacing: "-3px",
            textShadow: "0 4px 32px rgba(0,0,0,0.4)",
          }}
        >
          Tu evento perfecto,
          <br />
          <span style={{ color: "#f59e0b" }}>en un solo lugar.</span>
        </h1>

        <p
          className="text-white/70 text-center mb-10 max-w-[520px] leading-[1.75]"
          style={{ fontSize: "clamp(15px, 1.6vw, 18px)" }}
        >
          Encuentra, compara y contrata los mejores proveedores de eventos
          para tu quinceaños, boda o graduación — todo verificado.
        </p>

        {/* CTAs */}
        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            href="/catalogo"
            className="flex items-center gap-2.5 rounded-full font-bold text-white"
            style={{
              padding: "15px 36px",
              fontSize: 15,
              background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
              boxShadow: "0 8px 32px rgba(243,158,16,0.50), inset 0 1px 0 rgba(255,255,255,0.20)",
            }}
          >
            Explorar servicios
            <ArrowRight size={17} strokeWidth={2.5} />
          </Link>
          <Link
            href="/auth"
            className="flex items-center gap-2 rounded-full font-semibold text-white"
            style={{
              padding: "15px 32px",
              fontSize: 15,
              background: "rgba(255,255,255,0.10)",
              border: "1.5px solid rgba(255,255,255,0.30)",
              backdropFilter: "blur(10px)",
            }}
          >
            Crear cuenta gratis
            <ChevronRight size={17} />
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex gap-8 flex-wrap justify-center mt-12">
          {[
            { dot: "#4ade80", label: "Pago 100% seguro" },
            { dot: "#f59e0b", label: "Proveedores verificados" },
            { dot: "#60a5fa", label: "Soporte 24/7" },
          ].map(({ dot, label }) => (
            <div key={label} className="flex items-center gap-2 text-white/60 text-[13px]">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
              {label}
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-10"
          style={{ color: "rgba(255,255,255,0.40)" }}
        >
          <span className="text-[11px] tracking-[1.5px] uppercase">Descubre</span>
          <div className="w-px h-7" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.40), transparent)" }} />
        </div>

        {/* Fade to white at the very bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none z-20"
          style={{ height: 140, background: "linear-gradient(to bottom, transparent 0%, #ffffff 100%)" }}
        />
      </section>

      {/* ═══════════════════════════════════════════════════
          STATS — white strip, visual break between hero and photos
      ═══════════════════════════════════════════════════ */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f3f4f6" }}>
        <div className="max-w-[1100px] mx-auto px-8 py-12">
          <p className="text-center text-[11px] font-bold tracking-[1.5px] uppercase mb-8" style={{ color: "#d1d5db" }}>
            La plataforma de eventos sociales en Iquitos
          </p>
          <div className="grid grid-cols-4 gap-6">
            {STATS.map(({ val, lbl }) => (
              <div key={lbl} className="text-center">
                <div className="font-black leading-none mb-1.5" style={{ fontSize: "clamp(28px, 3vw, 42px)", color: "#f59e0b" }}>
                  {val}
                </div>
                <div className="text-[12px] tracking-[0.6px] uppercase font-semibold" style={{ color: "#9ca3af" }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SPLIT PATH — two immersive panels
      ═══════════════════════════════════════════════════ */}
      <section className="grid grid-cols-2" style={{ minHeight: "70vh" }}>
        {/* Client path */}
        <div
          className="group relative flex flex-col justify-end overflow-hidden"
          style={{ minHeight: 540 }}
        >
          <div
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url(${P.client})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0" style={{ background: DARKER_OVERLAY }} />
          <div className="relative z-10 p-12 pb-14">
            <div
              className="text-[11px] font-bold tracking-[1.5px] uppercase mb-4"
              style={{ color: "#fbbf24" }}
            >
              Para organizadores
            </div>
            <h2
              className="text-white font-black leading-[1.1] mb-5"
              style={{ fontSize: "clamp(24px, 2.8vw, 36px)", letterSpacing: "-1px" }}
            >
              ¿Organizas un evento<br />y no sabes por<br />dónde empezar?
            </h2>
            <p className="text-white/60 text-[14px] leading-[1.75] mb-8 max-w-[380px]">
              Busca, compara y reserva locales, fotógrafos, música y decoración
              para tu quinceaños, boda o graduación — todo en un solo lugar.
            </p>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 rounded-full text-white font-bold text-[14px]"
              style={{
                padding: "13px 28px",
                background: "linear-gradient(135deg, #f59e0b, #e88e00)",
                boxShadow: "0 6px 24px rgba(243,158,16,0.45)",
              }}
            >
              Explorar servicios
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        {/* Provider path */}
        <div
          className="group relative flex flex-col justify-end overflow-hidden"
          style={{ minHeight: 540 }}
        >
          <div
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url(${P.provider})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(160deg, rgba(10,6,0,0.30) 0%, rgba(10,6,0,0.80) 100%)" }}
          />
          <div className="relative z-10 p-12 pb-14">
            <div
              className="text-[11px] font-bold tracking-[1.5px] uppercase mb-4"
              style={{ color: "#fbbf24" }}
            >
              Para proveedores
            </div>
            <h2
              className="text-white font-black leading-[1.1] mb-5"
              style={{ fontSize: "clamp(24px, 2.8vw, 36px)", letterSpacing: "-1px" }}
            >
              ¿Quieres ofrecer<br />tus servicios<br />para eventos?
            </h2>
            <p className="text-white/60 text-[14px] leading-[1.75] mb-8 max-w-[380px]">
              Publica tus servicios, llega a cientos de clientes en Iquitos y gestiona
              tus reservas desde un panel profesional. El registro es gratuito.
            </p>
            <Link
              href="/auth/registro?tipo=proveedor"
              className="inline-flex items-center gap-2 rounded-full text-white font-semibold text-[14px]"
              style={{
                padding: "13px 28px",
                background: "rgba(255,255,255,0.12)",
                border: "1.5px solid rgba(255,255,255,0.30)",
                backdropFilter: "blur(8px)",
              }}
            >
              Registrar mi negocio
              <ArrowRight size={15} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CATEGORÍAS — photo grid cards
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 px-8" style={{ background: "#fff" }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-14">
            <div
              className="text-[11px] font-bold tracking-[1.5px] uppercase mb-4"
              style={{ color: "#f39e10" }}
            >
              Nuestros servicios
            </div>
            <h2
              className="font-black leading-[1.05] max-w-[540px]"
              style={{ fontSize: "clamp(32px, 4vw, 52px)", color: "#111827", letterSpacing: "-2px" }}
            >
              Encuentra exactamente lo que necesitas.
            </h2>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {CATEGORIES.map(({ label, desc, href, photo }) => (
              <Link
                key={label}
                href={href}
                className="group relative rounded-2xl overflow-hidden flex flex-col justify-end"
                style={{ height: 420, textDecoration: "none" }}
              >
                {/* Photo */}
                <div
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${photo})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                {/* Overlay */}
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{ background: DARK_OVERLAY }}
                />
                {/* Content */}
                <div className="relative z-10 p-6">
                  <h3 className="text-white font-black text-[18px] leading-tight mb-1.5" style={{ letterSpacing: "-0.5px" }}>
                    {label}
                  </h3>
                  <p className="text-white/60 text-[13px] leading-relaxed mb-4">{desc}</p>
                  <div
                    className="inline-flex items-center gap-1.5 text-[13px] font-bold transition-gap"
                    style={{ color: "#fbbf24" }}
                  >
                    Ver proveedores
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CÓMO FUNCIONA — editorial photo + steps
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 px-8" style={{ background: "#f4f5f7" }}>
        <div className="max-w-[1200px] mx-auto grid grid-cols-[1.1fr_1fr] gap-16 items-center">

          {/* Left: large photo */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              height: 560,
              backgroundImage: `${DARK_OVERLAY.replace("180deg", "160deg")}, url(${P.steps})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}
          >
            <div
              className="absolute bottom-8 left-8 right-8 rounded-2xl px-6 py-5"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.14)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="text-white/50 text-[12px] uppercase tracking-[0.8px] mb-1">Eventos realizados</div>
              <div className="text-white font-black text-[32px] leading-none" style={{ letterSpacing: "-1px" }}>+15,000</div>
              <div className="text-white/40 text-[13px] mt-1">familias confían en Eventia</div>
            </div>
          </div>

          {/* Right: steps */}
          <div>
            <div className="text-[11px] font-bold tracking-[1.5px] uppercase mb-4" style={{ color: "#f39e10" }}>
              Proceso simple
            </div>
            <h2
              className="font-black leading-[1.05] mb-12"
              style={{ fontSize: "clamp(28px, 3.5vw, 46px)", color: "#111827", letterSpacing: "-1.5px" }}
            >
              Organiza tu evento<br />en 3 pasos.
            </h2>
            <div className="flex flex-col gap-0">
              {STEPS.map(({ n, title, desc }, i) => (
                <div
                  key={n}
                  className="flex gap-6 pb-10"
                  style={{ borderLeft: i < STEPS.length - 1 ? "2px solid #f3f4f6" : "2px solid transparent", marginLeft: 18 }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-black shrink-0 -ml-[19px]"
                    style={{
                      background: "linear-gradient(135deg, #f59e0b, #e88e00)",
                      color: "#fff",
                      boxShadow: "0 4px 16px rgba(243,158,16,0.35)",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="pt-1">
                    <div
                      className="text-[11px] font-bold tracking-[1px] uppercase mb-1"
                      style={{ color: "#f39e10" }}
                    >
                      Paso {n}
                    </div>
                    <h3 className="text-gray-900 font-black text-[18px] mb-2" style={{ letterSpacing: "-0.5px" }}>
                      {title}
                    </h3>
                    <p className="text-gray-500 text-[14px] leading-[1.75]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 rounded-full text-white font-bold text-[14px]"
              style={{
                padding: "14px 30px",
                marginLeft: 18,
                background: "linear-gradient(135deg, #f59e0b, #e88e00)",
                boxShadow: "0 6px 20px rgba(243,158,16,0.40)",
              }}
            >
              Empieza ahora
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          POR QUÉ EVENTIA — features + photo
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 px-8" style={{ background: "#fff" }}>
        <div className="max-w-[1200px] mx-auto grid grid-cols-[1fr_1.1fr] gap-16 items-center">

          {/* Left: features */}
          <div>
            <div className="text-[11px] font-bold tracking-[1.5px] uppercase mb-4" style={{ color: "#f39e10" }}>
              Por qué elegirnos
            </div>
            <h2
              className="font-black leading-[1.05] mb-12"
              style={{ fontSize: "clamp(28px, 3.5vw, 46px)", color: "#111827", letterSpacing: "-1.5px" }}
            >
              Diseñado para que<br />confíes en cada paso.
            </h2>
            <div className="flex flex-col gap-8">
              {FEATURES.map(({ Icon, title, desc, color }) => (
                <div key={title} className="flex gap-5 items-start">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}15`, border: `1.5px solid ${color}28` }}
                  >
                    <Icon size={20} style={{ color }} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-bold text-[16px] mb-1" style={{ letterSpacing: "-0.3px" }}>{title}</h3>
                    <p className="text-gray-500 text-[14px] leading-[1.75]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: photo collage */}
          <div className="grid grid-cols-2 gap-3" style={{ height: 560 }}>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundImage: `url(${P.about})`, backgroundSize: "cover", backgroundPosition: "center" }}
            />
            <div className="flex flex-col gap-3">
              <div
                className="rounded-2xl overflow-hidden flex-1"
                style={{ backgroundImage: `url(${P.venue})`, backgroundSize: "cover", backgroundPosition: "center" }}
              />
              <div
                className="rounded-2xl overflow-hidden flex-1"
                style={{ backgroundImage: `url(${P.music})`, backgroundSize: "cover", backgroundPosition: "center" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 px-8" style={{ background: "#0f0a02" }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-14">
            <div className="text-[11px] font-bold tracking-[1.5px] uppercase mb-4" style={{ color: "#f59e0b" }}>
              Testimonios
            </div>
            <h2
              className="font-black leading-[1.05] text-white max-w-[420px]"
              style={{ fontSize: "clamp(28px, 3.5vw, 46px)", letterSpacing: "-1.5px" }}
            >
              Lo que dicen nuestros usuarios.
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, quote, init, color }) => (
              <div
                key={name}
                className="rounded-2xl p-8 flex flex-col"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill="#f59e0b" stroke="none" />
                  ))}
                </div>
                <p className="text-white/70 text-[14px] leading-[1.85] mb-8 flex-1">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-[13px] shrink-0"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)` }}
                  >
                    {init}
                  </div>
                  <div>
                    <div className="text-white font-bold text-[14px]">{name}</div>
                    <div className="text-white/35 text-[12px]">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          PARA PROVEEDORES — full-bleed photo CTA
      ═══════════════════════════════════════════════════ */}
      <section
        className="relative flex items-center justify-between gap-12 overflow-hidden"
        style={{
          minHeight: 500,
          backgroundImage: `${DARKER_OVERLAY}, url(${P.provider})`,
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
          padding: "80px 80px",
        }}
      >
        <div className="max-w-[580px]">
          <div className="text-[11px] font-bold tracking-[1.5px] uppercase mb-5" style={{ color: "#fbbf24" }}>
            Para proveedores
          </div>
          <h2
            className="text-white font-black leading-[1.05] mb-6"
            style={{ fontSize: "clamp(28px, 4vw, 52px)", letterSpacing: "-2px" }}
          >
            ¿Quieres ofrecer tus<br />servicios para eventos?<br />
            <span style={{ color: "#f59e0b" }}>Únete a Eventia.</span>
          </h2>
          <p className="text-white/60 text-[15px] leading-[1.75] mb-10">
            Publica tus servicios, llega a cientos de clientes y gestiona tus reservas
            desde un panel profesional. Registro gratuito, aprobación en menos de 24 horas.
          </p>
          <Link
            href="/auth/registro?tipo=proveedor"
            className="inline-flex items-center gap-2.5 rounded-full text-white font-bold"
            style={{
              padding: "15px 36px",
              fontSize: 15,
              background: "linear-gradient(135deg, #f59e0b 0%, #e88e00 100%)",
              boxShadow: "0 8px 28px rgba(243,158,16,0.50)",
            }}
          >
            Registrar mi negocio
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Checklist card */}
        <div
          className="shrink-0 rounded-2xl p-8 min-w-[280px]"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.14)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="text-white/50 text-[12px] uppercase tracking-[0.8px] mb-5">Incluye</div>
          <div className="flex flex-col gap-4">
            {[
              "Registro 100% gratuito",
              "Panel de gestión profesional",
              "Acceso a clientes verificados",
              "Soporte dedicado 24/7",
              "Aprobación en menos de 24h",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(243,158,16,0.20)" }}
                >
                  <Check size={11} style={{ color: "#f59e0b" }} strokeWidth={3} />
                </div>
                <span className="text-white/75 text-[14px]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 px-8" style={{ background: "#f4f5f7" }}>
        <div className="max-w-[1100px] mx-auto grid grid-cols-[1fr_1.5fr] gap-20 items-start">

          {/* Left: heading */}
          <div className="sticky top-24">
            <div className="text-[11px] font-bold tracking-[1.5px] uppercase mb-4" style={{ color: "#f39e10" }}>
              Preguntas frecuentes
            </div>
            <h2
              className="font-black leading-[1.05] text-gray-900 mb-6"
              style={{ fontSize: "clamp(28px, 3vw, 42px)", letterSpacing: "-1.5px" }}
            >
              Todo lo que necesitas saber.
            </h2>
            <p className="text-gray-500 text-[14px] leading-[1.8]">
              ¿Tienes más preguntas? Escríbenos directamente y te respondemos en menos de 24 horas.
            </p>
          </div>

          {/* Right: accordion */}
          <div className="flex flex-col gap-3">
            {FAQS.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-2xl overflow-hidden"
                style={{ background: "#fff", border: "1px solid #e5e7eb" }}
              >
                <summary className="flex items-center justify-between px-7 py-5 cursor-pointer list-none select-none">
                  <span className="text-gray-900 font-bold text-[15px] pr-4" style={{ letterSpacing: "-0.3px" }}>{q}</span>
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-[18px] transition-transform duration-200 group-open:rotate-45"
                    style={{ background: "rgba(243,158,16,0.10)", color: "#f39e10" }}
                  >
                    +
                  </span>
                </summary>
                <div className="px-7 pb-6 pt-1">
                  <p className="text-gray-500 text-[14px] leading-[1.8]">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CTA FINAL
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 px-8" style={{ background: "#fff", borderTop: "1px solid #f3f4f6" }}>
        <div className="max-w-[680px] mx-auto text-center">
          <h2
            className="font-black text-gray-900 leading-[1.05] mb-5"
            style={{ fontSize: "clamp(30px, 4vw, 52px)", letterSpacing: "-2px" }}
          >
            Tu próximo evento empieza aquí.
          </h2>
          <p className="text-gray-500 text-[16px] leading-[1.75] mb-9 max-w-[440px] mx-auto">
            Crea tu cuenta gratis en menos de 2 minutos y accede a los mejores
            proveedores de eventos en Iquitos.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/auth"
              className="rounded-full text-white font-bold"
              style={{
                padding: "15px 36px",
                fontSize: 15,
                background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
                boxShadow: "0 6px 24px rgba(243,158,16,0.40)",
              }}
            >
              Crear cuenta gratis
            </Link>
            <Link
              href="/catalogo"
              className="rounded-full font-semibold border-2 border-gray-200 text-gray-700"
              style={{ padding: "15px 32px", fontSize: 15 }}
            >
              Ver catálogo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
