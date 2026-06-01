import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { email, code } = await request.json();

  if (!email || !code || code.length !== 6) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const codeHash = createHash("sha256").update(code + "|" + email).digest("hex");

  const { data: record } = await adminSupabase
    .from("email_otps")
    .select("id")
    .eq("email", email)
    .eq("code_hash", codeHash)
    .eq("used", false)
    .eq("verified", false)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!record) {
    return NextResponse.json({ error: "Código incorrecto o expirado." }, { status: 400 });
  }

  await adminSupabase
    .from("email_otps")
    .update({ verified: true })
    .eq("id", record.id);

  return NextResponse.json({ ok: true, otp_id: record.id });
}
