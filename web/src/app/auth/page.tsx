"use client";

import Link from "next/link";
import { PartyPopper, Building2, ChevronRight } from "lucide-react";

const ROLES = [
  {
    icon: PartyPopper,
    title: "Organizo un evento",
    desc: "Encuentra y reserva locales, fotógrafos, música y decoración para tu quinceaños, boda o graduación.",
    href: "/auth/registro?tipo=cliente",
    accent: "#3b82f6",
    bg: "rgba(59,130,246,0.06)",
    border: "rgba(59,130,246,0.18)",
    hoverBorder: "#3b82f6",
  },
  {
    icon: Building2,
    title: "Ofrezco servicios",
    desc: "Publica tus servicios de eventos, gestiona reservas y haz crecer tu negocio en todo el Perú.",
    href: "/auth/registro?tipo=proveedor",
    accent: "#f39e10",
    bg: "rgba(243,158,16,0.06)",
    border: "rgba(243,158,16,0.18)",
    hoverBorder: "#f39e10",
  },
];

export default function AuthPage() {
  return (
    <div className="w-full max-w-[420px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 text-[28px] font-black tracking-[-0.5px] mb-2">
          Únete a Eventia
        </h1>
        <p className="text-gray-500 text-[15px]">
          ¿Cómo vas a usar la plataforma?
        </p>
      </div>

      {/* Role cards */}
      <div className="flex flex-col gap-3 mb-7">
        {ROLES.map(({ icon: Icon, title, desc, href, accent, bg, border }) => (
          <Link
            key={title}
            href={href}
            className="group flex items-center gap-4 rounded-2xl p-5 border-2 transition-all duration-200"
            style={{ background: bg, borderColor: border }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = accent)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = border)}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
              style={{ background: bg, border: `1.5px solid ${border}` }}
            >
              <Icon size={22} style={{ color: accent }} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-gray-900 font-bold text-[15px] mb-0.5">{title}</div>
              <div className="text-gray-500 text-[12px] leading-relaxed">{desc}</div>
            </div>
            <ChevronRight
              size={18}
              className="shrink-0 text-gray-300 transition-all duration-200 group-hover:translate-x-0.5"
              style={{ color: accent }}
            />
          </Link>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-gray-400 text-[12px]">¿Ya tienes cuenta?</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Login link */}
      <Link
        href="/auth/login"
        className="flex items-center justify-center w-full border-2 border-gray-200 rounded-2xl py-3.5 text-gray-700 text-[14px] font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
      >
        Iniciar sesión
      </Link>

      <p className="text-center text-gray-400 text-[12px] mt-6 leading-relaxed">
        Al continuar aceptas nuestros{" "}
        <span className="text-[#f39e10] cursor-pointer hover:underline">Términos de servicio</span>
        {" "}y{" "}
        <span className="text-[#f39e10] cursor-pointer hover:underline">Política de privacidad</span>.
      </p>
    </div>
  );
}
