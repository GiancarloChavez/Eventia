import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createSupabaseServer(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { paymentMethodId } = await request.json() as { paymentMethodId: string };
  if (!paymentMethodId) {
    return NextResponse.json({ error: "paymentMethodId requerido." }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", session.user.id)
    .single();

  const stripe  = getStripe();
  const pm      = await stripe.paymentMethods.retrieve(paymentMethodId);
  const card    = pm.card;

  if (profile?.stripe_customer_id) {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: profile.stripe_customer_id,
    });
    await stripe.customers.update(profile.stripe_customer_id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  }

  const { error: dbError } = await supabase
    .from("profiles")
    .update({
      stripe_payment_method_id: paymentMethodId,
      stripe_card_last4:        card?.last4 ?? null,
      stripe_card_brand:        card?.brand ?? null,
    })
    .eq("id", session.user.id);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
