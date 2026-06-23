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

// GET /api/provider/bookings — returns all booking requests for the logged-in provider
export async function GET() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServer(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const db = admin();

  const { data: provider } = await db
    .from("providers")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!provider) return NextResponse.json({ error: "No es proveedor" }, { status: 403 });

  const { data: services } = await db
    .from("services")
    .select("id")
    .eq("provider_id", provider.id);
  const serviceIds = (services ?? []).map((s: { id: string }) => s.id);

  if (serviceIds.length === 0) return NextResponse.json({ bookings: [] });

  const { data: bookings, error } = await db
    .from("bookings")
    .select(`
      id, event_date, status, quoted_price, created_at, notes,
      services ( title ),
      profiles ( full_name, email )
    `)
    .in("service_id", serviceIds)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ bookings: bookings ?? [] });
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

  // Verify this booking belongs to one of the provider's services
  const { data: booking } = await db
    .from("bookings")
    .select("service_id, services ( provider_id, providers ( user_id ) )")
    .eq("id", id)
    .single();

  const providerUserId =
    (booking?.services as { providers?: { user_id: string } } | null)?.providers?.user_id;

  if (providerUserId !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { error } = await db.from("bookings").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
