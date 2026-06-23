import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const admin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function POST(request: NextRequest) {
  const { user_id, code } = await request.json();

  if (!user_id || !code || String(code).length !== 6) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const db = admin();

  const { data: row, error } = await db
    .from("email_verifications")
    .select("code, expires_at")
    .eq("user_id", user_id)
    .single();

  if (error || !row) {
    return NextResponse.json({ error: "Código no encontrado." }, { status: 400 });
  }

  if (new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ error: "El código expiró. Crea tu cuenta de nuevo." }, { status: 400 });
  }

  if (row.code !== String(code)) {
    return NextResponse.json({ error: "Código incorrecto." }, { status: 400 });
  }

  // Confirm the user's email
  await db.auth.admin.updateUserById(user_id, { email_confirm: true });

  // Remove the used code
  await db.from("email_verifications").delete().eq("user_id", user_id);

  return NextResponse.json({ ok: true });
}
