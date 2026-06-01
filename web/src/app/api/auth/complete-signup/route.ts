import { createClient } from "@supabase/supabase-js";
import { createSupabaseServer } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { email, full_name, password, role, otp_id, phone } = await request.json();

  if (!email || !full_name || !password || !otp_id || !role) {
    return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Validar que el OTP fue verificado y no consumido
  const { data: otpRecord } = await adminSupabase
    .from("email_otps")
    .select("id, email, verified, used")
    .eq("id", otp_id)
    .single();

  if (!otpRecord || !otpRecord.verified || otpRecord.used || otpRecord.email !== email) {
    return NextResponse.json(
      { error: "Verificación inválida. Comienza el proceso de nuevo." },
      { status: 400 }
    );
  }

  // Consumir el OTP (uso único)
  await adminSupabase.from("email_otps").update({ used: true }).eq("id", otp_id);

  const userMeta = { full_name, role, ...(phone ? { phone } : {}) };

  // Detectar si el usuario ya existe (intento previo abandonado)
  const { data: existingId } = await adminSupabase
    .rpc("get_user_id_by_email", { p_email: email });

  let userId: string;

  if (existingId) {
    const { error } = await adminSupabase.auth.admin.updateUserById(existingId, {
      password,
      email_confirm: true,
      user_metadata: userMeta,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await adminSupabase
      .from("profiles")
      .update({ full_name, role, phone: phone ?? null })
      .eq("id", existingId);

    userId = existingId;
  } else {
    const { data: newUser, error } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: userMeta,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    userId = newUser.user!.id;

    // El trigger handle_new_user crea el perfil y la fila en providers (si role=provider).
    // Lo actualizamos por si el trigger corrió con datos incompletos.
    await adminSupabase
      .from("profiles")
      .update({ full_name, role, phone: phone ?? null })
      .eq("id", userId);
  }

  // Garantizar fila en providers (el trigger puede no haberla creado si el role fue 'client' al inicio)
  if (role === "provider") {
    await adminSupabase
      .from("providers")
      .upsert(
        { user_id: userId, business_name: "", status: "pending" },
        { onConflict: "user_id", ignoreDuplicates: true }
      );
  }

  // Iniciar sesión para crear la cookie de sesión en la respuesta
  const cookieStore = await cookies();
  const supabase = createSupabaseServer(cookieStore);
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    return NextResponse.json(
      { error: "Cuenta creada, pero error al iniciar sesión. Intenta ingresar manualmente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
