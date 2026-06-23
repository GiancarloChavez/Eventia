import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // user_id is provided by the browser after calling supabase.auth.signUp()
  const { user_id, full_name, role, phone } = await request.json();

  if (!user_id || !full_name || !role) {
    return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Upsert profile (the handle_new_user trigger may not have run yet)
  await adminSupabase
    .from("profiles")
    .upsert(
      { id: user_id, full_name, role, phone: phone ?? null },
      { onConflict: "id" }
    );

  // Create providers row for provider role
  if (role === "provider") {
    await adminSupabase
      .from("providers")
      .upsert(
        { user_id, business_name: "", status: "draft" },
        { onConflict: "user_id", ignoreDuplicates: true }
      );
  }

  return NextResponse.json({ ok: true });
}
