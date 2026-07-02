import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminDb } from "@/lib/supabase-admin";
import {
  ArrowLeft, Building2, MapPin, Phone, FileText,
  Tag, DollarSign, Users, Clock,
} from "lucide-react";
import { ProviderActions } from "./_actions";

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  pending:  { label: "Pendiente",  classes: "bg-amber-100 text-amber-800"   },
  approved: { label: "Aprobado",   classes: "bg-green-100 text-green-800"   },
  rejected: { label: "Rechazado",  classes: "bg-red-100 text-red-800"       },
  draft:    { label: "Borrador",   classes: "bg-gray-100 text-gray-600"     },
  suspended:{ label: "Suspendido", classes: "bg-orange-100 text-orange-800" },
};

type ServiceImage = { url: string; is_cover: boolean; display_order: number };
type Service = {
  id: string; title: string; description: string | null;
  pricing_type: string; base_price: number | null; location: string | null;
  capacity_min: number | null; capacity_max: number | null; event_types: string[] | null;
  category: { name: string } | null; images: ServiceImage[];
};
type Provider = {
  id: string; user_id: string; business_name: string; description: string | null;
  ruc: string | null; city: string | null; phone: string | null;
  status: string; rejection_reason: string | null; created_at: string;
  profile: { full_name: string; phone: string | null } | null;
  category: { name: string } | null; services: Service[];
};

async function fetchProvider(id: string): Promise<Provider | null> {
  const { data, error } = await getAdminDb()
    .from("providers")
    .select(`
      id, user_id, business_name, description, ruc, city, phone,
      status, rejection_reason, created_at,
      profile:profiles!user_id(full_name, phone),
      category:service_categories!category_id(name, slug),
      services(
        id, title, description, pricing_type, base_price,
        location, capacity_min, capacity_max, event_types,
        category:service_categories!category_id(name, slug),
        images:service_images(url, is_cover, display_order)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as unknown as Provider;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-gray-500" />
      </div>
      <div>
        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-900 font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default async function ProviderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = await fetchProvider(id);
  if (!provider) notFound();

  const service = provider.services?.[0] ?? null;
  const badge = STATUS_BADGE[provider.status] ?? { label: provider.status, classes: "bg-gray-100 text-gray-600" };
  const date = new Date(provider.created_at).toLocaleDateString("es-PE", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const sortedImages = [...(service?.images ?? [])].sort((a, b) => a.display_order - b.display_order);
  const canReview = provider.status === "pending";

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/proveedores" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 font-semibold transition-colors">
          <ArrowLeft size={13} /> Proveedores
        </Link>
        <span className="text-gray-300">›</span>
        <span className="text-gray-400">{provider.business_name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{provider.business_name}</h1>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${badge.classes}`}>{badge.label}</span>
          </div>
          <p className="text-gray-500 text-sm">Solicitud enviada el {date}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 text-[15px] mb-4">Información del negocio</h2>
            <div className="space-y-4">
              <InfoRow icon={Building2} label="Negocio"    value={provider.business_name} />
              <InfoRow icon={Tag}       label="Categoría"  value={provider.category?.name} />
              <InfoRow icon={MapPin}    label="Ciudad"     value={provider.city} />
              <InfoRow icon={Phone}     label="Teléfono"   value={provider.phone} />
              <InfoRow icon={FileText}  label="RUC"        value={provider.ruc} />
            </div>
            {provider.description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-2">Descripción</p>
                <p className="text-sm text-gray-700 leading-relaxed">{provider.description}</p>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 text-[15px] mb-4">Propietario</h2>
            <div className="space-y-4">
              <InfoRow icon={Users} label="Nombre completo" value={provider.profile?.full_name} />
              <InfoRow icon={Phone} label="Teléfono"        value={provider.profile?.phone} />
            </div>
          </div>

          {provider.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h2 className="font-bold text-red-800 text-[15px] mb-2">Rechazo anterior</h2>
              <p className="text-red-700 text-sm leading-relaxed">{provider.rejection_reason}</p>
            </div>
          )}
        </div>

        {/* Columna derecha */}
        <div className="space-y-5">
          {service ? (
            <>
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="font-bold text-gray-900 text-[15px] mb-4">Servicio ofrecido</h2>
                <div className="space-y-4">
                  <InfoRow icon={Tag}        label="Nombre"     value={service.title} />
                  <InfoRow icon={Tag}        label="Categoría"  value={service.category?.name} />
                  <InfoRow icon={MapPin}     label="Ubicación"  value={service.location} />
                  <InfoRow
                    icon={DollarSign}
                    label="Precio base"
                    value={service.pricing_type === "fixed" && service.base_price
                      ? `S/ ${Number(service.base_price).toLocaleString("es-PE")}`
                      : "Por cotización"}
                  />
                  {(service.capacity_min || service.capacity_max) && (
                    <InfoRow icon={Users} label="Capacidad"
                      value={`${service.capacity_min ?? "?"} – ${service.capacity_max ?? "?"} personas`} />
                  )}
                  {service.event_types && service.event_types.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Clock size={13} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Tipos de evento</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {service.event_types.map((et) => (
                            <span key={et} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                              {et}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {service.description && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-2">Descripción</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{service.description}</p>
                  </div>
                )}
              </div>

              {/* Fotos */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="font-bold text-gray-900 text-[15px] mb-4">
                  Fotos <span className="text-gray-400 font-normal text-sm">({sortedImages.length})</span>
                </h2>
                {sortedImages.length === 0 ? (
                  <p className="text-gray-400 text-sm">Sin fotos subidas</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {sortedImages.map((img, i) => (
                      <a key={i} href={img.url} target="_blank" rel="noopener noreferrer" className="relative block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={`Foto ${i + 1}`}
                          className="w-full h-36 object-cover rounded-xl border border-gray-100 hover:opacity-90 transition-opacity" />
                        {img.is_cover && (
                          <span className="absolute top-2 left-2 text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-full">
                            Portada
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center py-14">
              <Tag size={24} className="text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">Sin servicio configurado aún</p>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      {canReview && <ProviderActions providerId={provider.id} />}
      {!canReview && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Este proveedor ya fue <strong>{badge.label.toLowerCase()}</strong>. No hay acciones disponibles.
          </p>
        </div>
      )}
    </div>
  );
}
