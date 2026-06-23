import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServer(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", session.user.id)
    .single();

  const stripe = getStripe();
  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email:    session.user.email,
      metadata: { user_id: session.user.id },
    });
    customerId = customer.id;
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", session.user.id);
  }

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    usage:    "off_session",
  });

  return NextResponse.json({ clientSecret: setupIntent.client_secret });
}
