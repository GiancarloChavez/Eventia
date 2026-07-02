import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function POST() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServer(cookieStore);
  await supabase.auth.signOut();
  redirect("/auth/login");
}
