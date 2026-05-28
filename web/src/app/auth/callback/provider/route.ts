import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Handles OAuth + email-verification callbacks for the provider role.
// Using a path segment (/callback/provider) instead of query params
// because Supabase preserves URL path on redirect but may strip query params.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // Set role in both auth metadata and profiles so the
      // on_profile_becomes_provider trigger creates the providers row.
      await supabase.auth.updateUser({ data: { role: "provider" } });
      await supabase.from("profiles").update({ role: "provider" }).eq("id", user.id);

      // Explicitly upsert the providers row so /proveedor always finds it,
      // regardless of whether the DB trigger has fired yet.
      const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await adminSupabase
        .from("providers")
        .upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });

      return NextResponse.redirect(`${origin}/proveedor`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_callback_error`);
}
