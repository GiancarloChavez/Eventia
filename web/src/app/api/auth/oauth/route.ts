import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const flow = searchParams.get("flow"); // "provider" | "login"

  const callbackPath =
    flow === "provider" ? "/auth/callback/provider" : "/auth/callback/login";

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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}${callbackPath}`,
    },
  });

  if (error || !data.url) {
    const errorPath = flow === "provider" ? "/auth" : "/auth/login";
    return NextResponse.redirect(`${origin}${errorPath}?error=oauth_error`);
  }

  return NextResponse.redirect(data.url);
}
