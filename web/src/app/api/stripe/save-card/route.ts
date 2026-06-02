import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
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

  const body = await request.json();
  const { paymentMethodId } = body as { paymentMethodId: string };

  if (!paymentMethodId) {
    return NextResponse.json({ error: "paymentMethodId requerido." }, { status: 400 });
  }

  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", session.user.id)
    .single();

  if (!provider) return NextResponse.json({ error: "Proveedor no encontrado." }, { status: 404 });

  // Retrieve card details from Stripe to display later (last4, brand)
  const pm = await getStripe().paymentMethods.retrieve(paymentMethodId);
  const card = pm.card;

  const { error: dbError } = await supabase
    .from("providers")
    .update({
      stripe_payment_method_id: paymentMethodId,
      stripe_card_last4:        card?.last4  ?? null,
      stripe_card_brand:        card?.brand  ?? null,
      onboarding_step:          4,
    })
    .eq("id", provider.id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
