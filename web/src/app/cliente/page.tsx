"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar, FileText, CreditCard, User, Info,
  CalendarCheck, Clock, Users, Plus, ChevronRight,
  X, Trash2, CalendarPlus,
} from "lucide-react";
import { formatPrice } from "@/lib/data";
import { getSupabase } from "@/lib/supabase";

interface Profile {
  full_name: string | null;
  email: string;
  phone: string | null;
  role: string;
}

interface Booking {
  id: string;
  event_date: string;
  status: string;
  quoted_price: number | null;
  created_at: string;
  services: {
    title: string;
    base_price: number | null;
    service_categories: { name: string } | null;
    providers: { business_name: string } | null;
    service_images: { url: string }[];
  } | null;
}

interface EventBooking {
  id: string;
  status: string;
  quoted_price: number | null;
  start_time: string | null;
  end_time: string | null;
  services: {
    id: string;
    title: string;
    base_price: number | null;
    service_categories: { name: string } | null;
    service_images: { url: string; display_order: number }[];
  } | null;
}

interface Event {
  id: string;
  title: string;
  event_type: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  guest_count: number | null;
  notes: string | null;
  status: string;
  created_at: string;
  bookings: EventBooking[];
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pendiente",  color: "#b45309", bg: "rgba(180,83,9,0.08)"   },
  confirmed: { label: "Confirmada", color: "#1d4ed8", bg: "rgba(29,78,216,0.08)"  },
  completed: { label: "Completada", color: "#15803d", bg: "rgba(21,128,61,0.08)"  },
  cancelled: { label: "Cancelada",  color: "#6b7280", bg: "rgba(107,114,128,0.08)" },
};

const SIDEBAR_ITEMS = [
  { id: "eventos",   label: "Mis eventos",   Icon: CalendarCheck },
  { id: "reservas",  label: "Mis reservas",  Icon: Calendar },
  { id: "contratos", label: "Mis contratos", Icon: FileText },
  { id: "pagos",     label: "Pagos",         Icon: CreditCard },
  { id: "perfil",    label: "Mi perfil",     Icon: User },
];

const TITLES: Record<string, string> = {
  eventos:   "Mis eventos",
  reservas:  "Mis reservas",
  contratos: "Contratos",
  pagos:     "Pagos",
  perfil:    "Mi perfil",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  boda:        "Boda",
  quinceanero: "Quinceañero",
  cumpleanos:  "Cumpleaños",
  bautizo:     "Bautizo",
  corporativo: "Corporativo",
  graduacion:  "Graduación",
  otro:        "Otro",
};

const EVENT_TYPES = [
  { value: "boda",        label: "Boda"        },
  { value: "quinceanero", label: "Quinceañero" },
  { value: "cumpleanos",  label: "Cumpleaños"  },
  { value: "bautizo",     label: "Bautizo"     },
  { value: "corporativo", label: "Corporativo" },
  { value: "graduacion",  label: "Graduación"  },
  { value: "otro",        label: "Otro"        },
];

const BOOKING_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pendiente",  color: "#b45309", bg: "rgba(180,83,9,0.08)"   },
  confirmed: { label: "Confirmada", color: "#1d4ed8", bg: "rgba(29,78,216,0.08)"  },
  completed: { label: "Completada", color: "#15803d", bg: "rgba(21,128,61,0.08)"  },
  cancelled: { label: "Cancelada",  color: "#6b7280", bg: "rgba(107,114,128,0.08)" },
};

const INPUT_BASE = "w-full rounded-xl py-2.5 px-3.5 text-[13px] outline-none border border-gray-200 focus:border-[#3b82f6] transition-colors";

