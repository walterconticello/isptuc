"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, type NavItem } from "./nav-items";
import { Modulo } from "@/generated/prisma/enums";

interface SidebarContentProps {
  modulosHabilitados: Modulo[];
}

const GROUPS: { label: string; modulos: Modulo[] }[] = [
  { label: "General",            modulos: ["DASHBOARD"] },
  { label: "Operaciones",        modulos: ["EMPLEADOS", "FLOTA", "COMBUSTIBLE", "CUADRILLAS"] },
  { label: "Gestión comercial",  modulos: ["PRESUPUESTOS", "CLIENTES", "ITEMS", "STOCK"] },
  { label: "Sistema",            modulos: ["ADMIN"] },
];

export function SidebarContent({ modulosHabilitados }: SidebarContentProps) {
  const pathname = usePathname();
  const habilitados = new Set(modulosHabilitados);

  return (
    <nav className="flex flex-col gap-4 px-2 py-4">
      {GROUPS.map((group) => {
        const items = NAV_ITEMS.filter(
          (item) => group.modulos.includes(item.modulo) && habilitados.has(item.modulo)
        );
        if (items.length === 0) return null;

        return (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[1.5px] text-white/25">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {items.map((item) => (
                <NavLink key={item.modulo} item={item} pathname={pathname} />
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive =
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/15 text-indigo-300"
          : "text-white/45 hover:bg-white/5 hover:text-white/80"
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-[60%] bg-primary rounded-r-full" />
      )}
      <item.icon
        className={cn(
          "h-4 w-4 shrink-0",
          isActive ? "text-indigo-400" : "text-white/30"
        )}
      />
      {item.label}
    </Link>
  );
}