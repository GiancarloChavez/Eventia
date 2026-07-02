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

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServer(cookieStore);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = adminDb();
  const { data, error: fetchError } = await admin
    .from("events")
    .select(`
      id, title, event_type, event_date, start_time, end_time,
      guest_count, notes, status, created_at,
      bookings (
        id, status, quoted_price, start_time, end_time,
        services (
          id, title, base_price,
          service_categories ( name ),
          service_images ( url, display_order )
        )
      )
    `)
    .eq("client_id", user.id)
    .order("event_date", { ascending: true });

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 400 });

  return NextResponse.json({ events: data ?? [] });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createSupabaseServer(cookieStore);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { title, event_type, event_date, start_time, end_time, guest_count, notes } = body;
  if (!title || !event_date) {
    return NextResponse.json({ error: "title y event_date son requeridos" }, { status: 400 });
  }

  const admin = adminDb();
  const { data, error: insertError } = await admin
    .from("events")
    .insert({
      client_id: user.id,
      title,
      event_type:  event_type  ?? null,
      event_date,
      start_time:  start_time  ?? null,
      end_time:    end_time    ?? null,
      guest_count: guest_count ?? null,
      notes:       notes       ?? null,
    })
    .select("id")
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  return NextResponse.json({ id: data.id });
}
