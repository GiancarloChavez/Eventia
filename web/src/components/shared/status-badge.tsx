import type { ServiceStatus } from "@/lib/data";

const MAP: Record<ServiceStatus, { bg: string; color: string; border: string }> = {
  Pendiente:  { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  Confirmado: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  Completado: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  Cancelado:  { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
};

export function StatusBadge({ status }: { status: ServiceStatus }) {
  const s = MAP[status] ?? MAP["Pendiente"];
  return (
    <span
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
      className="inline-block px-3 py-0.5 border rounded-full text-[12px] font-semibold"
    >
      {status}
    </span>
  );
}
