"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, Check, Star, CreditCard, Lock, ChevronLeft, Clock, Users } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe, StripeCardElement } from "@stripe/stripe-js";
import { SERVICE_SELECT, formatPrice, type DbService } from "@/lib/data";
import { getSupabase } from "@/lib/supabase";
import { StarRating } from "@/components/shared/star-rating";
import { CategoryBadge } from "@/components/shared/category-badge";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { ServiceCard } from "@/components/shared/service-card";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type BookingStep = "details" | "card" | "done";

const EVENT_TYPES = [
  { value: "boda",        label: "Boda" },
  { value: "quinceanero", label: "Quinceañero" },
  { value: "cumpleanos",  label: "Cumpleaños" },
  { value: "bautizo",     label: "Bautizo" },
  { value: "corporativo", label: "Corporativo" },
  { value: "graduacion",  label: "Graduación" },
  { value: "otro",        label: "Otro" },
];

const INPUT_BASE = {
  border: "1.5px solid #e5e7eb",
  color: "#111827",
  background: "#fff",
  fontFamily: "inherit",
  boxSizing: "border-box" as const,
};

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [service,      setService]      = useState<DbService | null>(null);
  const [related,      setRelated]      = useState<DbService[]>([]);
  const [activeImg,    setActiveImg]    = useState(0);
  const [loading,      setLoading]      = useState(true);

  // Event details
  const [eventName,    setEventName]    = useState("");
  const [eventType,    setEventType]    = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime,    setStartTime]    = useState("");
  const [endTime,      setEndTime]      = useState("");
  const [guestCount,   setGuestCount]   = useState("");
  const [notes,        setNotes]        = useState("");

  // Booking + card state
  const [bookingStep,     setBookingStep]     = useState<BookingStep>("details");
  const [existingCard,    setExistingCard]    = useState<{ last4: string; brand: string } | null>(null);
  const [cardReady,       setCardReady]       = useState(false);
  const [cardComplete,    setCardComplete]    = useState(false);
  const [cardError,       setCardError]       = useState<string | null>(null);
  const [cardMountFail,   setCardMountFail]   = useState(false);
  const [submitting,      setSubmitting]      = useState(false);
  const [bookingError,    setBookingError]    = useState<string | null>(null);

  const cardMountRef = useRef<HTMLDivElement>(null);
  const stripeRef    = useRef<Stripe | null>(null);
  const cardRef      = useRef<StripeCardElement | null>(null);
  const mountedRef   = useRef(false);
  const clientSecretRef = useRef<string | null>(null);

  const today        = new Date().toISOString().split("T")[0];
  const detailsValid = eventName.trim() !== "" && eventType !== "" && selectedDate !== "";

  useEffect(() => {
    async function fetchService() {
      setLoading(true);
      const sb = getSupabase();
      const { data } = await sb.from("services").select(SERVICE_SELECT).eq("id", id).single();
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

  // Mount Stripe card element when step becomes "card" and no existing card
  useEffect(() => {
    if (bookingStep !== "card" || existingCard || mountedRef.current) return;
    if (!clientSecretRef.current || !cardMountRef.current) return;
    mountedRef.current = true;

    stripePromise.then((stripe) => {
      if (!stripe || !cardMountRef.current) return;
      stripeRef.current = stripe;

      const elements    = stripe.elements();
      const cardElement = elements.create("card", {
        hidePostalCode: true,
        style: {
          base: {
            fontSize: "14px",
            fontFamily: "Inter, system-ui, sans-serif",
            color: "#111827",
            "::placeholder": { color: "#9ca3af" },
          },
          invalid: { color: "#ef4444" },
        },
      });

      cardElement.mount(cardMountRef.current);
      cardRef.current = cardElement;

      const readyRef = { value: false };
      cardElement.on("ready", () => { readyRef.value = true; setCardReady(true); });
      cardElement.on("change", (e) => { setCardError(e.error?.message ?? null); setCardComplete(e.complete); });

      const timeout = setTimeout(() => { if (!readyRef.value) setCardMountFail(true); }, 12_000);
      return () => clearTimeout(timeout);
    });
  }, [bookingStep, existingCard]);

  // ── Step 1: user clicks "Reservar" ──────────────────────────────────────

  const handleStartBooking = async () => {
    if (!detailsValid) return;
    setBookingError(null);
    setSubmitting(true);

    const sb = getSupabase();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    // Check if client already has a saved card
    const { data: profile } = await sb
      .from("profiles")
      .select("stripe_payment_method_id, stripe_card_last4, stripe_card_brand")
      .eq("id", user.id)
      .single();

    if (profile?.stripe_payment_method_id && profile.stripe_card_last4) {
      setExistingCard({ last4: profile.stripe_card_last4, brand: profile.stripe_card_brand ?? "card" });
      setSubmitting(false);
      setBookingStep("card");
      return;
    }

    // No card saved — create SetupIntent and show card form
    const res  = await fetch("/api/stripe/client-setup-intent", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setBookingError(data.error ?? "Error al inicializar el pago.");
      setSubmitting(false);
      return;
    }

    clientSecretRef.current = data.clientSecret;
    setSubmitting(false);
    setBookingStep("card");
  };

  // ── Step 2: confirm card + save booking ─────────────────────────────────

  const handleConfirmCard = async () => {
    setBookingError(null);
    setSubmitting(true);

    const sb = getSupabase();
    let paymentMethodId: string | null = null;

    if (existingCard) {
      // Use existing saved card
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const { data: profile } = await sb
          .from("profiles")
          .select("stripe_payment_method_id")
          .eq("id", user.id)
          .single();
        paymentMethodId = profile?.stripe_payment_method_id ?? null;
      }
    } else {
      // Confirm new card via Stripe
      if (!stripeRef.current || !cardRef.current || !clientSecretRef.current) {
        setBookingError("Error al procesar la tarjeta.");
        setSubmitting(false);
        return;
      }

      const { setupIntent, error: stripeErr } = await stripeRef.current.confirmCardSetup(
        clientSecretRef.current,
        { payment_method: { card: cardRef.current } }
      );

      if (stripeErr || !setupIntent?.payment_method) {
        setBookingError(stripeErr?.message ?? "No se pudo validar la tarjeta.");
        setSubmitting(false);
        return;
      }

      paymentMethodId = setupIntent.payment_method as string;

      // Save card to profile
      const saveRes = await fetch("/api/stripe/save-client-card", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ paymentMethodId }),
      });
      if (!saveRes.ok) {
        const err = await saveRes.json().catch(() => ({}));
        setBookingError(err.error ?? "Error al guardar la tarjeta.");
        setSubmitting(false);
        return;
      }
    }

    // Save booking (server creates event + booking atomically)
    const bookRes = await fetch("/api/bookings", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        service_id:               service!.id,
        event_date:               selectedDate,
        quoted_price:             service!.base_price ?? null,
        client_payment_method_id: paymentMethodId,
        event_name:               eventName.trim(),
        event_type:               eventType || null,
        start_time:               startTime || null,
        end_time:                 endTime   || null,
        guest_count:              guestCount ? parseInt(guestCount) : null,
        notes:                    notes.trim() || null,
      }),
    });

    setSubmitting(false);

    if (!bookRes.ok) {
      const err = await bookRes.json().catch(() => ({}));
      if (bookRes.status === 401) { router.push("/auth/login"); return; }
      setBookingError(err.error ?? "Error al guardar la reserva.");
      return;
    }

    setBookingStep("done");
  };

  // ── Render ───────────────────────────────────────────────────────────────

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
          <Link href="/catalogo" className="text-[#f39e10] font-semibold hover:underline">Ver catálogo</Link>
        </div>
      </div>
    );
  }

  const sortedImages = [...service.images].sort((a, b) => a.display_order - b.display_order);
  const imageUrls    = sortedImages.map((i) => i.url);
  const coverUrl     = imageUrls[0] ?? "https://picsum.photos/seed/evdefault/800/520";
  const isVerified   = service.provider?.status === "approved";
  const categoryLabel = service.category?.name ?? "";
  const providerName  = service.provider?.business_name ?? "Proveedor";
  const providerLogo  = service.provider?.logo_url ?? null;

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
                    Capacidad: <strong className="text-gray-900">{service.capacity_min}–{service.capacity_max} personas</strong>
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

              {/* Price header */}
              <div className="bg-[#f39e10] px-6 py-5">
                <div className="text-white/80 text-[12px] uppercase tracking-[0.6px]">Precio desde</div>
                <div className="text-white text-[34px] font-black leading-tight">{formatPrice(service.base_price)}</div>
                <div className="text-white/65 text-[12px] mt-0.5">Sin cargos ocultos</div>
              </div>

              <div className="p-6">

                {/* ── Step: done ── */}
                {bookingStep === "done" && (
                  <div className="flex flex-col items-center text-center py-4">
                    <div className="w-14 h-14 rounded-full bg-[rgba(34,197,94,0.10)] flex items-center justify-center mb-4">
                      <Check size={28} className="text-green-600" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-gray-900 font-black text-[17px] mb-1">¡Reserva guardada!</h3>
                    <p className="text-gray-500 text-[13px] mb-5 leading-relaxed">
                      El proveedor revisará tu solicitud. Te notificaremos cuando la confirme.
                    </p>
                    <Link
                      href="/cliente"
                      className="w-full rounded-xl py-3 text-center text-[14px] font-bold text-white border-none"
                      style={{ background: "#f39e10", display: "block" }}
                    >
                      Ver mi evento →
                    </Link>
                  </div>
                )}

                {/* ── Step: details ── */}
                {bookingStep === "details" && (
                  <>
                    <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-[0.6px] mb-3">Detalles del evento</p>

                    <label className="text-gray-700 text-[12px] font-semibold block mb-1">
                      Nombre del evento <span className="text-[#f39e10]">*</span>
                    </label>
                    <input
                      type="text"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="Ej. Boda de Ana y Carlos"
                      className="w-full rounded-xl py-2.5 px-3.5 text-[13px] outline-none mb-3"
                      style={{ ...INPUT_BASE, border: eventName ? "1.5px solid #f39e10" : "1.5px solid #e5e7eb" }}
                    />

                    <label className="text-gray-700 text-[12px] font-semibold block mb-1">
                      Tipo de evento <span className="text-[#f39e10]">*</span>
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full rounded-xl py-2.5 px-3.5 text-[13px] outline-none mb-3 cursor-pointer"
                      style={{ ...INPUT_BASE, border: eventType ? "1.5px solid #f39e10" : "1.5px solid #e5e7eb" }}
                    >
                      <option value="">Seleccionar tipo...</option>
                      {EVENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>

                    <label className="text-gray-700 text-[12px] font-semibold block mb-1">
                      Fecha del evento <span className="text-[#f39e10]">*</span>
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={today}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full rounded-xl py-2.5 px-3.5 text-[13px] outline-none mb-3"
                      style={{ ...INPUT_BASE, border: selectedDate ? "1.5px solid #f39e10" : "1.5px solid #e5e7eb" }}
                      suppressHydrationWarning
                    />

                    <div className="flex gap-2 mb-3">
                      <div className="flex-1">
                        <label className="text-gray-700 text-[12px] font-semibold flex items-center gap-1 mb-1">
                          <Clock size={11} />Inicio
                        </label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full rounded-xl py-2.5 px-3 text-[13px] outline-none"
                          style={INPUT_BASE}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-gray-700 text-[12px] font-semibold flex items-center gap-1 mb-1">
                          <Clock size={11} />Fin
                        </label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full rounded-xl py-2.5 px-3 text-[13px] outline-none"
                          style={INPUT_BASE}
                        />
                      </div>
                    </div>

                    <label className="text-gray-700 text-[12px] font-semibold flex items-center gap-1 mb-1">
                      <Users size={11} />Número de invitados
                    </label>
                    <input
                      type="number"
                      value={guestCount}
                      min={1}
                      onChange={(e) => setGuestCount(e.target.value)}
                      placeholder="Ej. 150"
                      className="w-full rounded-xl py-2.5 px-3.5 text-[13px] outline-none mb-3"
                      style={INPUT_BASE}
                    />

                    <label className="text-gray-700 text-[12px] font-semibold block mb-1">Notas adicionales</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Preferencias, horarios especiales..."
                      rows={2}
                      className="w-full rounded-xl py-2.5 px-3.5 text-[13px] outline-none resize-none mb-4"
                      style={{ ...INPUT_BASE }}
                    />

                    {bookingError && (
                      <p className="text-red-500 text-[12px] mb-3">{bookingError}</p>
                    )}

                    <button
                      disabled={!detailsValid || submitting}
                      onClick={handleStartBooking}
                      className="w-full border-none rounded-xl py-3.5 text-[15px] font-bold mb-3 transition-colors flex items-center justify-center gap-2"
                      style={{
                        background: detailsValid ? "#f39e10" : "#f3f4f6",
                        color:      detailsValid ? "#fff"    : "#9ca3af",
                        cursor:     detailsValid && !submitting ? "pointer" : "default",
                      }}
                    >
                      {submitting ? (
                        <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Verificando...</>
                      ) : "Continuar →"}
                    </button>

                    <div className="flex flex-col gap-1.5">
                      {["Cancelación gratuita hasta 7 días antes", "Soporte disponible 24/7"].map((item) => (
                        <div key={item} className="flex gap-2 items-center">
                          <Check size={13} className="text-[#f39e10] shrink-0" />
                          <span className="text-gray-500 text-[12px]">{item}</span>
                        </div>
                      ))}
                      <div className="flex gap-2 items-start mt-1 pt-3 border-t border-gray-100">
                        <CreditCard size={13} className="text-[#f39e10] shrink-0 mt-0.5" />
                        <span className="text-gray-500 text-[12px] leading-relaxed">
                          Se solicitará tu tarjeta en el siguiente paso. Sin cobros hasta que el proveedor acepte.
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Step: card ── */}
                {bookingStep === "card" && (
                  <div>
                    <button
                      type="button"
                      onClick={() => { setBookingStep("details"); setBookingError(null); }}
                      className="flex items-center gap-1 text-gray-400 text-[12px] hover:text-gray-600 mb-4 bg-transparent border-none cursor-pointer p-0"
                    >
                      <ChevronLeft size={14} /> Cambiar detalles
                    </button>

                    {/* Event summary */}
                    <div className="bg-[rgba(243,158,16,0.06)] border border-[rgba(243,158,16,0.18)] rounded-xl p-3 mb-4">
                      <p className="text-gray-900 text-[13px] font-bold truncate">{eventName}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-gray-500 text-[11px] flex items-center gap-1">
                          <Calendar size={10} className="text-[#f39e10]" />
                          {selectedDate ? new Date(selectedDate + "T00:00:00").toLocaleDateString("es-PE", { day: "numeric", month: "long" }) : ""}
                        </span>
                        {startTime && (
                          <span className="text-gray-500 text-[11px] flex items-center gap-1">
                            <Clock size={10} className="text-[#f39e10]" />{startTime}{endTime ? ` – ${endTime}` : ""}
                          </span>
                        )}
                        {guestCount && (
                          <span className="text-gray-500 text-[11px] flex items-center gap-1">
                            <Users size={10} className="text-[#f39e10]" />{guestCount} invitados
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Existing card */}
                    {existingCard ? (
                      <div className="flex items-center gap-3 bg-[rgba(243,158,16,0.06)] border border-[rgba(243,158,16,0.22)] rounded-xl p-4 mb-4">
                        <CreditCard size={18} style={{ color: "#f39e10" }} strokeWidth={1.8} className="shrink-0" />
                        <div className="flex-1">
                          <div className="text-gray-900 text-[13px] font-semibold capitalize">
                            {existingCard.brand} •••• {existingCard.last4}
                          </div>
                          <div className="text-gray-400 text-[11px]">Tarjeta guardada</div>
                        </div>
                        <Check size={15} className="text-green-500 shrink-0" />
                      </div>
                    ) : (
                      <>
                        <label className="text-gray-700 text-[13px] font-semibold block mb-2">
                          Datos de tu tarjeta
                        </label>

                        {/* Stripe card element */}
                        <div className="relative mb-3">
                          {!cardReady && !cardMountFail && (
                            <div className="w-full px-3.5 py-3.5 rounded-xl border border-gray-200 bg-white flex items-center gap-2" style={{ minHeight: 44 }}>
                              <div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-gray-400 animate-spin shrink-0" />
                              <span className="text-gray-300 text-[13px]">Cargando formulario seguro…</span>
                            </div>
                          )}
                          {cardMountFail && (
                            <div className="w-full px-3.5 py-3.5 rounded-xl border border-red-100 bg-red-50 text-red-600 text-[13px]">
                              No se pudo conectar con Stripe. Recarga la página.
                            </div>
                          )}
                          <div
                            ref={cardMountRef}
                            className="w-full px-3.5 py-3.5 rounded-xl border border-gray-200 bg-white"
                            style={{
                              minHeight: 44,
                              visibility: cardReady ? "visible" : "hidden",
                              position:   cardReady ? "relative" : "absolute",
                              top: 0, left: 0, right: 0,
                            }}
                          />
                        </div>
                        {cardError && <p className="text-red-500 text-[12px] mb-3">{cardError}</p>}

                        <div className="flex items-start gap-2 mb-4">
                          <Lock size={12} className="text-[#f39e10] shrink-0 mt-0.5" />
                          <span className="text-gray-400 text-[11px] leading-relaxed">
                            Datos cifrados por Stripe. No se realizará ningún cobro hasta que el proveedor confirme.
                          </span>
                        </div>
                      </>
                    )}

                    {bookingError && (
                      <p className="text-red-500 text-[12px] mb-3">{bookingError}</p>
                    )}

                    <button
                      onClick={handleConfirmCard}
                      disabled={submitting || (!existingCard && !cardComplete)}
                      className="w-full border-none rounded-xl py-3.5 text-[15px] font-bold cursor-pointer flex items-center justify-center gap-2"
                      style={{
                        background: "linear-gradient(135deg, #f59e0b 0%, #f39e10 55%, #e88e00 100%)",
                        boxShadow:  "0 4px 20px rgba(243,158,16,0.4)",
                        opacity:    submitting || (!existingCard && !cardComplete) ? 0.6 : 1,
                        transition: "opacity 200ms",
                      }}
                    >
                      {submitting ? (
                        <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Confirmando...</>
                      ) : "Confirmar reserva →"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
