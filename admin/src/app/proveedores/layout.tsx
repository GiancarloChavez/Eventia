import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { LogOut, ShieldCheck } from "lucide-react";
import { AdminNavbar } from "@/components/admin-navbar";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createSupabaseServer(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} style={{ color: "#f39e10" }} />
              <span className="font-black text-[17px] tracking-tight text-gray-900">
                Eventia <span style={{ color: "#f39e10" }}>Admin</span>
              </span>
            </div>
            <div className="h-5 w-px bg-gray-200" />
            <AdminNavbar />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-[13px]">{profile?.full_name ?? user.email}</span>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-[13px] transition-colors cursor-pointer border-none bg-transparent"
              >
                <LogOut size={13} />
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {children}
      </main>
    </div>
  );
}
