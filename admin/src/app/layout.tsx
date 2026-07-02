import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eventia Admin",
  description: "Panel de administración de Eventia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen">{children}</body>
    </html>
  );
}
