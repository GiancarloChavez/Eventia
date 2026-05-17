import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Eventia — Encuentra, Reserva, Celebra",
  description:
    "El marketplace #1 para organizar eventos sociales en Latinoamérica. Busca, compara y contrata locales, fotógrafos, DJs y decoradores.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#f4f5f7]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
