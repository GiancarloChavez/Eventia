import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 px-10 pt-10 pb-6 mt-12">
      <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 mb-8">
        <div>
          <div className="mb-3">
            <Image src="/logo.png" alt="Eventia" width={120} height={40} className="h-12 w-auto object-contain" />
          </div>
          <p className="text-gray-500 text-[13px] leading-7 max-w-[220px]">
            El marketplace #1 para organizar eventos sociales en Latinoamérica.
          </p>
        </div>

        {[
          { title: "Servicios", links: ["Locales", "Fotografía", "Música", "Decoración"] },
          { title: "Empresa", links: ["Cómo funciona", "Para proveedores", "Blog", "Prensa"] },
          { title: "Soporte", links: ["Centro de ayuda", "Contacto", "Privacidad", "Términos"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-gray-900 text-[11px] font-bold tracking-[0.8px] uppercase mb-3">
              {col.title}
            </h4>
            <div className="flex flex-col gap-2">
              {col.links.map((l) => (
                <Link
                  key={l}
                  href="#"
                  className="text-gray-500 text-[13px] hover:text-[#f39e10] transition-colors"
                >
                  {l}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-5 flex justify-between items-center">
        <span className="text-gray-400 text-[12px]">© 2025 Eventia. Todos los derechos reservados.</span>
        <span className="text-gray-400 text-[12px]">Hecho con ♥ en Perú</span>
      </div>
    </footer>
  );
}
