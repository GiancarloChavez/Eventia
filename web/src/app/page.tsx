import Link from "next/link";
import Image from "next/image";
import {
  Building2, Camera, Music, Sparkles,
  ShieldCheck, Star, Zap, HeadphonesIcon,
  Check, ArrowRight, ChevronRight,
  MapPin, Users, CalendarDays,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";

// ── Data ─────────────────────────────────────────────────────

const CATEGORIES = [
  {
    Icon: Building2,
    label: "Locales y salones",
    desc: "Salones de fiestas, jardines y centros de eventos para bodas, quinceaños y graduaciones.",
    href: "/catalogo?category=local",
    color: "#f39e10",
    bg: "rgba(243,158,16,0.08)",
    border: "rgba(243,158,16,0.18)",
  },
  {
    Icon: Camera,
    label: "Fotografía y video",
    desc: "Fotógrafos y videógrafos profesionales que capturan cada momento especial.",
    href: "/catalogo?category=fotografia",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.18)",
  },
  {
    Icon: Music,
    label: "Música y DJ",
    desc: "DJs, orquestas, grupos musicales y artistas para animar cualquier celebración.",
    href: "/catalogo?category=musica",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.18)",
  },
  {
    Icon: Sparkles,
    label: "Decoración",
    desc: "Decoradores que transforman espacios en ambientes únicos y memorables.",
    href: "/catalogo?category=decoracion",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.08)",
    border: "rgba(236,72,153,0.18)",
  },
];

const STEPS = [
  {
    n: "01",
    Icon: MapPin,
    title: "Busca en tu ciudad",
    desc: "Explora cientos de proveedores verificados en Iquitos. Filtra por categoría, precio y disponibilidad según tu presupuesto.",
  },
  {
    n: "02",
    Icon: Users,
    title: "Compara y cotiza",
    desc: "Revisa perfiles completos, fotos reales y precios. Solicita cotizaciones personalizadas directamente al proveedor.",
  },
  {
    n: "03",
    Icon: CalendarDays,
    title: "Reserva con seguridad",
    desc: "Confirma tu reserva con pago 100% seguro. Recibe confirmación inmediata y soporte durante todo el proceso.",
  },
];

const FEATURES = [
  {
    Icon: ShieldCheck,
    title: "Proveedores verificados",
    desc: "Cada proveedor pasa por un proceso de verificación de documentos e identidad antes de aparecer en el catálogo.",
    color: "#16a34a",
  },
  {
    Icon: Star,
    title: "Sin intermediarios",
    desc: "Precios directos entre cliente y proveedor. Sin comisiones ocultas ni sorpresas en tu factura final.",
    color: "#f39e10",
  },
  {
    Icon: Zap,
    title: "Reserva en minutos",
    desc: "Proceso simplificado. Desde buscar hasta confirmar tu evento puede tomar menos de 10 minutos.",
    color: "#3b82f6",
  },
  {
    Icon: HeadphonesIcon,
    title: "Soporte dedicado",
    desc: "Nuestro equipo está disponible para ayudarte en cada etapa de la planificación de tu evento.",
    color: "#8b5cf6",
  },
];

const STATS = [
  { val: "+2,400", lbl: "Proveedores registrados" },
  { val: "+15K",   lbl: "Eventos organizados"    },
  { val: "4.8 ★",  lbl: "Valoración promedio"    },
  { val: "100%",   lbl: "Pagos seguros"           },
];

const TESTIMONIALS = [
  {
    name: "Sofía Ramírez",
    role: "Quinceaños de su hija",
    text: "Encontré el salón perfecto en menos de 20 minutos. Todo el proceso fue transparente y el proveedor muy profesional. ¡Lo recomiendo a todas las mamás!",
    initials: "SR",
    color: "#f39e10",
  },
  {
    name: "Carlos Mendoza",
    role: "Boda en Iquitos",
    text: "Contratamos fotógrafo, decoración y DJ desde Eventia. Coordinarlo todo desde una sola plataforma fue increíble. El día fue perfecto.",
    initials: "CM",
    color: "#3b82f6",
  },
  {
    name: "Lucía Torres",
    role: "Graduación universitaria",
    text: "La variedad de proveedores es impresionante. Pude comparar precios y elegir lo que se ajustaba a mi presupuesto sin presión de nadie.",
    initials: "LT",
    color: "#8b5cf6",
  },
];

