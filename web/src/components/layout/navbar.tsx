"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Home, Building2, Camera, Music, Sparkles, Briefcase, LogOut, LayoutDashboard } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

const NAV_ITEMS = [
  { label: "Inicio",      href: "/",                              icon: Home,      key: "home" },
  { label: "Locales",     href: "/catalogo?category=local",       icon: Building2, key: "local" },
  { label: "Fotografía",  href: "/catalogo?category=fotografia",  icon: Camera,    key: "fotografia" },
  { label: "Música",      href: "/catalogo?category=musica",      icon: Music,     key: "musica" },
  { label: "Decoración",  href: "/catalogo?category=decoracion",  icon: Sparkles,  key: "decoracion" },
];

function getInitials(name: string, email: string) {
  if (name) {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  return email[0].toUpperCase();
}

export function Navbar() {
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const router      = useRouter();
  const [scrolled,     setScrolled]     = useState(false);
  const [user,         setUser]         = useState<{ name: string; email: string; role: string } | null>(null);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isHome    = pathname === "/";
  const isCatalog = pathname.startsWith("/catalogo");

  useEffect(() => {
    setScrolled(window.scrollY > 60);
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [pathname]);

  // Auth state
  useEffect(() => {
    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({
          name:  session.user.user_metadata?.full_name ?? "",
          email: session.user.email ?? "",
          role:  session.user.user_metadata?.role ?? "client",
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        setUser({
          name:  session.user.user_metadata?.full_name ?? "",
          email: session.user.email ?? "",
          role:  session.user.user_metadata?.role ?? "client",
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await getSupabase().auth.signOut();
    router.push("/");
  };

  const heroMode = !scrolled && (isHome || isCatalog);

  const categoryParam = isCatalog ? (searchParams.get("category") ?? "") : "";
  const activeKey = isHome
    ? "home"
    : isCatalog
    ? (categoryParam || "")
    : pathname.split("/")[1] || "home";

  const dashboardHref = user?.role === "provider" ? "/proveedor" : "/cliente";

  return (
    <header
      className="fixed top-0 inset-x-0 z-[300]"
      style={{
        height: 72,
        background: heroMode
          ? "linear-gradient(180deg, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.24) 65%, rgba(0,0,0,0) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,252,240,0.92) 100%)",
        backdropFilter:       heroMode ? "none" : "blur(28px) saturate(200%)",
        WebkitBackdropFilter: heroMode ? "none" : "blur(28px) saturate(200%)",
        boxShadow:   heroMode ? "none" : "0 1px 0 rgba(243,158,16,0.1), 0 8px 32px rgba(0,0,0,0.06)",
        borderBottom: heroMode ? "none" : "1px solid rgba(243,158,16,0.1)",
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
                  color: isActive ? "#f39e10" : heroMode ? "rgba(255,255,255,0.88)" : "#6b7280",
                  fontWeight: isActive ? 700 : 400,
                  background: "transparent",
                  transition: "color 200ms ease",
                }}
              >
                <Icon size={14} strokeWidth={isActive ? 2.2 : 1.6} style={{ transition: "stroke-width 200ms ease" }} />
                {label}
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
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  style={{ background: "rgba(243,158,16,0.06)", transition: "opacity 150ms ease" }}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0 pl-2">
          {user ? (
            /* ── Authenticated ── */
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full cursor-pointer border transition-all"
                style={{
                  background:   menuOpen ? "rgba(243,158,16,0.08)" : "transparent",
                  borderColor:  menuOpen ? "rgba(243,158,16,0.3)"  : heroMode ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.1)",
                }}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #e88e00)", color: "#fff" }}
                >
                  {getInitials(user.name, user.email)}
                </div>
                <span
                  className="text-[13px] font-medium max-w-[120px] truncate hidden sm:block"
                  style={{ color: heroMode ? "rgba(255,255,255,0.9)" : "#374151" }}
                >
                  {user.name || user.email}
                </span>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-[200px] rounded-2xl border bg-white py-1.5 shadow-xl"
                  style={{ borderColor: "#e5e7eb", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
                >
                  <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                    <div className="text-gray-900 text-[13px] font-semibold truncate">{user.name || "Mi cuenta"}</div>
                    <div className="text-gray-400 text-[11px] truncate">{user.email}</div>
                  </div>

                  <Link
                    href={dashboardHref}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LayoutDashboard size={14} className="text-gray-400" />
                    Mi panel
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-none"
                  >
                    <LogOut size={14} />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Guest ── */
            <>
              <Link
                href="/auth/registro?tipo=proveedor"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap"
                style={{ color: heroMode ? "rgba(255,255,255,0.82)" : "#6b7280", transition: "color 200ms ease" }}
              >
                <Briefcase size={14} strokeWidth={1.6} />
                Para proveedores
              </Link>

              <Link
                href="/auth/login"
                className="px-3.5 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap"
                style={{ color: heroMode ? "rgba(255,255,255,0.82)" : "#6b7280", transition: "color 200ms ease" }}
              >
                Iniciar sesión
              </Link>

              <Link
                href="/auth"
                className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold text-white ml-2"
                style={{
                  background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
                  boxShadow: "0 4px 20px rgba(243,158,16,0.45), inset 0 1px 0 rgba(255,255,255,0.22)",
                }}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
