import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: {
          // Disable auto-exchange so our callback pages control when
          // exchangeCodeForSession is called — avoids double-exchange race.
          detectSessionInUrl: false,
        },
      }
    );
  }
  return _client;
}
