import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const admin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: NextRequest) {
  const { email, full_name, password, role, phone } = await request.json();

  if (!email || !full_name || !password || !role) {
    return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
  }

  const db = admin();

  // Create user (unconfirmed — email not yet verified)
  const { data: { user }, error: createError } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { full_name, role, ...(phone ? { phone } : {}) },
  });

  if (createError || !user) {
    const msg = createError?.message?.includes("already registered")
      ? "Este correo ya tiene una cuenta. Inicia sesión."
      : (createError?.message ?? "Error al crear la cuenta.");
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Set up profile + providers row
  await db.from("profiles").upsert(
    { id: user.id, full_name, role, phone: phone ?? null },
    { onConflict: "id" }
  );

  if (role === "provider") {
    await db.from("providers").upsert(
      { user_id: user.id, business_name: "", status: "draft" },
      { onConflict: "user_id", ignoreDuplicates: true }
    );
  }

  // Generate and store a 6-digit OTP (15-minute expiry)
  const code = randomCode();
  await db.from("email_verifications").upsert(
    { user_id: user.id, code, expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() },
    { onConflict: "user_id" }
  );

  // Send the code via Resend (no SMTP config needed)
  const { error: emailError } = await resend.emails.send({
    from: "Eventia <onboarding@resend.dev>",
    to: email,
    subject: `${code} es tu código de verificación — Eventia`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="font-size:22px;font-weight:800;color:#111;margin-bottom:8px">Verifica tu correo</h2>
        <p style="color:#555;font-size:15px;margin-bottom:24px">
          Usa este código para confirmar tu cuenta en Eventia. Expira en 15 minutos.
        </p>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px">
          <span style="font-size:40px;font-weight:900;letter-spacing:10px;color:#111">${code}</span>
        </div>
        <p style="color:#9ca3af;font-size:13px">Si no creaste una cuenta en Eventia, ignora este correo.</p>
      </div>
    `,
  });

  if (emailError) {
    // Clean up user if email couldn't be sent
    await db.auth.admin.deleteUser(user.id);
    return NextResponse.json({ error: "No se pudo enviar el correo. Intenta de nuevo." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, user_id: user.id });
}
