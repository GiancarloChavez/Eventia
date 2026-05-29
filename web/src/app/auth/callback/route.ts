import { createSupabaseServer } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Role: URL param (email verification flow) takes priority over cookie (OAuth flow)
  const urlRole  = searchParams.get("role");
  const cookieRole = request.cookies.get("eventia_oauth_role")?.value;
  const role = urlRole ?? cookieRole;

  const defaultNext = role === "provider" ? "/proveedor" : "/";
  const next = searchParams.get("next") ?? defaultNext;

  if (code) {
    const cookieStore = await cookies();
    const supabase = createSupabaseServer(cookieStore);

    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // For OAuth: update both auth metadata and profiles.role so the
      // on_profile_becomes_provider trigger fires and creates the providers row.
      if (role) {
        await supabase.auth.updateUser({ data: { role } });
        await supabase.from("profiles").update({ role }).eq("id", user.id);
      }

      const response = NextResponse.redirect(`${origin}${next}`);
      // Clear the OAuth intent cookie
      response.cookies.set("eventia_oauth_role", "", { maxAge: 0, path: "/" });
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_callback_error`);
}
