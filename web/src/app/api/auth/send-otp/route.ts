import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Genera el OTP via admin — devuelve email_otp (6 dígitos) sin enviarlo por Supabase
  const { data, error } = await adminSupabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (error || !data?.properties?.email_otp) {
    console.error("[send-otp] generateLink error:", error?.message);
    return NextResponse.json(
      { error: "Error al enviar el código. Intenta de nuevo." },
      { status: 500 }
    );
  }

  const code = data.properties.email_otp;

  // Envía el código via Resend
  const { error: emailError } = await resend.emails.send({
    from: "Eventia <onboarding@resend.dev>",
    to: email,
    subject: `${code} — tu código de verificación en Eventia`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:40px 32px;background:#fff">
        <div style="margin-bottom:28px">
          <span style="font-size:22px;font-weight:900;color:#f39e10;letter-spacing:-0.5px">Eventia</span>
        </div>
        <h2 style="font-size:20px;font-weight:800;color:#111827;margin:0 0 8px">Verifica tu correo</h2>
        <p style="color:#6b7280;font-size:14px;margin:0 0 28px;line-height:1.6">
          Ingresa este código en la página de registro para continuar:
        </p>
        <div style="background:#fafafa;border:2px solid #e5e7eb;border-radius:14px;padding:28px 24px;text-align:center;margin-bottom:28px">
          <span style="font-size:44px;font-weight:900;letter-spacing:14px;color:#111827;font-family:monospace">${code}</span>
        </div>
        <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:0">
          Este código expira en 10 minutos.<br>
          Si no solicitaste esto, ignora este correo.
        </p>
      </div>
    `,
  });

  if (emailError) {
    console.error("[send-otp] resend error:", emailError);
    return NextResponse.json(
      { error: "Error al enviar el correo. Intenta de nuevo." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
