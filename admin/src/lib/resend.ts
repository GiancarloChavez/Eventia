import { Resend } from "resend";

let _client: Resend | null = null;

function getResend() {
  if (!_client) _client = new Resend(process.env.RESEND_API_KEY!);
  return _client;
}

const APP_URL = process.env.NEXT_PUBLIC_EVENTIA_URL ?? "http://localhost:3000";
const FROM = "Eventia <noreply@eventia.pe>";

export async function sendApprovalEmail(to: string, providerName: string, categoryName: string) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: "¡Tu perfil en Eventia fue aprobado!",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111827">
        <div style="background:#f39e10;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:22px">Eventia</h1>
        </div>
        <div style="padding:32px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="color:#111827;margin-top:0">¡Felicitaciones, ${providerName}! 🎉</h2>
          <p style="color:#374151;line-height:1.6">
            Tu perfil como proveedor de <strong>${categoryName}</strong> en Eventia ha sido revisado y
            <strong style="color:#16a34a">aprobado</strong>. Ya puedes comenzar a recibir solicitudes de reserva.
          </p>
          <a href="${APP_URL}/proveedor"
             style="display:inline-block;margin-top:16px;padding:12px 28px;background:#f39e10;color:white;
                    text-decoration:none;border-radius:8px;font-weight:700;font-size:15px">
            Ir a mi panel →
          </a>
          <p style="margin-top:32px;color:#6b7280;font-size:13px">Equipo Eventia · Iquitos, Perú</p>
        </div>
      </div>
    `,
  });
}

export async function sendRejectionEmail(to: string, providerName: string, reason: string) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: "Información sobre tu solicitud en Eventia",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111827">
        <div style="background:#f39e10;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:22px">Eventia</h1>
        </div>
        <div style="padding:32px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="color:#111827;margin-top:0">Hola, ${providerName}</h2>
          <p style="color:#374151;line-height:1.6">
            Hemos revisado tu perfil y necesitamos que realices algunos ajustes antes de poder aprobarlo.
          </p>
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:20px 0">
            <p style="margin:0;color:#991b1b;font-size:14px"><strong>Motivo:</strong> ${reason}</p>
          </div>
          <a href="${APP_URL}/proveedor/onboarding/negocio"
             style="display:inline-block;margin-top:8px;padding:12px 28px;background:#f39e10;color:white;
                    text-decoration:none;border-radius:8px;font-weight:700;font-size:15px">
            Actualizar mi perfil →
          </a>
          <p style="margin-top:32px;color:#6b7280;font-size:13px">Equipo Eventia · Iquitos, Perú</p>
        </div>
      </div>
    `,
  });
}
