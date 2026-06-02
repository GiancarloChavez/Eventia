import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST() {
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

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const setupIntent = await getStripe().setupIntents.create({
      usage: "off_session",
    });
    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear el setup intent.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
