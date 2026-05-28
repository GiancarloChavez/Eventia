import Stripe from "stripe";

let _client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_client) {
    _client = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _client;
}
