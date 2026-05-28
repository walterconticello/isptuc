"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/presupuestos", label: "Presupuestos" },
  { href: "/clientes", label: "Clientes" },
  { href: "/items", label: "Ítems" },
  { href: "/impuestos", label: "Impuestos" },
  { href: "/configuracion", label: "Configuración" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1">
      {links.map(({ href, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              active
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
