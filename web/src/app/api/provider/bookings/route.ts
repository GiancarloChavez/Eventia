import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

const admin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

// GET /api/provider/bookings
export async function GET() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServer(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const db = admin();

  // 1. Find provider record for this user
  const { data: provider, error: provErr } = await db
    .from("providers")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (provErr || !provider) return NextResponse.json({ error: "No es proveedor" }, { status: 403 });

  // 2. Get all services for this provider
  const { data: services } = await db
    .from("services")
    .select("id, title")
    .eq("provider_id", provider.id);

  const serviceIds = (services ?? []).map((s: { id: string }) => s.id);
  if (serviceIds.length === 0) return NextResponse.json({ bookings: [] });

  const serviceTitleMap: Record<string, string> = {};
  (services ?? []).forEach((s: { id: string; title: string }) => {
    serviceTitleMap[s.id] = s.title;
  });

  // 3. Get bookings — no nested joins to avoid PostgREST FK ambiguity
  const { data: bookings, error: bookErr } = await db
    .from("bookings")
    .select("id, event_date, event_id, event_type, start_time, end_time, guest_count, status, quoted_price, created_at, notes, client_id, service_id")
    .in("service_id", serviceIds)
    .order("created_at", { ascending: false });

  if (bookErr) return NextResponse.json({ error: bookErr.message }, { status: 500 });
  if (!bookings || bookings.length === 0) return NextResponse.json({ bookings: [] });

  // 4. Fetch profiles and events in parallel
  const clientIds = [...new Set(bookings.map((b: { client_id: string }) => b.client_id))];
  const eventIds  = [...new Set(bookings.map((b: { event_id: string | null }) => b.event_id).filter(Boolean))] as string[];

  const [{ data: profiles }, { data: eventsData }] = await Promise.all([
    db.from("profiles").select("id, full_name, phone").in("id", clientIds),
    eventIds.length > 0
      ? db.from("events").select("id, title, event_type, guest_count, start_time, end_time").in("id", eventIds)
      : Promise.resolve({ data: [] }),
  ]);

  const profileMap: Record<string, { full_name: string | null; phone: string | null }> = {};
  (profiles ?? []).forEach((p: { id: string; full_name: string | null; phone: string | null }) => {
    profileMap[p.id] = { full_name: p.full_name, phone: p.phone };
  });

  const eventMap: Record<string, { title: string; event_type: string | null; guest_count: number | null; start_time: string | null; end_time: string | null }> = {};
  (eventsData ?? []).forEach((e: { id: string; title: string; event_type: string | null; guest_count: number | null; start_time: string | null; end_time: string | null }) => {
    eventMap[e.id] = { title: e.title, event_type: e.event_type, guest_count: e.guest_count, start_time: e.start_time, end_time: e.end_time };
  });

  // 5. Merge and return in the shape the frontend expects
  const result = bookings.map((b: {
    id: string; event_date: string; event_id: string | null; event_type: string | null;
    start_time: string | null; end_time: string | null; guest_count: number | null;
    status: string; quoted_price: number | null; created_at: string;
    notes: string | null; client_id: string; service_id: string;
  }) => ({
    id:           b.id,
    event_date:   b.event_date,
    start_time:   b.start_time,
    end_time:     b.end_time,
    guest_count:  b.guest_count,
    status:       b.status,
    quoted_price: b.quoted_price,
    created_at:   b.created_at,
    notes:        b.notes,
    services:     { title: serviceTitleMap[b.service_id] ?? null },
    profiles:     profileMap[b.client_id] ?? { full_name: null, phone: null },
    event:        b.event_id ? (eventMap[b.event_id] ?? null) : null,
  }));

  return NextResponse.json({ bookings: result });
}

// PATCH /api/provider/bookings — update booking status (confirm / cancel)
export async function PATCH(request: NextRequest) {
  const { id, status } = await request.json();
  if (!id || !["confirmed", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createSupabaseServer(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const db = admin();

  // Verify ownership: booking → service → provider → user
  const { data: booking } = await db
    .from("bookings")
    .select("service_id")
    .eq("id", id)
    .single();

  if (!booking) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });

  const { data: service } = await db
    .from("services")
    .select("provider_id")
    .eq("id", booking.service_id)
    .single();

  if (!service) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });

  const { data: provider } = await db
    .from("providers")
    .select("user_id")
    .eq("id", service.provider_id)
    .single();

  if (!provider || provider.user_id !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { error } = await db.from("bookings").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
