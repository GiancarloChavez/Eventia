import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
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
  if (!session) return NextResponse.redirect(`${origin}/auth`);

  const { data: provider } = await supabase
    .from("providers")
    .select("id, stripe_account_id, onboarding_step")
    .eq("user_id", session.user.id)
    .single();

  if (!provider?.stripe_account_id) {
    return NextResponse.redirect(`${origin}/proveedor/onboarding/pagos`);
  }

  const account = await stripe.accounts.retrieve(provider.stripe_account_id);
  const complete = account.charges_enabled ?? false;

  await supabase
    .from("providers")
    .update({
      stripe_onboarding_complete: complete,
      ...(complete && provider.onboarding_step < 4 ? { onboarding_step: 4 } : {}),
    })
    .eq("id", provider.id);

  if (complete) {
    return NextResponse.redirect(`${origin}/proveedor/onboarding/revision`);
  }

  return NextResponse.redirect(`${origin}/proveedor/onboarding/pagos?incomplete=1`);
}
