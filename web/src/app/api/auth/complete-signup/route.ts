import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { email, full_name, password, role, phone } = await request.json();

  if (!email || !full_name || !password || !role) {
    return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Create user directly — bypasses email confirmation entirely
  const { data: { user }, error: createError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role, ...(phone ? { phone } : {}) },
  });

  if (createError || !user) {
    console.error("[complete-signup] createUser error:", createError?.message);
    const msg = createError?.message?.includes("already registered")
      ? "Este correo ya tiene una cuenta. Inicia sesión."
      : (createError?.message ?? "Error al crear la cuenta.");
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Update profile row (created by handle_new_user trigger)
  await adminSupabase
    .from("profiles")
    .update({ full_name, role, phone: phone ?? null })
    .eq("id", user.id);

  // Create providers row for provider role
  if (role === "provider") {
    await adminSupabase
      .from("providers")
      .upsert(
        { user_id: user.id, business_name: "", status: "draft" },
        { onConflict: "user_id", ignoreDuplicates: true }
      );
  }

  return NextResponse.json({ ok: true });
}
