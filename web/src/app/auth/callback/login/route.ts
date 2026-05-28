import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth_error`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) =>
          cs.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !user) {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth_error`);
  }

  // If the user was created in the last 30 seconds it means Google just auto-registered
  // them — they haven't gone through Eventia's sign-up flow yet.
  const secondsSinceCreation = (Date.now() - new Date(user.created_at).getTime()) / 1000;

  if (secondsSinceCreation < 30) {
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await adminSupabase.auth.admin.deleteUser(user.id);
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/auth/login?error=no_account`);
  }

  // Existing user — redirect to their dashboard.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const dest = profile?.role === "provider" ? "/proveedor" : "/cliente";
  return NextResponse.redirect(`${origin}${dest}`);
}
