import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const admin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

// Called after supabase.auth.signUp() succeeds in the browser.
// Sets up the profile row and providers row using the user_id
// returned by signUp — no user creation here.
export async function POST(request: NextRequest) {
  const { user_id, full_name, role, phone } = await request.json();

  if (!user_id || !full_name || !role) {
    return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
  }

  const db = admin();

  await db.from("profiles").upsert(
    { id: user_id, full_name, role, phone: phone ?? null },
    { onConflict: "id" }
  );

  if (role === "provider") {
    await db.from("providers").upsert(
      { user_id, business_name: "", status: "draft" },
      { onConflict: "user_id", ignoreDuplicates: true }
    );
  }

  return NextResponse.json({ ok: true });
}
