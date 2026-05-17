const MAP: Record<string, { bg: string; color: string; border: string }> = {
  Local:      { bg: "#fef3c7", color: "#b45309", border: "#fde68a" },
  Fotografía: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  Música:     { bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" },
  Decoración: { bg: "#fdf2f8", color: "#be185d", border: "#fbcfe8" },
};

export function CategoryBadge({ label }: { label: string }) {
  const s = MAP[label] ?? MAP["Local"];
  return (
    <span
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
      className="inline-block px-2 py-0.5 border rounded-xl text-[11px] font-bold"
    >
      {label}
    </span>
  );
}
