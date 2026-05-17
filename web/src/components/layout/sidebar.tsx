"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Home,
  Building2,
  Camera,
  Music,
  Sparkles,
  Tag,
  Map,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { id: "home", label: "Inicio", href: "/", icon: Home },
  { id: "local", label: "Locales", href: "/catalogo?category=local", icon: Building2 },
  { id: "fotografia", label: "Fotografía", href: "/catalogo?category=fotografia", icon: Camera },
  { id: "musica", label: "Música", href: "/catalogo?category=musica", icon: Music },
  { id: "decoracion", label: "Decoración", href: "/catalogo?category=decoracion", icon: Sparkles },
  null,
  { id: "ofertas", label: "Ofertas", href: "/catalogo", icon: Tag },
  { id: "mapa", label: "Explorar mapa", href: "/", icon: Map },
  { id: "proveedor", label: "Para proveedores", href: "/proveedor", icon: Briefcase },
];

export function Sidebar({ activePage }: { activePage: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  function isActive(item: (typeof ITEMS)[number]) {
    if (!item) return false;
    if (item.id === "home") return pathname === "/";
    if (item.id === "proveedor") return pathname === "/proveedor";
    if (["local", "fotografia", "musica", "decoracion"].includes(item.id)) {
      return pathname === "/catalogo" && category === item.id;
    }
    if (item.id === "ofertas") return pathname === "/catalogo" && !category;
    return false;
  }

  return (
    <aside className="fixed top-[60px] left-0 bottom-0 w-[210px] bg-white border-r border-gray-100 py-3 px-2.5 overflow-y-auto z-[200]">
      <nav className="flex flex-col gap-0.5">
        {ITEMS.map((item, i) =>
          item === null ? (
            <div key={i} className="h-px bg-gray-100 my-2 mx-1" />
          ) : (
            <SidebarItem key={item.id} item={item} active={isActive(item)} />
          )
        )}
      </nav>
    </aside>
  );
}

function SidebarItem({
  item,
  active,
}: {
  item: { id: string; label: string; href: string; icon: React.ElementType };
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-[14px] transition-all",
        active
          ? "bg-[rgba(243,158,16,0.08)] text-[#f39e10] font-semibold"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-normal"
      )}
    >
      <Icon
        size={18}
        className={active ? "text-[#f39e10]" : "text-gray-400"}
        strokeWidth={1.8}
      />
      <span className="flex-1">{item.label}</span>
      {active && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#f39e10]" />
      )}
    </Link>
  );
}
