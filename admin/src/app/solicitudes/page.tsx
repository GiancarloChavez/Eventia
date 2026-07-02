import Link from "next/link";
import { getAdminDb } from "@/lib/supabase-admin";
import { FileText, Clock, CheckCircle, XCircle, Calendar, Tag, Users } from "lucide-react";

const STATUS_TABS = [
  { key: "all",       label: "Todas",       Icon: FileText,    color: "text-gray-600"  },
  { key: "pending",   label: "Pendientes",  Icon: Clock,       color: "text-amber-600" },
  { key: "confirmed", label: "Confirmadas", Icon: CheckCircle, color: "text-green-600" },
  { key: "cancelled", label: "Canceladas",  Icon: XCircle,     color: "text-red-600"   },
] as const;

type StatusKey = (typeof STATUS_TABS)[number]["key"];

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  pending:   { label: "Pendiente",  classes: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Confirmada", classes: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelada",  classes: "bg-red-100 text-red-800"     },
  completed: { label: "Completada", classes: "bg-blue-100 text-blue-800"   },
};

type BookingRow = {
  id: string;
  event_date: string;
  event_id: string | null;
  start_time: string | null;
  end_time: string | null;
  guest_count: number | null;
  status: string;
  quoted_price: number | null;
  created_at: string;
  client_id: string;
  service_id: string;
  service_title: string | null;
  provider_name: string | null;
  client_name: string | null;
  event_title: string | null;
  event_type: string | null;
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

async function getData(status: StatusKey) {
  const db = getAdminDb();

  const [{ data: allBookings }, filteredRes] = await Promise.all([
    db.from("bookings").select("status"),
    status === "all"
      ? db.from("bookings").select("id,event_date,event_id,start_time,end_time,guest_count,status,quoted_price,created_at,client_id,service_id").order("created_at", { ascending: false })
      : db.from("bookings").select("id,event_date,event_id,start_time,end_time,guest_count,status,quoted_price,created_at,client_id,service_id").eq("status", status).order("created_at", { ascending: false }),
  ]);

  const counts: Record<string, number> = { all: 0, pending: 0, confirmed: 0, cancelled: 0, completed: 0 };
  (allBookings ?? []).forEach((b: { status: string }) => {
    counts.all++;
    if (b.status in counts) counts[b.status]++;
  });

  const bookings = filteredRes.data ?? [];
  if (!bookings.length) return { bookings: [] as BookingRow[], counts };

  const serviceIds = [...new Set(bookings.map((b) => b.service_id as string))];
  const clientIds  = [...new Set(bookings.map((b) => b.client_id  as string))];
  const eventIds   = [...new Set(bookings.map((b) => b.event_id as string | null).filter(Boolean))] as string[];

  const { data: services } = await db
    .from("services")
    .select("id, title, provider_id")
    .in("id", serviceIds);

  const providerIds = [...new Set((services ?? []).map((s: { provider_id: string }) => s.provider_id))];

  const [{ data: providers }, { data: profiles }, { data: eventsData }] = await Promise.all([
    db.from("providers").select("id, business_name").in("id", providerIds),
    db.from("profiles").select("id, full_name").in("id", clientIds),
    eventIds.length > 0
      ? db.from("events").select("id, title, event_type").in("id", eventIds)
      : Promise.resolve({ data: [] }),
  ]);

  const providerMap: Record<string, string> = Object.fromEntries(
    (providers ?? []).map((p: { id: string; business_name: string }) => [p.id, p.business_name])
  );
  const serviceMap: Record<string, { title: string; providerName: string | null }> = Object.fromEntries(
    (services ?? []).map((s: { id: string; title: string; provider_id: string }) => [
      s.id,
      { title: s.title, providerName: providerMap[s.provider_id] ?? null },
    ])
  );
  const profileMap: Record<string, string | null> = Object.fromEntries(
    (profiles ?? []).map((p: { id: string; full_name: string | null }) => [p.id, p.full_name])
  );
  const eventMap: Record<string, { title: string; event_type: string | null }> = Object.fromEntries(
    (eventsData ?? []).map((e: { id: string; title: string; event_type: string | null }) => [e.id, { title: e.title, event_type: e.event_type }])
  );

  const result: BookingRow[] = bookings.map((b) => ({
    id:            b.id,
    event_date:    b.event_date,
    event_id:      b.event_id      ?? null,
    start_time:    b.start_time    ?? null,
    end_time:      b.end_time      ?? null,
    guest_count:   b.guest_count   ?? null,
    status:        b.status,
    quoted_price:  b.quoted_price,
    created_at:    b.created_at,
    client_id:     b.client_id,
    service_id:    b.service_id,
    service_title: serviceMap[b.service_id]?.title        ?? null,
    provider_name: serviceMap[b.service_id]?.providerName ?? null,
    client_name:   profileMap[b.client_id]               ?? null,
    event_title:   b.event_id ? (eventMap[b.event_id]?.title ?? null) : null,
    event_type:    b.event_id ? (eventMap[b.event_id]?.event_type ?? null) : null,
  }));

  return { bookings: result, counts };
}

export default async function SolicitudesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: raw } = await searchParams;
  const status: StatusKey = STATUS_TABS.find((t) => t.key === raw)?.key ?? "all";
  const { bookings, counts } = await getData(status);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Solicitudes</h1>
        <p className="text-gray-500 text-sm mt-1">Reservas realizadas en la plataforma</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        {STATUS_TABS.map((tab) => {
          const active = status === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/solicitudes?status=${tab.key}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                active ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              <tab.Icon size={13} className={active ? "text-white" : tab.color} />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                {counts[tab.key] ?? 0}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Lista */}
      {bookings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl flex flex-col items-center py-20">
          <FileText size={28} className="text-gray-300 mb-3" />
          <p className="text-gray-400 font-medium text-sm">Sin solicitudes en esta categoría</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-[15px]">Solicitudes de reserva</h3>
            <p className="text-gray-400 text-[13px] mt-0.5">
              {bookings.length} solicitud{bookings.length !== 1 ? "es" : ""}
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {bookings.map((b) => {
              const badge = STATUS_BADGE[b.status] ?? { label: b.status, classes: "bg-gray-100 text-gray-600" };
              const eventDate = new Date(b.event_date + "T00:00:00").toLocaleDateString("es-PE", {
                day: "numeric", month: "long", year: "numeric",
              });
              const createdDate = new Date(b.created_at).toLocaleDateString("es-PE", {
                day: "2-digit", month: "short", year: "numeric",
              });
              const clientInitial = (b.client_name ?? "C")[0].toUpperCase();

              return (
                <div key={b.id} className="px-6 py-4 flex items-center gap-4">
                  {/* Avatar cliente */}
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-black text-[14px]">{clientInitial}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-[14px] font-bold truncate">
                      {b.client_name ?? "Cliente"}
                    </p>

                    {/* Event pill */}
                    {b.event_title && (
                      <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-2 py-1 mt-1 mb-1.5">
                        <Calendar size={10} className="text-blue-500 shrink-0" />
                        <span className="text-blue-700 text-[11px] font-semibold truncate">{b.event_title}</span>
                        {b.event_type && (
                          <span className="text-blue-400 text-[10px]">· {EVENT_TYPE_LABELS[b.event_type] ?? b.event_type}</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-gray-500 text-[12px] flex items-center gap-1 truncate">
                        <Tag size={10} className="shrink-0" />
                        {b.service_title ?? "—"}
                      </span>
                      <span className="text-gray-300 text-[11px]">·</span>
                      <span className="text-gray-400 text-[12px] truncate">{b.provider_name ?? "—"}</span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-gray-400 text-[11px] flex items-center gap-1">
                        <Calendar size={10} className="shrink-0" />{eventDate}
                      </span>
                      {(b.start_time || b.end_time) && (
                        <span className="text-gray-400 text-[11px] flex items-center gap-1">
                          <Clock size={10} className="shrink-0" />
                          {b.start_time ?? ""}{b.start_time && b.end_time ? " – " : ""}{b.end_time ?? ""}
                        </span>
                      )}
                      {b.guest_count && (
                        <span className="text-gray-400 text-[11px] flex items-center gap-1">
                          <Users size={10} className="shrink-0" />{b.guest_count} inv.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Derecha */}
                  <div className="shrink-0 text-right flex flex-col items-end gap-1">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${badge.classes}`}>
                      {badge.label}
                    </span>
                    {b.quoted_price != null && (
                      <span className="text-[#f39e10] text-[13px] font-bold">
                        S/ {b.quoted_price.toLocaleString("es-PE")}
                      </span>
                    )}
                    <span className="text-gray-400 text-[11px]">{createdDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
