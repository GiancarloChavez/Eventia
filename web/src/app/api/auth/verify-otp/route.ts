import { createSupabaseServer } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { email, code } = await request.json();

  if (!email || !code || code.length !== 6) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createSupabaseServer(cookieStore);

  // El OTP fue generado con type 'magiclink', se verifica con el mismo tipo
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "magiclink",
  });

  if (error) {
    console.error("[verify-otp] error:", error.message);
    return NextResponse.json({ error: "Código incorrecto o expirado." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
