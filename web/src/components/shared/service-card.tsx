"use client";

import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import type { DbService } from "@/lib/data";
import { formatPrice } from "@/lib/data";

export function ServiceCard({ service }: { service: DbService }) {
  const sorted = [...service.images].sort((a, b) => a.display_order - b.display_order);
  const cover =
    sorted.find((i) => i.is_cover)?.url ??
    sorted[0]?.url ??
    "https://picsum.photos/seed/evdefault/800/520";

  const isVerified = service.provider?.status === "approved";

  return (
    <Link href={`/servicios/${service.id}`} className="block group">
      <div
        className="rounded-[22px] overflow-hidden flex flex-col bg-white"
        style={{
          boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
          transition: "transform 260ms ease, box-shadow 260ms ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 14px 40px rgba(0,0,0,0.14)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)";
        }}
      >
        {/* Photo */}
        <div className="relative overflow-hidden flex-shrink-0" style={{ height: 182 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={service.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.35) 100%)" }}
          />
          {sorted.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 items-center">
              {sorted.slice(0, 5).map((_, i) => (
                <span
                  key={i}
                  className="rounded-full"
                  style={{
                    width: i === 0 ? 14 : 5,
                    height: 5,
                    background: i === 0 ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.45)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 pt-3.5 pb-4 flex flex-col gap-2.5">

          {/* Title + price */}
          <div className="flex items-start gap-2">
            <h3 className="text-gray-900 font-bold leading-snug tracking-[-0.2px] flex-1" style={{ fontSize: 15 }}>
              {service.title}
            </h3>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-white font-bold whitespace-nowrap"
              style={{ background: "#f39e10", fontSize: 11, marginTop: 1 }}
            >
              {formatPrice(service.base_price)}
            </span>
          </div>

          {/* Description — 2 lines max */}
          <p
            className="text-gray-500"
            style={{
              fontSize: 12,
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {service.description ?? ""}
          </p>

          {/* Pills */}
          <div className="flex gap-1.5 flex-wrap">
            {service.location && (
              <span className="rounded-full px-2.5 py-1 text-gray-600 font-semibold" style={{ background: "#f3f4f6", fontSize: 11 }}>
                {service.location}
              </span>
            )}
            {isVerified && (
              <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-gray-600 font-semibold" style={{ background: "#f3f4f6", fontSize: 11 }}>
                <BadgeCheck size={10} style={{ color: "#f39e10" }} />
                Verificado
              </span>
            )}
            {service.category && (
              <span className="rounded-full px-2.5 py-1 text-gray-600 font-semibold" style={{ background: "#f3f4f6", fontSize: 11 }}>
                {service.category.name}
              </span>
            )}
          </div>

          {/* CTA */}
          <button
            className="w-full rounded-full py-2.5 font-bold border-none cursor-pointer transition-colors duration-200"
            style={{ background: "rgba(243,158,16,0.10)", color: "#f39e10", fontSize: 13 }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(243,158,16,0.18)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(243,158,16,0.10)")}
          >
            Reservar ahora
          </button>
        </div>
      </div>
    </Link>
  );
}
