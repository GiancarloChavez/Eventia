"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, Check, Star } from "lucide-react";
import { SERVICE_SELECT, formatPrice, type DbService } from "@/lib/data";
import { getSupabase } from "@/lib/supabase";
import { StarRating } from "@/components/shared/star-rating";
import { CategoryBadge } from "@/components/shared/category-badge";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { ServiceCard } from "@/components/shared/service-card";

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [service, setService] = useState<DbService | null>(null);
  const [related, setRelated] = useState<DbService[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function fetchService() {
      setLoading(true);
      const sb = getSupabase();
      const { data } = await sb
        .from("services")
        .select(SERVICE_SELECT)
        .eq("id", id)
        .single();

      const svc = data as unknown as DbService | null;
      setService(svc);

      if (svc) {
        const { data: rel } = await sb
          .from("services")
          .select(SERVICE_SELECT)
          .eq("status", "active")
          .eq("category_id", svc.category_id)
          .neq("id", id)
          .limit(3);
        setRelated((rel as unknown as DbService[]) ?? []);
      }
      setLoading(false);
    }
    fetchService();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#f4f5f7] min-h-screen flex items-center justify-center pt-[72px]">
        <div className="w-10 h-10 border-2 border-[#f39e10] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="bg-[#f4f5f7] min-h-screen flex items-center justify-center pt-[72px]">
        <div className="text-center">
          <p className="text-gray-500 text-[16px] mb-4">Servicio no encontrado.</p>
          <Link href="/catalogo" className="text-[#f39e10] font-semibold hover:underline">
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  const sortedImages = [...service.images].sort((a, b) => a.display_order - b.display_order);
  const imageUrls = sortedImages.map((i) => i.url);
  const coverUrl = imageUrls[0] ?? "https://picsum.photos/seed/evdefault/800/520";
  const isVerified = service.provider?.status === "approved";
  const categoryLabel = service.category?.name ?? "";
  const providerName = service.provider?.business_name ?? "Proveedor";
  const providerLogo = service.provider?.logo_url ?? null;

  if (showConfirm) {
    return (
      <div className="bg-[#f4f5f7] min-h-screen flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-14 text-center max-w-[440px]" style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.1)" }}>
          <div className="w-20 h-20 rounded-full bg-[rgba(243,158,16,0.08)] border border-[rgba(243,158,16,0.22)] flex items-center justify-center mx-auto mb-6">
            <Check size={36} className="text-[#f39e10]" />
          </div>
          <h2 className="text-gray-900 text-[24px] font-black mb-3">¡Reserva enviada!</h2>
          <p className="text-gray-500 text-[15px] leading-relaxed mb-1.5">
            Tu solicitud para <strong className="text-gray-900">{service.title}</strong> fue enviada exitosamente.
          </p>
          <p className="text-gray-500 text-[14px] mb-7">
            El proveedor confirmará en las próximas <strong className="text-[#f39e10]">24 horas</strong>.
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => router.push("/cliente")}
              className="w-full bg-[#f39e10] border-none text-white rounded-xl py-3 text-[15px] font-bold cursor-pointer hover:bg-[#d4870e] transition-colors"
            >
              Ver mis reservas
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="w-full bg-none border border-gray-200 text-gray-500 rounded-xl py-3 text-[14px] cursor-pointer hover:bg-gray-50 transition-colors"
            >
              Volver al servicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f5f7] min-h-screen pt-[72px]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-10 py-3">
        <div className="flex gap-2 items-center">
          <Link href="/" className="text-gray-500 text-[13px] hover:text-[#f39e10]">Inicio</Link>
          <span className="text-gray-300">›</span>
          <Link href="/catalogo" className="text-gray-500 text-[13px] hover:text-[#f39e10]">Catálogo</Link>
          <span className="text-gray-300">›</span>
          <span className="text-gray-900 text-[13px] font-semibold">{service.title}</span>
        </div>
      </div>

      <div className="px-10 py-7">
        <div className="grid gap-9 items-start" style={{ gridTemplateColumns: "1fr 360px" }}>
          {/* Left */}
          <div>
            {/* Gallery */}
            <div className="rounded-2xl overflow-hidden mb-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrls[activeImg] ?? coverUrl}
                alt={service.title}
                className="w-full object-cover"
                style={{ height: 400 }}
              />
            </div>
            {imageUrls.length > 1 && (
              <div className="flex gap-2.5 mb-7">
                {imageUrls.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className="flex-1 h-[72px] rounded-lg overflow-hidden p-0 cursor-pointer transition-all"
                    style={{ border: `2px solid ${i === activeImg ? "#f39e10" : "transparent"}` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Badges + title */}
            <div className="flex gap-2 flex-wrap mb-3">
              {categoryLabel && <CategoryBadge label={categoryLabel} />}
              {isVerified && <VerifiedBadge />}
            </div>
            <h1 className="text-gray-900 text-[28px] font-black mb-2.5 tracking-[-0.5px]">{service.title}</h1>
            <div className="flex gap-4 items-center flex-wrap mb-5">
              <StarRating value={0} reviews={0} size={15} />
              {service.location && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-500 text-[13px] flex items-center gap-1">
                    <MapPin size={13} /> {service.location}
                  </span>
                </>
              )}
              {(service.capacity_min || service.capacity_max) && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-500 text-[13px]">
                    Capacidad: <strong className="text-gray-900">
                      {service.capacity_min}–{service.capacity_max} personas
                    </strong>
                  </span>
                </>
              )}
            </div>

            {/* Provider card */}
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 mb-6">
              <div className="w-11 h-11 rounded-full shrink-0 overflow-hidden bg-[rgba(243,158,16,0.08)] flex items-center justify-center">
                {providerLogo
                  ? <img src={providerLogo} alt={providerName} className="w-full h-full object-cover" />
                  : <span className="text-[#f39e10] font-black text-[18px]">{providerName[0]}</span>
                }
              </div>
              <div className="flex-1">
                <div className="text-gray-900 font-bold text-[14px]">{providerName}</div>
                {categoryLabel && <div className="text-gray-500 text-[12px]">Proveedor de {categoryLabel}</div>}
              </div>
              {isVerified && <VerifiedBadge />}
            </div>

            {/* Description */}
            <h2 className="text-gray-900 text-[17px] font-bold mb-2.5">Descripción</h2>
            <p className="text-gray-700 text-[14px] leading-[1.8] mb-6">{service.description ?? "Sin descripción disponible."}</p>

            {/* Reviews placeholder */}
            <div className="border-t border-gray-200 pt-7">
              <div className="flex gap-6 items-center mb-6">
                <div className="text-center shrink-0">
                  <div className="text-gray-900 text-[48px] font-black leading-none">—</div>
                  <StarRating value={0} showValue={false} size={15} />
                  <div className="text-gray-500 text-[12px] mt-1">Sin reseñas</div>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((n) => (
                    <div key={n} className="flex items-center gap-2.5 mb-1.5">
                      <span className="text-gray-500 text-[12px] w-1.5">{n}</span>
                      <Star size={12} fill="#f59e0b" stroke="none" />
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>

              <h2 className="text-gray-900 text-[17px] font-bold mb-4">Reseñas</h2>
              <p className="text-gray-500 text-[14px]">Aún no hay reseñas. ¡Sé el primero!</p>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div className="mt-10">
                <h2 className="text-gray-900 text-[20px] font-bold mb-4">Servicios similares</h2>
                <div className="grid grid-cols-3 gap-4">
                  {related.map((s) => <ServiceCard key={s.id} service={s} />)}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking widget */}
          <aside className="sticky top-[88px]">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
              <div className="bg-[#f39e10] px-6 py-5">
                <div className="text-white/80 text-[12px] uppercase tracking-[0.6px]">Precio desde</div>
                <div className="text-white text-[34px] font-black leading-tight">
                  {formatPrice(service.base_price)}
                </div>
                <div className="text-white/65 text-[12px] mt-0.5">Sin cargos ocultos</div>
              </div>

              <div className="p-6">
                <label className="text-gray-900 text-[13px] font-semibold block mb-2">Fecha del evento</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={today}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl py-3 px-3.5 text-[14px] outline-none transition-all"
                  style={{
                    border: `1.5px solid ${selectedDate ? "#f39e10" : "#e5e7eb"}`,
                    color: selectedDate ? "#111827" : "#9ca3af",
                    background: "#fff",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                  suppressHydrationWarning
                />

                <div className="flex gap-1.5 items-center bg-[rgba(243,158,16,0.08)] border border-[rgba(243,158,16,0.22)] rounded-lg px-3 py-2.5 my-3.5 text-[12px] text-gray-500">
                  <Calendar size={13} className="text-[#f39e10]" />
                  Disponibilidad: <strong className="text-gray-900 ml-0.5">Consultar con el proveedor</strong>
                </div>

                <button
                  onClick={() => selectedDate && setShowConfirm(true)}
                  className="w-full border-none rounded-xl py-3.5 text-[15px] font-bold mb-2.5 transition-colors"
                  style={{
                    background: selectedDate ? "#f39e10" : "#f3f4f6",
                    color: selectedDate ? "#fff" : "#9ca3af",
                    cursor: selectedDate ? "pointer" : "default",
                  }}
                >
                  Reservar ahora
                </button>

                <button className="w-full bg-none border border-gray-200 text-gray-700 rounded-xl py-3 text-[14px] font-semibold cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="#f39e10">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
                  </svg>
                  Solicitar cotización
                </button>

                <div className="border-t border-gray-100 pt-4 mt-4 flex flex-col gap-2">
                  {["Pago 100% seguro y encriptado", "Cancelación gratuita hasta 7 días antes", "Soporte disponible 24/7"].map((item) => (
                    <div key={item} className="flex gap-2 items-center">
                      <Check size={13} className="text-[#f39e10] shrink-0" />
                      <span className="text-gray-500 text-[12px]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
