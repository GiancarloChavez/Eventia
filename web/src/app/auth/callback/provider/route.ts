import { createClient } from "@supabase/supabase-js";
import { createSupabaseServer } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=auth_callback_error`);
  }

  const cookieStore = await cookies();
  const supabase = createSupabaseServer(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !user) {
    return NextResponse.redirect(`${origin}/auth?error=auth_callback_error`);
  }

  try {
    await supabase.auth.updateUser({ data: { role: "provider" } });
    await supabase.from("profiles").update({ role: "provider" }).eq("id", user.id);

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await adminSupabase
      .from("providers")
      .upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });
  } catch (e) {
    console.error("[provider callback] setup error:", e);
  }

  return NextResponse.redirect(`${origin}/proveedor`);
}
