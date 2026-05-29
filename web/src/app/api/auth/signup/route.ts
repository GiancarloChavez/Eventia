import { createSupabaseServer } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { email, password, full_name, role, resend } = await request.json();
  const { origin } = new URL(request.url);

  const cookieStore = await cookies();
  const supabase = createSupabaseServer(cookieStore);

  const callbackPath =
    role === "provider" ? "/auth/callback/provider" : "/auth/callback/login";

  let error;

  if (resend) {
    ({ error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${origin}${callbackPath}` },
    }));
  } else {
    ({ error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}${callbackPath}`,
        data: { full_name, role },
      },
    }));
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
