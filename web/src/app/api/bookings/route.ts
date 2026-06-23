import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const { service_id, event_date, quoted_price } = await request.json();

  if (!service_id || !event_date) {
    return NextResponse.json({ error: "Faltan datos: service_id y event_date son requeridos." }, { status: 400 });
  }

  // Verify user server-side (reads session from cookies)
  const cookieStore = await cookies();
  const supabase = createSupabaseServer(cookieStore);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado. Inicia sesión para reservar." }, { status: 401 });
  }

  // Insert using admin client to bypass RLS (user is already verified above)
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: insertError } = await admin.from("bookings").insert({
    client_id:    user.id,
    service_id,
    event_date,
    status:       "pending",
    quoted_price: quoted_price ?? null,
  });

  if (insertError) {
    console.error("[api/bookings] insert error:", insertError.message);
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
