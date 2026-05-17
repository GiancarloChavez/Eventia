"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Building2, Camera, Music, Sparkles, Briefcase } from "lucide-react";

const NAV_ITEMS = [
  { label: "Inicio",      href: "/",                              icon: Home,      key: "home" },
  { label: "Locales",     href: "/catalogo?category=local",       icon: Building2, key: "local" },
  { label: "Fotografía",  href: "/catalogo?category=fotografia",  icon: Camera,    key: "fotografia" },
  { label: "Música",      href: "/catalogo?category=musica",      icon: Music,     key: "musica" },
  { label: "Decoración",  href: "/catalogo?category=decoracion",  icon: Sparkles,  key: "decoracion" },
];

export function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);

  const isHome    = pathname === "/";
  const isCatalog = pathname.startsWith("/catalogo");

  // Reset scroll state on every navigation so heroMode snaps immediately
  useEffect(() => {
    setScrolled(window.scrollY > 60);
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [pathname]);

  const heroMode = !scrolled && (isHome || isCatalog);

  // Derive active key: for catalog pages read the category param
  const categoryParam = isCatalog ? (searchParams.get("category") ?? "") : "";
  const activeKey = isHome
    ? "home"
    : isCatalog
    ? (categoryParam || "")
    : pathname.split("/")[1] || "home";

  return (
    <header
      className="fixed top-0 inset-x-0 z-[300]"
      style={{
        height: 72,
        background: heroMode
          ? "linear-gradient(180deg, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.24) 65%, rgba(0,0,0,0) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,252,240,0.92) 100%)",
        backdropFilter: heroMode ? "none" : "blur(28px) saturate(200%)",
        WebkitBackdropFilter: heroMode ? "none" : "blur(28px) saturate(200%)",
        boxShadow: heroMode
          ? "none"
          : "0 1px 0 rgba(243,158,16,0.1), 0 8px 32px rgba(0,0,0,0.06)",
        borderBottom: heroMode ? "none" : "1px solid rgba(243,158,16,0.1)",
        // Only animate background + shadow — NOT backdrop-filter (causes flicker)
        transition: "background 350ms ease, box-shadow 350ms ease, border-color 350ms ease",
      }}
    >
      <div className="h-full flex items-stretch px-8 gap-1 max-w-[1440px] mx-auto">

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center mr-6">
          <Image
            src={heroMode ? "/logo-white.png" : "/logo.png"}
            alt="Eventia"
            width={220}
            height={72}
            style={{ width: "auto", height: "60px" }}
            priority
          />
        </Link>

        {/* Nav items */}
        <nav className="flex items-stretch flex-1 gap-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon, key }) => {
            const isActive = activeKey === key;
            return (
              <Link
                key={key}
                href={href}
                className="relative flex items-center gap-1.5 px-4 text-[13px] whitespace-nowrap rounded-none group"
                style={{
                  color: isActive
                    ? "#f39e10"
                    : heroMode
                    ? "rgba(255,255,255,0.88)"
                    : "#6b7280",
                  fontWeight: isActive ? 700 : 400,
                  background: "transparent",
                  transition: "color 200ms ease",
                }}
              >
                <Icon
                  size={14}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  style={{ transition: "stroke-width 200ms ease" }}
                />
                {label}

                {/* Active underline — Trip.com style */}
                <span
                  className="absolute inset-x-0 bottom-0"
                  style={{
                    height: 3,
                    borderRadius: "3px 3px 0 0",
                    background: "#f39e10",
                    boxShadow: isActive ? "0 -1px 8px rgba(243,158,16,0.5)" : "none",
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? "scaleX(1)" : "scaleX(0.4)",
                    transformOrigin: "center",
                    transition: "opacity 220ms ease, transform 220ms ease",
                  }}
                />

                {/* Hover bg */}
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  style={{
                    background: "rgba(243,158,16,0.06)",
                    transition: "opacity 150ms ease",
                  }}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0 pl-2">
          <Link
            href="/proveedor"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap"
            style={{
              color: heroMode ? "rgba(255,255,255,0.82)" : "#6b7280",
              transition: "color 200ms ease, background 150ms ease",
            }}
          >
            <Briefcase size={14} strokeWidth={1.6} />
            Para proveedores
          </Link>

          <Link
            href="/cliente"
            className="px-3.5 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap"
            style={{
              color: heroMode ? "rgba(255,255,255,0.82)" : "#6b7280",
              transition: "color 200ms ease, background 150ms ease",
            }}
          >
            Mis reservas
          </Link>

          <Link
            href="/cliente"
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold text-white ml-2"
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
