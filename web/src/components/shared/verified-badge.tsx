import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ small = false }: { small?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold whitespace-nowrap",
        "bg-[rgba(243,158,16,0.1)] border-[rgba(243,158,16,0.3)] text-[#f39e10]",
        small ? "text-[11px] px-1.5 py-px" : "text-[12px] px-2 py-0.5"
      )}
    >
      <BadgeCheck size={small ? 11 : 12} />
      Verificado
    </span>
  );
}
