"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Service } from "@/lib/data";
import { formatPrice } from "@/lib/data";
import { StarRating } from "./star-rating";
import { CategoryBadge } from "./category-badge";
import { VerifiedBadge } from "./verified-badge";

export function ServiceCard({ service }: { service: Service }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="bg-white rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all duration-200"
      style={{
        border: `1px solid ${hov ? "rgba(243,158,16,0.22)" : "#e5e7eb"}`,
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? "0 8px 24px rgba(0,0,0,0.12)" : "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <Link href={`/servicios/${service.id}`} className="block">
        {/* Image */}
        <div className="relative h-[188px] overflow-hidden flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={service.images[0]}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-300"
            style={{ transform: hov ? "scale(1.05)" : "scale(1)" }}
          />
          <div className="absolute top-2.5 left-2.5">
            <CategoryBadge label={service.categoryLabel} />
          </div>
          {service.verified && (
            <div className="absolute top-2.5 right-2.5">
              <VerifiedBadge small />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col gap-1">
          <StarRating value={service.rating} reviews={service.reviews} />
          <h3 className="text-gray-900 text-[15px] font-bold leading-tight">{service.name}</h3>
          <p className="text-gray-500 text-[13px]">{service.provider}</p>
          <p className="text-gray-400 text-[12px] flex items-center gap-1 mb-auto">
            <MapPin size={12} /> {service.city}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-2">
            <div>
              <div className="text-gray-300 text-[10px] uppercase tracking-[0.4px]">Desde</div>
              <div className="text-[#f39e10] text-[18px] font-black leading-tight">
                {formatPrice(service.price)}
              </div>
            </div>
            <span
              className="border border-[#f39e10] rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-all duration-150"
              style={{
                background: hov ? "#f39e10" : "transparent",
                color: hov ? "#fff" : "#f39e10",
              }}
            >
              Ver más
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
