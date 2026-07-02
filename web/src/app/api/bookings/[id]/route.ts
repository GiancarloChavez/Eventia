import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServer } from "@/lib/supabase-server";

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const cookieStore = await cookies();
  const supabase    = createSupabaseServer(cookieStore);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = adminDb();

  const { data: booking } = await admin
    .from("bookings")
    .select("id, client_id")
    .eq("id", id)
    .single();

  if (!booking || booking.client_id !== user.id)
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });

  const { error: deleteError } = await admin.from("bookings").delete().eq("id", id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
