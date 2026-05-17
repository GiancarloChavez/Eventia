import Link from "next/link";
import Image from "next/image";

const TRUST = [
  { icon: "✓", text: "+2,400 proveedores verificados" },
  { icon: "✓", text: "+15,000 eventos organizados" },
  { icon: "✓", text: "Pago 100% seguro" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left panel: brand ─────────────────────────────── */}
      <div
        className="hidden lg:flex w-[44%] shrink-0 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          backgroundImage: [
            "linear-gradient(135deg,",
            "  rgba(0,0,0,0.72) 0%,",
            "  rgba(15,10,5,0.55) 50%,",
            "  rgba(243,158,16,0.18) 100%",
            "), url('/hero.jpg')",
          ].join(""),
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Amber glow orb */}
        <div
          className="absolute -bottom-32 -left-32 w-[480px] h-[480px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(243,158,16,0.18) 0%, transparent 70%)" }}
        />

        <Link href="/" className="relative z-10">
          <Image src="/logo-white.png" alt="Eventia" width={160} height={52} style={{ width: "auto", height: "44px" }} />
        </Link>

        <div className="relative z-10">
          <p className="text-white/55 text-[12px] uppercase tracking-[1.5px] font-semibold mb-3">
            La plataforma de eventos #1 en Perú
          </p>
          <h2 className="text-white text-[32px] font-black leading-[1.12] tracking-[-1px] mb-8">
            Conecta tu evento con los mejores proveedores del país
          </h2>
          <div className="flex flex-col gap-3">
            {TRUST.map((t) => (
              <div key={t.text} className="flex items-center gap-3">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
                  style={{ background: "rgba(243,158,16,0.22)", color: "#f39e10" }}
                >
                  {t.icon}
                </span>
                <span className="text-white/70 text-[13px]">{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel: form ──────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-8 py-12 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="Eventia" width={140} height={44} style={{ width: "auto", height: "36px" }} />
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
