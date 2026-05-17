"use client";

import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-[300] h-[60px] bg-white border-b border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex items-center">
      {/* Logo zone — aligned with sidebar width */}
      <div className="w-[210px] shrink-0 flex items-center px-3 border-r border-gray-100 h-full">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Eventia"
            width={120}
            height={40}
            style={{ width: "auto", height: "40px" }}
            priority
          />
        </Link>
      </div>

      {/* Right links */}
      <div className="flex-1 flex items-center justify-end gap-1 px-6">
        {[
          { label: "Registra tu servicio", href: "/proveedor" },
          { label: "Ayuda", href: "/" },
          { label: "Mis reservas", href: "/cliente" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="text-gray-500 text-[13px] font-medium px-3 py-1.5 rounded-md hover:text-[#f39e10] transition-colors"
          >
            {item.label}
          </Link>
        ))}

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <Link
          href="/cliente"
          className="bg-[#f39e10] hover:bg-[#d4870e] text-white rounded-lg px-4 py-2 text-[13px] font-bold transition-colors"
        >
          Iniciar sesión / Crear cuenta
        </Link>
      </div>
    </header>
  );
}