const FAQS = [
  {
    q: "¿Qué es Eventia?",
    a: "Eventia es el marketplace de servicios para eventos sociales en Iquitos, Perú. Conectamos a personas que organizan eventos —bodas, quinceaños, graduaciones— con los mejores proveedores locales verificados.",
  },
  {
    q: "¿Cómo sé que los proveedores son confiables?",
    a: "Todos los proveedores pasan por un proceso de verificación de documentos e identidad antes de ser aprobados. Además, puedes ver reseñas reales de otros clientes en cada perfil.",
  },
  {
    q: "¿Cuánto cuesta usar Eventia?",
    a: "Registrarte y explorar el catálogo es completamente gratis. Solo pagas cuando decides reservar un servicio, y el precio es exactamente el que acuerdas con el proveedor.",
  },
  {
    q: "¿Puedo cancelar una reserva?",
    a: "Sí. Las reservas pueden cancelarse gratuitamente hasta 7 días antes del evento. Las condiciones específicas pueden variar según el proveedor.",
  },
];

// ── Page ─────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="bg-white">

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative flex flex-col items-center justify-center"
        style={{
          minHeight: "96vh",
          backgroundImage: [
            "linear-gradient(180deg,",
            "  rgba(0,0,0,0.55) 0%,",
            "  rgba(0,0,0,0.30) 45%,",
            "  rgba(0,0,0,0.65) 100%",
            "), url('/hero.jpg')",
          ].join(""),
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          paddingTop: 100,
          paddingLeft: 40,
          paddingRight: 40,
          paddingBottom: 60,
        }}
      >
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 text-[13px] font-semibold"
          style={{
            background: "rgba(243,158,16,0.20)",
            border: "1px solid rgba(243,158,16,0.45)",
            color: "#fbbf24",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]" />
          Marketplace de eventos en Iquitos, Perú
        </div>

        {/* Headline */}
        <h1
          className="text-white font-black text-center leading-[1.05] tracking-[-2px] mb-5 max-w-[760px]"
          style={{ fontSize: "clamp(40px, 5.5vw, 68px)", textShadow: "0 2px 24px rgba(0,0,0,0.35)" }}
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

        <p className="text-white/75 text-[18px] text-center max-w-[560px] leading-relaxed mb-10">
          Encuentra, compara y contrata los mejores proveedores de eventos para tu
          quinceaños, boda o graduación — todo verificado y en un solo clic.
        </p>

        {/* CTAs */}
        <div className="flex gap-3 flex-wrap justify-center mb-12">
          <Link
            href="/catalogo"
            className="flex items-center gap-2.5 px-8 py-4 rounded-full text-[16px] font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
              boxShadow: "0 6px 28px rgba(243,158,16,0.55), inset 0 1px 0 rgba(255,255,255,0.22)",
            }}
          >
            Explorar servicios
            <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
          <Link
            href="/auth/registro?tipo=proveedor"
            className="flex items-center gap-2 px-8 py-4 rounded-full text-[16px] font-semibold text-white"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1.5px solid rgba(255,255,255,0.35)",
              backdropFilter: "blur(8px)",
            }}
          >
            Soy proveedor
            <ChevronRight size={18} />
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex gap-7 flex-wrap justify-center">
          {[
            { dot: "#4ade80", label: "Pago 100% seguro" },
            { dot: "#f59e0b", label: "Proveedores verificados" },
            { dot: "#60a5fa", label: "Soporte 24/7" },
          ].map(({ dot, label }) => (
            <div key={label} className="flex items-center gap-2 text-white/70 text-[13px]">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1100px] mx-auto px-8 py-7 grid grid-cols-4 gap-6">
          {STATS.map(({ val, lbl }) => (
            <div key={lbl} className="text-center">
              <div
                className="text-[32px] font-black leading-none mb-1"
                style={{ color: "#f39e10" }}
              >
                {val}
              </div>
              <div className="text-gray-500 text-[13px]">{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          QUÉ ES EVENTIA
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-8 bg-[#f4f5f7]">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 gap-16 items-center">

            {/* Text */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-[12px] font-bold uppercase tracking-[0.6px]"
                style={{ background: "rgba(243,158,16,0.10)", color: "#f39e10" }}
              >
                Quiénes somos
              </div>
              <h2 className="text-gray-900 text-[38px] font-black leading-[1.1] tracking-[-1px] mb-5">
                El marketplace que{" "}
                <span style={{ color: "#f39e10" }}>conecta</span> a las familias con
                los mejores proveedores
              </h2>
              <p className="text-gray-500 text-[16px] leading-[1.8] mb-6">
                Eventia nació en Iquitos con una misión clara: hacer que organizar
                un evento sea fácil, seguro y accesible para todos. Somos el punto de
                encuentro entre quienes celebran la vida y quienes hacen que esas
                celebraciones sean inolvidables.
              </p>
              <p className="text-gray-500 text-[16px] leading-[1.8] mb-8">
                Contamos con cientos de proveedores locales verificados —salones,
                fotógrafos, músicos y decoradores— listos para hacer realidad el
                evento que siempre soñaste.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  "Proveedores con identidad y documentos verificados",
                  "Precios transparentes, sin comisiones ocultas",
                  "Proceso de reserva 100% digital y seguro",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "rgba(243,158,16,0.15)" }}
                    >
                      <Check size={11} style={{ color: "#f39e10" }} strokeWidth={3} />
                    </div>
                    <span className="text-gray-700 text-[14px]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Image placeholder */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ aspectRatio: "4/3", background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)" }}
            >
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-10">
                <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
                  {[Building2, Camera, Music, Sparkles].map((Icon, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(243,158,16,0.15)", border: "1.5px solid rgba(243,158,16,0.25)" }}
                    >
                      <Icon size={32} style={{ color: "#f39e10" }} strokeWidth={1.4} />
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <div className="text-[#92400e] font-black text-[20px]">Todo en un lugar</div>
                  <div className="text-[#b45309] text-[13px] mt-1">Locales · Foto · Música · Deco</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CATEGORÍAS
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-[12px] font-bold uppercase tracking-[0.6px]"
              style={{ background: "rgba(243,158,16,0.10)", color: "#f39e10" }}
            >
              Nuestros servicios
            </div>
            <h2 className="text-gray-900 text-[38px] font-black tracking-[-1px] mb-3">
              Encuentra todo lo que necesitas
            </h2>
            <p className="text-gray-500 text-[16px] max-w-[500px] mx-auto leading-relaxed">
              Desde el salón hasta la decoración — contrata cada servicio por separado
              o combínalos para un paquete completo.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {CATEGORIES.map(({ Icon, label, desc, href, color, bg, border }) => (
              <Link
                key={label}
                href={href}
                className="group flex flex-col rounded-2xl p-6 border-2 transition-all duration-200"
                style={{ background: bg, borderColor: border }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110"
                  style={{ background: bg, border: `1.5px solid ${border}` }}
                >
                  <Icon size={22} style={{ color }} strokeWidth={1.8} />
                </div>
                <div className="text-gray-900 font-bold text-[15px] mb-1.5">{label}</div>
                <p className="text-gray-500 text-[13px] leading-relaxed flex-1">{desc}</p>
                <div
                  className="flex items-center gap-1 mt-4 text-[13px] font-semibold transition-gap duration-200"
                  style={{ color }}
                >
                  Ver proveedores
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CÓMO FUNCIONA
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-8 bg-[#f4f5f7]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-[12px] font-bold uppercase tracking-[0.6px]"
              style={{ background: "rgba(243,158,16,0.10)", color: "#f39e10" }}
            >
              Proceso simple
            </div>
            <h2 className="text-gray-900 text-[38px] font-black tracking-[-1px] mb-3">
              Organiza tu evento en 3 pasos
            </h2>
            <p className="text-gray-500 text-[16px] max-w-[460px] mx-auto leading-relaxed">
              Sin complicaciones ni llamadas interminables. Todo desde tu computadora o celular.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 relative">
            {/* Connecting line */}
            <div
              className="absolute top-[52px] left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-px hidden md:block"
              style={{ background: "repeating-linear-gradient(90deg, #f39e10 0, #f39e10 6px, transparent 6px, transparent 16px)" }}
            />

            {STEPS.map(({ n, Icon, title, desc }) => (
              <div key={n} className="flex flex-col items-center text-center relative">
                <div
                  className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center mb-6 relative z-10"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b 0%, #e88e00 100%)",
                    boxShadow: "0 8px 24px rgba(243,158,16,0.35)",
                  }}
                >
                  <Icon size={28} color="#fff" strokeWidth={1.8} />
                </div>
                <div
                  className="text-[11px] font-black tracking-[1px] mb-2 uppercase"
                  style={{ color: "#f39e10" }}
                >
                  Paso {n}
                </div>
                <h3 className="text-gray-900 text-[18px] font-black mb-3">{title}</h3>
                <p className="text-gray-500 text-[14px] leading-[1.8]">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[15px] font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
                boxShadow: "0 4px 20px rgba(243,158,16,0.4)",
              }}
            >
              Empieza a buscar ahora
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          POR QUÉ EVENTIA
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-[12px] font-bold uppercase tracking-[0.6px]"
              style={{ background: "rgba(243,158,16,0.10)", color: "#f39e10" }}
            >
              Nuestra propuesta de valor
            </div>
            <h2 className="text-gray-900 text-[38px] font-black tracking-[-1px] mb-3">
              ¿Por qué elegir Eventia?
            </h2>
            <p className="text-gray-500 text-[16px] max-w-[480px] mx-auto leading-relaxed">
              Diseñamos cada detalle para que organizar tu evento sea una experiencia tranquila, no estresante.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-5">
            {FEATURES.map(({ Icon, title, desc, color }) => (
              <div
                key={title}
                className="rounded-2xl p-6 border border-gray-100"
                style={{ background: "#fafafa" }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${color}18`, border: `1.5px solid ${color}30` }}
                >
                  <Icon size={20} style={{ color }} strokeWidth={1.8} />
                </div>
                <h3 className="text-gray-900 font-bold text-[15px] mb-2">{title}</h3>
                <p className="text-gray-500 text-[13px] leading-[1.8]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-8 bg-[#f4f5f7]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-[12px] font-bold uppercase tracking-[0.6px]"
              style={{ background: "rgba(243,158,16,0.10)", color: "#f39e10" }}
            >
              Testimonios
            </div>
            <h2 className="text-gray-900 text-[38px] font-black tracking-[-1px] mb-3">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-gray-500 text-[16px] max-w-[440px] mx-auto leading-relaxed">
              Familias reales de Iquitos que confiaron en Eventia para sus celebraciones más importantes.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, text, initials, color }) => (
              <div
                key={name}
                className="bg-white rounded-2xl p-7 border border-gray-100"
                style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#f59e0b" stroke="none" />
                  ))}
                </div>
                <p className="text-gray-700 text-[14px] leading-[1.8] mb-6">
                  &ldquo;{text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-[14px] shrink-0"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div className="text-gray-900 font-bold text-[14px]">{name}</div>
                    <div className="text-gray-400 text-[12px]">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PARA PROVEEDORES
      ══════════════════════════════════════════════════════ */}
      <section
        className="py-20 px-8"
        style={{
          background: "linear-gradient(135deg, #1c1208 0%, #2d1f05 40%, #1a0f02 100%)",
        }}
      >
        <div className="max-w-[900px] mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 text-[12px] font-bold uppercase tracking-[0.6px]"
            style={{ background: "rgba(243,158,16,0.15)", color: "#fbbf24" }}
          >
            Para proveedores
          </div>
          <h2
            className="font-black text-center leading-[1.1] tracking-[-1.5px] mb-5"
            style={{ fontSize: "clamp(28px, 4vw, 48px)", color: "#fff" }}
          >
            ¿Tienes un negocio de eventos?
            <br />
            <span style={{ color: "#f39e10" }}>Únete a Eventia y crece.</span>
          </h2>
          <p className="text-white/60 text-[16px] leading-relaxed max-w-[560px] mx-auto mb-10">
            Publica tus servicios, llega a cientos de clientes en Iquitos y gestiona tus
            reservas desde un solo panel. El registro es gratuito y la aprobación tarda menos de 24 horas.
          </p>

          <div className="flex flex-wrap gap-6 justify-center mb-10">
            {[
              "Sin costo de registro",
              "Panel de gestión incluido",
              "Clientes verificados",
              "Soporte dedicado a proveedores",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-white/75 text-[14px]">
                <Check size={14} style={{ color: "#f39e10" }} strokeWidth={2.5} />
                {item}
              </div>
            ))}
          </div>

          <Link
            href="/auth/registro?tipo=proveedor"
            className="inline-flex items-center gap-2.5 px-10 py-4 rounded-full text-[16px] font-bold"
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
              color: "#fff",
              boxShadow: "0 6px 28px rgba(243,158,16,0.5)",
            }}
          >
            Registrar mi negocio
            <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-[760px] mx-auto">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-[12px] font-bold uppercase tracking-[0.6px]"
              style={{ background: "rgba(243,158,16,0.10)", color: "#f39e10" }}
            >
              Preguntas frecuentes
            </div>
            <h2 className="text-gray-900 text-[38px] font-black tracking-[-1px]">
              ¿Tienes dudas?
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {FAQS.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-2xl border border-gray-100 overflow-hidden"
                style={{ background: "#fafafa" }}
              >
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none select-none">
                  <span className="text-gray-900 font-bold text-[15px] pr-4">{q}</span>
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[18px] font-bold transition-transform group-open:rotate-45"
                    style={{ background: "rgba(243,158,16,0.10)", color: "#f39e10" }}
                  >
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-gray-500 text-[14px] leading-[1.8]">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════════ */}
      <section
        className="py-20 px-8"
        style={{ background: "#f4f5f7", borderTop: "1px solid #e5e7eb" }}
      >
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="text-gray-900 text-[38px] font-black tracking-[-1px] mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-gray-500 text-[16px] leading-relaxed mb-9 max-w-[480px] mx-auto">
            Crea tu cuenta gratis en menos de 2 minutos y empieza a explorar los
            mejores proveedores de eventos en Iquitos.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/auth"
              className="px-8 py-4 rounded-full text-[15px] font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
                boxShadow: "0 4px 20px rgba(243,158,16,0.4)",
              }}
            >
              Crear cuenta gratis
            </Link>
            <Link
              href="/catalogo"
              className="px-8 py-4 rounded-full text-[15px] font-semibold border-2 border-gray-200 text-gray-700 hover:border-[#f39e10] hover:text-[#f39e10] transition-colors"
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
