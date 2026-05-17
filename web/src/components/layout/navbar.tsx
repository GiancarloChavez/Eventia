"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Building2, Camera, Music, Sparkles, Tag, Map, Briefcase } from "lucide-react";

const NAV_ITEMS = [
  { label: "Inicio",      href: "/",                              icon: Home,      key: "home" },
  { label: "Locales",     href: "/catalogo?category=local",       icon: Building2, key: "locales" },
  { label: "Fotografía",  href: "/catalogo?category=fotografia",  icon: Camera,    key: "fotografia" },
  { label: "Música",      href: "/catalogo?category=musica",      icon: Music,     key: "musica" },
  { label: "Decoración",  href: "/catalogo?category=decoracion",  icon: Sparkles,  key: "decoracion" },
  { label: "Ofertas",     href: "/catalogo",                      icon: Tag,       key: "ofertas" },
  { label: "Explorar",    href: "/",                              icon: Map,       key: "mapa" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Home at top → dark transparent; everywhere else → consistent glass
  const heroMode = !scrolled && (isHome || pathname.startsWith("/catalogo"));

  const activeKey =
    pathname === "/" ? "home"
    : pathname.startsWith("/catalogo") ? "ofertas"
    : pathname.split("/")[1] || "home";

  return (
    <header
      className="fixed top-0 inset-x-0 z-[300] transition-all duration-500"
      style={{
        height: 72,
        background: heroMode
          ? "linear-gradient(180deg, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.22) 70%, rgba(0,0,0,0) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(255,252,240,0.88) 100%)",
        backdropFilter: heroMode ? "none" : "blur(28px) saturate(200%)",
        WebkitBackdropFilter: heroMode ? "none" : "blur(28px) saturate(200%)",
        boxShadow: heroMode
          ? "none"
          : "0 1px 0 rgba(243,158,16,0.1), 0 8px 32px rgba(0,0,0,0.06)",
        borderBottom: heroMode ? "none" : "1px solid rgba(243,158,16,0.1)",
      }}
    >
      <div className="h-full flex items-stretch px-8 gap-1 max-w-[1440px] mx-auto">

        {/* Logo — tamaño aumentado */}
        <Link href="/" className="shrink-0 flex items-center mr-6">
          <Image
            src={heroMode ? "/logo-white.png" : "/logo.png"}
            alt="Eventia"
            width={200}
            height={64}
            style={{ width: "auto", height: "54px" }}
            priority
          />
        </Link>

        {/* Nav — items stretch full navbar height → underline llega al borde */}
        <nav className="flex items-stretch flex-1 gap-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon, key }) => {
            const isActive = activeKey === key;
            return (
              <Link
                key={key}
                href={href}
                className="relative flex items-center gap-1.5 px-4 text-[13px] transition-all duration-200 whitespace-nowrap rounded-none group"
                style={{
                  color: isActive
                    ? "#f39e10"
                    : heroMode
                    ? "rgba(255,255,255,0.85)"
                    : "#6b7280",
                  fontWeight: isActive ? 700 : 400,
                  background: "transparent",
                }}
              >
                <Icon
                  size={14}
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
                {label}

                {/* Barra activa — borde inferior estilo Trip.com */}
                <span
                  className="absolute inset-x-0 bottom-0 transition-all duration-300"
                  style={{
                    height: 3,
                    borderRadius: "3px 3px 0 0",
                    background: isActive ? "#f39e10" : "transparent",
                    boxShadow: isActive ? "0 -1px 8px rgba(243,158,16,0.5)" : "none",
                    transform: isActive ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "center",
                  }}
                />

                {/* Hover bg sutil */}
                <span
                  className="absolute inset-0 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  style={{ background: "rgba(243,158,16,0.06)" }}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0 pl-2">
          <Link
            href="/proveedor"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 whitespace-nowrap hover:bg-[rgba(243,158,16,0.06)]"
            style={{ color: heroMode ? "rgba(255,255,255,0.82)" : "#6b7280" }}
          >
            <Briefcase size={14} strokeWidth={1.6} />
            Para proveedores
          </Link>

          <Link
            href="/cliente"
            className="px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 whitespace-nowrap hover:bg-[rgba(243,158,16,0.06)]"
            style={{ color: heroMode ? "rgba(255,255,255,0.82)" : "#6b7280" }}
          >
            Mis reservas
          </Link>

          <Link
            href="/cliente"
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold text-white transition-all duration-200 ml-2"
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
              boxShadow: "0 4px 20px rgba(243,158,16,0.45), inset 0 1px 0 rgba(255,255,255,0.22)",
            }}
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </header>
  );
}
