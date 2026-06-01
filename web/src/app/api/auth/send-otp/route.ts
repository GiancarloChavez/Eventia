import { createSupabaseServer } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createSupabaseServer(cookieStore);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  if (error) {
    console.error("[send-otp] error:", error.message);
    return NextResponse.json({ error: "Error al enviar el código. Intenta de nuevo." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