export default function ClientDashboard() {
  const router = useRouter();

  const [active,   setActive]   = useState("eventos");
  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events,   setEvents]   = useState<Event[]>([]);
  const [loading,  setLoading]  = useState(true);

  // ── Create-event modal ──────────────────────────────────────
  const [showModal,     setShowModal]     = useState(false);
  const [formTitle,     setFormTitle]     = useState("");
  const [formType,      setFormType]      = useState("");
  const [formDate,      setFormDate]      = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime,   setFormEndTime]   = useState("");
  const [formGuests,    setFormGuests]    = useState("");
  const [formNotes,     setFormNotes]     = useState("");
  const [formLoading,   setFormLoading]   = useState(false);
  const [formError,     setFormError]     = useState<string | null>(null);

  // ── Unlink service ──────────────────────────────────────────
  const [unlinkingId,   setUnlinkingId]   = useState<string | null>(null);
  const [unlinkLoading, setUnlinkLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // ── Load data ───────────────────────────────────────────────
  const loadEvents = async () => {
    const res = await fetch("/api/events").catch(() => null);
    if (res?.ok) {
      const { events: ev } = await res.json();
      setEvents(ev ?? []);
    }
  };

  useEffect(() => {
    const sb = getSupabase();
    async function load() {
      const { data: { user }, error: userError } = await sb.auth.getUser();
      if (userError || !user) { router.replace("/auth/login"); return; }

      const [profResult, bookResult, eventsRes] = await Promise.all([
        sb.from("profiles").select("full_name, phone, role").eq("id", user.id).single(),
        sb.from("bookings")
          .select(`
            id, event_date, status, quoted_price, created_at,
            services (
              title, base_price,
              service_categories ( name ),
              providers ( business_name ),
              service_images ( url )
            )
          `)
          .eq("client_id", user.id)
          .order("created_at", { ascending: false }),
        fetch("/api/events").then((r) => r.json()).catch(() => ({ events: [] })),
      ]);

      setProfile({
        full_name: profResult.data?.full_name ?? null,
        email:     user.email ?? "",
        phone:     profResult.data?.phone ?? null,
        role:      profResult.data?.role ?? "client",
      });
      setBookings((bookResult.data as unknown as Booking[]) ?? []);
      setEvents((eventsRes.events as Event[]) ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  // ── Create event ────────────────────────────────────────────
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      const res = await fetch("/api/events", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          title:       formTitle.trim(),
          event_type:  formType      || null,
          event_date:  formDate,
          start_time:  formStartTime || null,
          end_time:    formEndTime   || null,
          guest_count: formGuests    ? parseInt(formGuests) : null,
          notes:       formNotes.trim() || null,
        }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        setFormError(error ?? "Error al crear el evento");
        return;
      }
      await loadEvents();
      // reset
      setShowModal(false);
      setFormTitle(""); setFormType(""); setFormDate("");
      setFormStartTime(""); setFormEndTime(""); setFormGuests(""); setFormNotes("");
    } catch {
      setFormError("Error de red");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Unlink service ──────────────────────────────────────────
  const handleUnlink = async (bookingId: string) => {
    setUnlinkLoading(true);
    try {
      await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" });
      await loadEvents();
      setUnlinkingId(null);
    } catch {
      // noop
    } finally {
      setUnlinkLoading(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-[#f4f5f7] min-h-screen flex items-center justify-center pt-[72px]">
        <div className="w-10 h-10 border-2 border-[#f39e10] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName   = profile?.full_name ?? profile?.email ?? "Usuario";
  const initial       = displayName[0]?.toUpperCase() ?? "U";
  const totalInvested = bookings.reduce((acc, b) => acc + (b.quoted_price ?? 0), 0);
  const activeCount   = bookings.filter((b) => b.status === "confirmed").length;
  const pendingCount  = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="bg-[#f4f5f7] min-h-screen px-6 pb-6 pt-[96px] flex gap-6">

      {/* ── Create-event modal ──────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white rounded-2xl w-full max-w-[480px] mx-4 overflow-hidden shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-gray-900 text-[18px] font-black">Crear nuevo evento</h2>
                <p className="text-gray-400 text-[13px] mt-0.5">Luego podrás agregar servicios desde aquí</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer border-none"
              >
                <X size={15} className="text-gray-500" />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleCreateEvent} className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              {formError && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px]">
                  {formError}
                </div>
              )}

              <div>
                <label className="text-gray-700 text-[12px] font-semibold block mb-1.5">
                  Nombre del evento <span className="text-[#f39e10]">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ej. Boda de Ana y Carlos"
                  required
                  autoFocus
                  className={INPUT_BASE}
                  style={{ fontFamily: "inherit" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-700 text-[12px] font-semibold block mb-1.5">Tipo de evento</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className={INPUT_BASE + " cursor-pointer bg-white"}
                    style={{ fontFamily: "inherit" }}
                  >
                    <option value="">Seleccionar...</option>
                    {EVENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-700 text-[12px] font-semibold block mb-1.5">
                    Fecha del evento <span className="text-[#f39e10]">*</span>
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    min={today}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className={INPUT_BASE}
                    style={{ fontFamily: "inherit" }}
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-gray-700 text-[12px] font-semibold block mb-1.5 flex items-center gap-1">
                    <Clock size={11} /> Inicio
                  </label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className={INPUT_BASE}
                    style={{ fontFamily: "inherit" }}
                  />
                </div>
                <div>
                  <label className="text-gray-700 text-[12px] font-semibold block mb-1.5 flex items-center gap-1">
                    <Clock size={11} /> Fin
                  </label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className={INPUT_BASE}
                    style={{ fontFamily: "inherit" }}
                  />
                </div>
                <div>
                  <label className="text-gray-700 text-[12px] font-semibold block mb-1.5 flex items-center gap-1">
                    <Users size={11} /> Invitados
                  </label>
                  <input
                    type="number"
                    value={formGuests}
                    min={1}
                    onChange={(e) => setFormGuests(e.target.value)}
                    placeholder="150"
                    className={INPUT_BASE}
                    style={{ fontFamily: "inherit" }}
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-700 text-[12px] font-semibold block mb-1.5">Notas</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Detalles adicionales del evento..."
                  rows={3}
                  className={INPUT_BASE + " resize-none"}
                  style={{ fontFamily: "inherit" }}
                />
              </div>

              <button
                type="submit"
                disabled={formLoading || !formTitle.trim() || !formDate}
                className="w-full rounded-xl py-3.5 text-white text-[15px] font-bold border-none transition-opacity flex items-center justify-center gap-2"
                style={{
                  background:  "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  boxShadow:   "0 4px 20px rgba(59,130,246,0.4)",
                  opacity:     formLoading || !formTitle.trim() || !formDate ? 0.6 : 1,
                  cursor:      formLoading || !formTitle.trim() || !formDate ? "default" : "pointer",
                }}
              >
                {formLoading ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Creando...</>
                ) : (
                  <><CalendarPlus size={16} />Crear evento</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="w-[220px] shrink-0 bg-white border border-gray-200 rounded-2xl p-4 self-start sticky top-[88px]">
        <div className="flex flex-col items-center py-3 pb-5 border-b border-gray-100 mb-3">
          <div className="w-14 h-14 rounded-full bg-[rgba(59,130,246,0.08)] border-2 border-[rgba(59,130,246,0.22)] flex items-center justify-center mb-2.5">
            <span className="text-[#3b82f6] font-black text-[22px]">{initial}</span>
          </div>
          <div className="text-gray-900 font-bold text-[14px]">{displayName}</div>
          <div className="text-gray-500 text-[12px] mt-0.5">Organizador</div>
        </div>
        <nav className="flex flex-col gap-0.5">
          {SIDEBAR_ITEMS.map(({ id, label, Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-[14px] text-left transition-all border"
                style={{
                  background:  isActive ? "rgba(59,130,246,0.08)" : "none",
                  borderColor: isActive ? "rgba(59,130,246,0.22)" : "transparent",
                  color:       isActive ? "#3b82f6" : "#6b7280",
                  fontWeight:  isActive ? 600 : 400,
                }}
              >
                <Icon size={16} style={{ color: isActive ? "#3b82f6" : "#9ca3af" }} strokeWidth={1.8} />
                <span className="flex-1">{label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-gray-900 text-[24px] font-black mb-0.5">{TITLES[active]}</h1>
          <p className="text-gray-500 text-[14px]">Bienvenido, {profile?.full_name?.split(" ")[0] ?? "usuario"}</p>
        </div>

        {/* ── EVENTOS ─────────────────────────────────────── */}
        {active === "eventos" && (
          <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-500 text-[14px]">
                {events.length === 0
                  ? "Crea tu primer evento para empezar a organizar"
                  : `${events.length} evento${events.length !== 1 ? "s" : ""}`}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-[#3b82f6] text-white rounded-xl px-4 py-2.5 text-[13px] font-bold hover:bg-[#2563eb] transition-colors border-none cursor-pointer"
              >
                <CalendarPlus size={14} /> Crear evento
              </button>
            </div>

            {/* Empty state */}
            {events.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl flex flex-col items-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-[rgba(59,130,246,0.08)] flex items-center justify-center mb-4">
                  <CalendarCheck size={28} className="text-[#3b82f6]" />
                </div>
                <p className="text-gray-700 text-[16px] font-bold mb-1">Aún no tienes eventos</p>
                <p className="text-gray-400 text-[13px] mb-6 max-w-[280px] leading-relaxed">
                  Crea tu evento primero y luego agrega los servicios que necesitas desde el catálogo.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-[#3b82f6] text-white rounded-xl px-6 py-3 text-[14px] font-bold hover:bg-[#2563eb] transition-colors border-none cursor-pointer"
                >
                  <CalendarPlus size={14} className="inline mr-2" />
                  Crear mi primer evento
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {events.map((ev) => {
                  const total     = ev.bookings.length;
                  const confirmed = ev.bookings.filter((b) => b.status === "confirmed" || b.status === "completed").length;
                  const pct       = total > 0 ? Math.round((confirmed / total) * 100) : 0;
                  const eventDate = new Date(ev.event_date + "T00:00:00").toLocaleDateString("es-PE", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                  });
                  const catalogHref = `/catalogo?event_id=${ev.id}&event_title=${encodeURIComponent(ev.title)}`;

                  return (
                    <div key={ev.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                      {/* Event header */}
                      <div className="px-6 py-5 border-b border-gray-100">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {ev.event_type && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[rgba(59,130,246,0.08)] text-[#3b82f6]">
                                  {EVENT_TYPE_LABELS[ev.event_type] ?? ev.event_type}
                                </span>
                              )}
                            </div>
                            <h3 className="text-gray-900 text-[17px] font-black truncate">{ev.title}</h3>
                            <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                              <span className="text-gray-500 text-[12px] flex items-center gap-1.5">
                                <Calendar size={12} className="text-[#3b82f6]" />{eventDate}
                              </span>
                              {(ev.start_time || ev.end_time) && (
                                <span className="text-gray-500 text-[12px] flex items-center gap-1.5">
                                  <Clock size={12} className="text-[#3b82f6]" />
                                  {ev.start_time ?? ""}{ev.start_time && ev.end_time ? " – " : ""}{ev.end_time ?? ""}
                                </span>
                              )}
                              {ev.guest_count && (
                                <span className="text-gray-500 text-[12px] flex items-center gap-1.5">
                                  <Users size={12} className="text-[#3b82f6]" />{ev.guest_count} invitados
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Progress */}
                        {total > 0 && (
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-gray-500 text-[12px]">
                                {confirmed} de {total} servicio{total !== 1 ? "s" : ""} confirmado{confirmed !== 1 ? "s" : ""}
                              </span>
                              <span className="text-[#3b82f6] text-[12px] font-bold">{pct}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, background: pct === 100 ? "#16a34a" : "#3b82f6" }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Services list */}
                      {ev.bookings.length === 0 ? (
                        <div className="px-6 py-8 text-center">
                          <p className="text-gray-400 text-[13px] mb-2">Sin servicios vinculados aún</p>
                          <Link
                            href={catalogHref}
                            className="inline-flex items-center gap-1 text-[#3b82f6] text-[13px] font-semibold hover:underline"
                          >
                            <Plus size={13} /> Agregar primer servicio
                          </Link>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {ev.bookings.map((b) => {
                            const svc   = b.services;
                            const imgs  = [...(svc?.service_images ?? [])].sort((a, c) => a.display_order - c.display_order);
                            const thumb = imgs[0]?.url ?? null;
                            const bst   = BOOKING_STATUS[b.status] ?? BOOKING_STATUS.pending;
                            const price = b.quoted_price ?? svc?.base_price ?? null;
                            const isUnlinking = unlinkingId === b.id;

                            return (
                              <div key={b.id} className="flex items-center gap-4 px-6 py-4">
                                {/* Thumbnail */}
                                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                  {thumb ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={thumb} alt={svc?.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Calendar size={16} className="text-gray-300" />
                                    </div>
                                  )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-gray-900 text-[14px] font-semibold truncate">{svc?.title ?? "Servicio"}</p>
                                  <p className="text-gray-400 text-[12px] mt-0.5">
                                    {svc?.service_categories?.name ?? "—"}
                                    {price != null && ` · ${formatPrice(price)}`}
                                  </p>
                                </div>

                                {/* Status */}
                                <div
                                  className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0"
                                  style={{ color: bst.color, background: bst.bg }}
                                >
                                  {bst.label}
                                </div>

                                {/* Actions */}
                                {isUnlinking ? (
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-gray-500 text-[12px]">¿Desvincular?</span>
                                    <button
                                      onClick={() => handleUnlink(b.id)}
                                      disabled={unlinkLoading}
                                      className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1 cursor-pointer hover:bg-red-100 transition-colors border-solid disabled:opacity-50"
                                    >
                                      {unlinkLoading ? "..." : "Sí"}
                                    </button>
                                    <button
                                      onClick={() => setUnlinkingId(null)}
                                      className="text-[11px] font-bold text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 cursor-pointer hover:bg-gray-100 transition-colors border-solid"
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 shrink-0">
                                    {svc?.id && (
                                      <Link href={`/servicios/${svc.id}`} className="text-gray-300 hover:text-[#3b82f6] transition-colors">
                                        <ChevronRight size={16} />
                                      </Link>
                                    )}
                                    <button
                                      onClick={() => setUnlinkingId(b.id)}
                                      title="Desvincular servicio"
                                      className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none p-0.5"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Footer CTA */}
                      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <Link
                          href={catalogHref}
                          className="text-[#3b82f6] text-[13px] font-semibold hover:underline flex items-center gap-1"
                        >
                          <Plus size={13} /> Agregar servicio
                        </Link>
                        <span className="text-gray-300 text-[12px]">{total} servicio{total !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── RESERVAS ─────────────────────────────────────── */}
        {active === "reservas" && (
          <div>
            <div className="flex gap-3.5 mb-6">
              {[
                { label: "Total reservas",  value: bookings.length,            sub: "Historial completo" },
                { label: "Activas",         value: activeCount,                sub: "En proceso",        color: "#3b82f6" },
                { label: "Pendientes",      value: pendingCount,               sub: "Por confirmar",     color: "#b45309" },
                { label: "Total invertido", value: formatPrice(totalInvested), sub: "Soles peruanos"   },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5 flex-1">
                  <div className="text-gray-500 text-[12px] uppercase tracking-[0.6px] font-semibold mb-2.5">{stat.label}</div>
                  <div className="text-[28px] font-black leading-none" style={{ color: stat.color ?? "#3b82f6" }}>{stat.value}</div>
                  {stat.sub && <div className="text-gray-500 text-[12px] mt-1.5">{stat.sub}</div>}
                </div>
              ))}
            </div>

            {pendingCount > 0 && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5 mb-4">
                <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-amber-800 text-[13px] font-semibold leading-snug">
                    {pendingCount === 1
                      ? "Tienes 1 reserva pendiente de confirmación"
                      : `Tienes ${pendingCount} reservas pendientes de confirmación`}
                  </p>
                  <p className="text-amber-700 text-[12px] mt-0.5 leading-relaxed">
                    El pago se solicitará únicamente cuando el proveedor acepte tu solicitud.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-gray-900 text-[16px] font-bold">Historial de reservas</h3>
              </div>

              {bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Calendar size={24} className="text-gray-300 mb-3" />
                  <p className="text-gray-500 text-[15px] font-semibold mb-1">Aún no tienes reservas</p>
                  <p className="text-gray-400 text-[13px] mb-5">Crea un evento y agrega servicios desde la pestaña Mis eventos</p>
                  <button
                    onClick={() => setActive("eventos")}
                    className="bg-[#3b82f6] text-white rounded-xl px-5 py-2.5 text-[14px] font-bold hover:bg-[#2563eb] transition-colors border-none cursor-pointer"
                  >
                    Ir a Mis eventos
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {bookings.map((b) => {
                    const svc    = b.services;
                    const thumb  = svc?.service_images?.[0]?.url ?? null;
                    const status = STATUS_LABELS[b.status] ?? STATUS_LABELS.pending;
                    const price  = b.quoted_price ?? svc?.base_price ?? 0;
                    const date   = new Date(b.event_date + "T00:00:00").toLocaleDateString("es-PE", {
                      day: "numeric", month: "long", year: "numeric",
                    });

                    return (
                      <div key={b.id} className="flex flex-col px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                            {thumb
                              ? <img src={thumb} alt={svc?.title} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><Calendar size={20} className="text-gray-300" /></div>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 text-[14px] font-bold truncate">{svc?.title ?? "Servicio"}</p>
                            <p className="text-gray-500 text-[12px] mt-0.5">{svc?.service_categories?.name ?? "—"} · {svc?.providers?.business_name ?? "—"}</p>
                            <p className="text-gray-400 text-[12px] mt-0.5">{date}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-gray-900 text-[14px] font-black">{formatPrice(price)}</p>
                          </div>
                          <div
                            className="px-3 py-1 rounded-full text-[12px] font-bold shrink-0"
                            style={{ color: status.color, background: status.bg }}
                          >
                            {status.label}
                          </div>
                        </div>
                        {b.status === "pending" && (
                          <div className="flex items-center gap-2 mt-2.5 ml-[72px]">
                            <CreditCard size={12} className="text-amber-500 shrink-0" />
                            <p className="text-amber-600 text-[11px] font-medium">
                              El pago se solicitará cuando el proveedor confirme tu reserva
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PERFIL ───────────────────────────────────────── */}
        {active === "perfil" && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-[520px]">
            <h2 className="text-gray-900 text-[18px] font-black mb-6">Información de la cuenta</h2>
            <div className="flex flex-col gap-5">
              {[
                { label: "Nombre completo",    value: profile?.full_name ?? "—"  },
                { label: "Correo electrónico", value: profile?.email ?? "—"      },
                { label: "Teléfono",           value: profile?.phone ?? "—"      },
                { label: "Tipo de cuenta",     value: "Organizador"               },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-gray-400 text-[12px] font-semibold uppercase tracking-[0.6px] mb-1">{label}</div>
                  <div className="text-gray-900 text-[15px] font-semibold">{value}</div>
                  <div className="h-px bg-gray-100 mt-4" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CONTRATOS / PAGOS ────────────────────────────── */}
        {(active === "contratos" || active === "pagos") && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              {active === "contratos"
                ? <FileText size={28} className="text-gray-400" />
                : <CreditCard size={28} className="text-gray-400" />}
            </div>
            <h3 className="text-gray-500 text-[16px]">Sección en construcción</h3>
            <p className="text-gray-400 text-[13px] mt-1">Disponible próximamente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
