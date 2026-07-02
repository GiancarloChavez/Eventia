import { cookies } from "next/headers";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getAdminDb } from "@/lib/supabase-admin";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/resend";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Verificar admin
  const cookieStore = await cookies();
  const supabase = createSupabaseServer(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") return Response.json({ error: "Acceso denegado" }, { status: 403 });

  // 2. Validar body
  const { action, reason } = await req.json() as { action: "approve" | "reject"; reason?: string };

  if (!["approve", "reject"].includes(action)) {
    return Response.json({ error: "Acción inválida" }, { status: 400 });
  }
  if (action === "reject" && !reason?.trim()) {
    return Response.json({ error: "El motivo de rechazo es obligatorio" }, { status: 400 });
  }

  const { id } = await params;
  const db = getAdminDb();

  // 3. Obtener proveedor
  const { data: providerRaw } = await db
    .from("providers")
    .select("id, user_id, business_name, category_id")
    .eq("id", id)
    .single();

  if (!providerRaw) return Response.json({ error: "Proveedor no encontrado" }, { status: 404 });

  const provider = providerRaw as { id: string; user_id: string; business_name: string; category_id: number | null };

  // 4. Actualizar estado
  type ProviderUpdate = {
    status: string;
    rejection_reason: string | null;
    approved_by?: string;
    approved_at?: string;
  };
  const updates: ProviderUpdate =
    action === "approve"
      ? { status: "approved", approved_by: user.id, approved_at: new Date().toISOString(), rejection_reason: null }
      : { status: "rejected", rejection_reason: reason ?? null };

  const { error: updateErr } = await db.from("providers").update(updates).eq("id", id);
  if (updateErr) return Response.json({ error: updateErr.message }, { status: 500 });

  // 5. Obtener nombre de categoría para el email
  let categoryName = "servicios";
  if (provider.category_id) {
    const { data: cat } = await db
      .from("service_categories")
      .select("name")
      .eq("id", provider.category_id)
      .single();
    if (cat) categoryName = (cat as { name: string }).name;
  }

  // 6. Enviar email (best-effort)
  try {
    const { data: authUser } = await db.auth.admin.getUserById(provider.user_id);
    const email = authUser?.user?.email;
    if (email) {
      if (action === "approve") {
        await sendApprovalEmail(email, provider.business_name, categoryName);
      } else {
        await sendRejectionEmail(email, provider.business_name, reason!);
      }
    }
  } catch (err) {
    console.error("[Admin] Error enviando email:", err);
  }

  return Response.json({ ok: true, action });
}
