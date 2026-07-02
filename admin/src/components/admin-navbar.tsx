"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FileText } from "lucide-react";

const NAV_ITEMS = [
  { href: "/proveedores", label: "Proveedores", Icon: LayoutGrid },
  { href: "/solicitudes", label: "Solicitudes",  Icon: FileText  },
];

export function AdminNavbar() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
              active
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Icon size={13} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
