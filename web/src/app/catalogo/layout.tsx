import { Suspense } from "react";

export default function CatalogoLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="p-10 text-gray-500">Cargando catálogo...</div>}>{children}</Suspense>;
}
