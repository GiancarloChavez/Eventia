import { ShieldCheck } from "lucide-react";
import { AdminNavbar } from "@/components/admin-navbar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
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
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {children}
      </main>
    </div>
  );
}
