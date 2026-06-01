import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Limpiar OTPs anteriores para este correo
  await adminSupabase
    .from("email_otps")
    .delete()
    .eq("email", email);

  const otp = generateOtp();
  const codeHash = createHash("sha256").update(otp + "|" + email).digest("hex");

  const { error: dbError } = await adminSupabase
    .from("email_otps")
    .insert({ email, code_hash: codeHash });

  if (dbError) {
    console.error("[send-otp] DB error:", dbError);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Eventia <onboarding@resend.dev>",
      to: email,
      subject: `${otp} es tu código de Eventia`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#ffffff">
          <div style="margin-bottom:28px">
            <span style="font-size:22px;font-weight:900;color:#f39e10;letter-spacing:-0.5px">Eventia</span>
          </div>
          <h2 style="font-size:20px;font-weight:800;color:#111827;margin:0 0 8px 0">
            Código de verificación
          </h2>
          <p style="font-size:15px;color:#6b7280;margin:0 0 24px 0;line-height:1.6">
            Ingresa este código para verificar tu correo. Expira en <strong>10 minutos</strong>.
          </p>
          <div style="background:#fffbeb;border:1.5px solid #fde68a;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px">
            <span style="font-size:42px;font-weight:900;letter-spacing:14px;color:#d97706;font-family:monospace">
              ${otp}
            </span>
          </div>
          <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:0">
            Si no solicitaste este código, ignora este mensaje.
          </p>
        </div>
      `,
    }),
  });

  if (!resendRes.ok) {
    const resendErr = await resendRes.json().catch(() => ({}));
    console.error("[send-otp] Resend error:", resendErr);
    return NextResponse.json({ error: "Error al enviar el correo." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
