"use client";

import Link from "next/link";
import { Star, MapPin, BadgeCheck } from "lucide-react";
import type { Service } from "@/lib/data";
import { formatPrice } from "@/lib/data";

const CARD_BG = "#141414";
const GRADIENT = "linear-gradient(to bottom, transparent 28%, rgba(20,20,20,0.72) 56%, #141414 100%)";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href={`/servicios/${service.id}`} className="block group">
      <div
        className="rounded-[22px] overflow-hidden flex flex-col"
        style={{
          background: CARD_BG,
          boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
          transition: "transform 280ms ease, box-shadow 280ms ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.5)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.35)";
        }}
      >
        {/* Photo */}
        <div className="relative overflow-hidden flex-shrink-0" style={{ height: 224 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={service.images[0]}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
          />
          {/* Gradient: transparent → card background */}
          <div className="absolute inset-0" style={{ background: GRADIENT }} />
        </div>

        {/* Content — negative margin pulls text into gradient zone */}
        <div className="px-5 pb-5 -mt-12 relative z-10 flex flex-col gap-3">
          {/* Title */}
          <h3 className="text-white font-bold leading-snug tracking-[-0.3px]" style={{ fontSize: 18 }}>
            {service.name}
          </h3>

          {/* Description */}
          <p
            className="text-white/55 leading-relaxed"
            style={{
              fontSize: 13,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {service.shortDesc}
          </p>

          {/* Pill tags */}
          <div className="flex gap-2 flex-wrap">
            {/* Rating */}
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white font-semibold"
              style={{ background: "rgba(255,255,255,0.11)", fontSize: 12 }}
            >
              {service.rating}
              <span className="flex gap-px">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={10}
                    fill={i <= Math.round(service.rating) ? "#f59e0b" : "rgba(255,255,255,0.2)"}
                    stroke="none"
                  />
                ))}
              </span>
            </span>

            {/* City */}
            <span
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-white/70 font-semibold"
              style={{ background: "rgba(255,255,255,0.11)", fontSize: 12 }}
            >
              <MapPin size={10} />
              {service.city}
            </span>

            {/* Verified */}
            {service.verified && (
              <span
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-white/70 font-semibold"
                style={{ background: "rgba(255,255,255,0.11)", fontSize: 12 }}
              >
                <BadgeCheck size={11} style={{ color: "#f59e0b" }} />
                Verificado
              </span>
            )}
          </div>

          {/* Price + CTA */}
          <div className="flex flex-col gap-2.5 mt-0.5">
            <div style={{ fontSize: 11 }} className="text-white/40 uppercase tracking-[0.5px]">
              Desde{" "}
              <span className="text-white/75 font-semibold normal-case tracking-normal" style={{ fontSize: 13 }}>
                {formatPrice(service.price)}
              </span>
            </div>
            <button className="w-full bg-white text-gray-900 font-bold rounded-full py-3 border-none cursor-pointer hover:bg-gray-100 transition-colors duration-200" style={{ fontSize: 14 }}>
              Reservar ahora
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
