import Link from "next/link";
import { getAdminDb } from "@/lib/supabase-admin";
import { Clock, CheckCircle, XCircle, Building2, MapPin, Calendar } from "lucide-react";

const STATUS_TABS = [
  { key: "pending",  label: "Pendientes",  icon: Clock,        color: "text-amber-600"  },
  { key: "approved", label: "Aprobados",   icon: CheckCircle,  color: "text-green-600"  },
  { key: "rejected", label: "Rechazados",  icon: XCircle,      color: "text-red-600"    },
  { key: "all",      label: "Todos",       icon: Building2,    color: "text-gray-600"   },
] as const;

type StatusKey = (typeof STATUS_TABS)[number]["key"];

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  pending:  { label: "Pendiente",  classes: "bg-amber-100 text-amber-800"   },
  approved: { label: "Aprobado",   classes: "bg-green-100 text-green-800"   },
  rejected: { label: "Rechazado",  classes: "bg-red-100 text-red-800"       },
  draft:    { label: "Borrador",   classes: "bg-gray-100 text-gray-600"     },
  suspended:{ label: "Suspendido", classes: "bg-orange-100 text-orange-800" },
};

type Provider = {
  id: string;
  business_name: string;
  city: string | null;
  status: string;
  created_at: string;
  profile: { full_name: string } | null;
  category: { name: string } | null;
};

async function getData(status: StatusKey) {
  const db = getAdminDb();

  const [listRes, allRes] = await Promise.all([
    db.from("providers")
      .select(`
        id, business_name, city, status, created_at,
        profile:profiles!user_id(full_name),
        category:service_categories!category_id(name, slug)
      `)
      .eq("status", status === "all" ? undefined! : status)
      .order("created_at", { ascending: false }),
    db.from("providers").select("status"),
  ]);

  const counts: Record<string, number> = { pending: 0, approved: 0, rejected: 0, all: 0 };
  (allRes.data ?? []).forEach((r: { status: string }) => {
    counts.all++;
    if (r.status in counts) counts[r.status]++;
  });

  const providers =
    status === "all"
      ? ((listRes.data ?? []) as unknown as Provider[])
      : ((listRes.data ?? []) as unknown as Provider[]);

  return { providers, counts };
}

export default async function ProveedoresPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: raw } = await searchParams;
  const status: StatusKey = STATUS_TABS.find((t) => t.key === raw)?.key ?? "pending";
  const { providers, counts } = await getData(status);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Proveedores</h1>
        <p className="text-gray-500 text-sm mt-1">Revisa, aprueba o rechaza los perfiles enviados</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        {STATUS_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = status === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/proveedores?status=${tab.key}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                active ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              <Icon size={13} className={active ? "text-white" : tab.color} />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                {counts[tab.key] ?? 0}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Lista */}
      {providers.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl flex flex-col items-center py-20">
          <Building2 size={28} className="text-gray-300 mb-3" />
          <p className="text-gray-400 font-medium text-sm">Sin proveedores en esta categoría</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {providers.map((p) => {
            const badge = STATUS_BADGE[p.status] ?? { label: p.status, classes: "bg-gray-100 text-gray-600" };
            const date = new Date(p.created_at).toLocaleDateString("es-PE", {
              day: "2-digit", month: "short", year: "numeric",
            });
            return (
              <Link
                key={p.id}
                href={`/proveedores/${p.id}`}
                className="bg-white border border-gray-200 rounded-2xl px-6 py-4 flex items-center gap-4 hover:border-gray-300 hover:shadow-sm transition-all group"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #f39e10)" }}
                >
                  {p.business_name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-gray-900 text-[15px] truncate group-hover:text-[#f39e10] transition-colors">
                      {p.business_name}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${badge.classes}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[13px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Building2 size={11} />
                      {p.category?.name ?? "Sin categoría"}
                    </span>
                    {p.city && <span className="flex items-center gap-1"><MapPin size={11} />{p.city}</span>}
                    <span className="flex items-center gap-1"><Calendar size={11} />{date}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[13px] text-gray-500">{p.profile?.full_name ?? "—"}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">Propietario</p>
                </div>

                <span className="text-gray-300 group-hover:text-gray-500 transition-colors ml-1 text-lg">›</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
