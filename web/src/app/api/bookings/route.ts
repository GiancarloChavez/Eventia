import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const {
    service_id,
    event_date,
    quoted_price,
    client_payment_method_id,
    // event fields
    event_id,
    event_name,
    event_type,
    start_time,
    end_time,
    guest_count,
    notes,
  } = await request.json();

  if (!service_id || !event_date) {
    return NextResponse.json(
      { error: "Faltan datos: service_id y event_date son requeridos." },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const supabase = createSupabaseServer(cookieStore);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado. Inicia sesión para reservar." }, { status: 401 });
  }

  const admin = adminDb();

  // Resolve or create event
  let resolvedEventId: string | null = event_id ?? null;

  if (!resolvedEventId && event_name) {
    const { data: newEvent, error: eventErr } = await admin
      .from("events")
      .insert({
        client_id:   user.id,
        title:       event_name,
        event_type:  event_type  ?? null,
        event_date,
        start_time:  start_time  ?? null,
        end_time:    end_time    ?? null,
        guest_count: guest_count ?? null,
        notes:       notes       ?? null,
      })
      .select("id")
      .single();

    if (eventErr) {
      console.error("[api/bookings] event create error:", eventErr.message);
      return NextResponse.json({ error: eventErr.message }, { status: 400 });
    }
    resolvedEventId = newEvent.id;
  }

  const { error: insertError } = await admin.from("bookings").insert({
    client_id:                user.id,
    service_id,
    event_date,
    status:                   "pending",
    quoted_price:             quoted_price             ?? null,
    client_payment_method_id: client_payment_method_id ?? null,
    event_id:                 resolvedEventId,
    event_type:               event_type               ?? null,
    start_time:               start_time               ?? null,
    end_time:                 end_time                 ?? null,
    guest_count:              guest_count              ?? null,
    notes:                    notes                    ?? null,
  });

  if (insertError) {
    // Roll back orphaned event if we just created it
    if (resolvedEventId && !event_id) {
      await admin.from("events").delete().eq("id", resolvedEventId);
    }
    console.error("[api/bookings] insert error:", insertError.message);
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, event_id: resolvedEventId });
}
