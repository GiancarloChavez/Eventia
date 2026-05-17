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

  const transparent = isHome && !scrolled;

  const activeKey =
    pathname === "/" ? "home"
    : pathname.startsWith("/catalogo") ? "ofertas"
    : pathname.split("/")[1] || "home";

  return (
    <header
      className="fixed top-0 inset-x-0 z-[300] transition-all duration-500"
      style={{
        height: 68,
        background: transparent
          ? "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 70%, rgba(0,0,0,0) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(255,252,240,0.97) 100%)",
        backdropFilter: transparent ? "none" : "blur(24px) saturate(180%)",
        WebkitBackdropFilter: transparent ? "none" : "blur(24px) saturate(180%)",
        boxShadow: transparent
          ? "none"
          : "0 1px 0 rgba(243,158,16,0.1), 0 4px 32px rgba(0,0,0,0.07)",
        borderBottom: transparent ? "none" : "1px solid rgba(243,158,16,0.09)",
      }}
    >
      <div className="h-full flex items-center px-8 gap-2 max-w-[1440px] mx-auto">

        {/* Logo */}
        <Link href="/" className="shrink-0 mr-5">
          <Image
            src={transparent ? "/logo-white.png" : "/logo.png"}
            alt="Eventia"
            width={110}
            height={34}
            style={{ width: "auto", height: "32px" }}
            priority
          />
        </Link>

        {/* Nav items */}
        <nav className="flex items-center flex-1 gap-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon, key }) => {
            const isActive = activeKey === key;
            return (
              <Link
                key={key}
                href={href}
                className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] transition-all duration-200 whitespace-nowrap"
                style={{
                  background: isActive
                    ? "rgba(243,158,16,0.13)"
                    : "transparent",
                  color: isActive
                    ? "#f39e10"
                    : transparent
                    ? "rgba(255,255,255,0.88)"
                    : "#6b7280",
                  fontWeight: isActive ? 600 : 400,
                  border: isActive
                    ? "1px solid rgba(243,158,16,0.22)"
                    : "1px solid transparent",
                }}
              >
                <Icon
                  size={14}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  style={{ color: isActive ? "#f39e10" : "inherit" }}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href="/proveedor"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all duration-200 whitespace-nowrap"
            style={{ color: transparent ? "rgba(255,255,255,0.82)" : "#6b7280" }}
          >
            <Briefcase size={14} strokeWidth={1.6} />
            Para proveedores
          </Link>

          <Link
            href="/cliente"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all duration-200 whitespace-nowrap"
            style={{ color: transparent ? "rgba(255,255,255,0.82)" : "#6b7280" }}
          >
            Mis reservas
          </Link>

          <Link
            href="/cliente"
            className="flex items-center gap-2 rounded-full px-5 py-[9px] text-[13px] font-bold text-white transition-all duration-200 ml-2"
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
