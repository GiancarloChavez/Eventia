import { createClient } from "@supabase/supabase-js";
import { createSupabaseServer } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { email, full_name, password, role, phone } = await request.json();

  if (!email || !full_name || !password || !role) {
    return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createSupabaseServer(cookieStore);

  // Session was established by verify-otp
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Sesión expirada. Vuelve a verificar tu correo." },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  // Set password and metadata on the authenticated user
  const { error: updateError } = await supabase.auth.updateUser({
    password,
    data: { full_name, role, ...(phone ? { phone } : {}) },
  });

  if (updateError) {
    console.error("[complete-signup] updateUser error:", updateError.message);
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Update profile (created by handle_new_user trigger)
  await adminSupabase
    .from("profiles")
    .update({ full_name, role, phone: phone ?? null })
    .eq("id", userId);

  // Ensure providers row exists for provider role
  if (role === "provider") {
    await adminSupabase
      .from("providers")
      .upsert(
        { user_id: userId, business_name: "", status: "draft" },
        { onConflict: "user_id", ignoreDuplicates: true }
      );
  }

  // Re-sign in to get a fresh session with the new password
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    console.error("[complete-signup] signIn error:", signInError.message);
    return NextResponse.json(
      { error: "Cuenta creada, pero error al iniciar sesión. Intenta ingresar manualmente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
