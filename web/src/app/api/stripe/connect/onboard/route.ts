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

  const { data: provider } = await supabase
    .from("providers")
    .select("id, stripe_account_id")
    .eq("user_id", session.user.id)
    .single();

  if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  let accountId = provider.stripe_account_id as string | null;

  if (!accountId) {
    const account = await getStripe().accounts.create({
      type: "express",
      country: "PE",
      email: session.user.email,
    });
    accountId = account.id;
    await supabase
      .from("providers")
      .update({ stripe_account_id: accountId })
      .eq("id", provider.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const accountLink = await getStripe().accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/proveedor/onboarding/pagos`,
    return_url: `${appUrl}/api/stripe/connect/callback`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
