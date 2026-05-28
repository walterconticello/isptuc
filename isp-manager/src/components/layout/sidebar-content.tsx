"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, type NavItem } from "./nav-items";
import { Modulo } from "@/generated/prisma/client";

interface SidebarContentProps {
  modulosHabilitados: Modulo[];
}

export function SidebarContent({ modulosHabilitados }: SidebarContentProps) {
  const pathname = usePathname();
  const habilitados = new Set(modulosHabilitados);

  const items = NAV_ITEMS.filter((item) => habilitados.has(item.modulo));

  return (
    <nav className="flex flex-col gap-1 px-2 py-4">
      {items.map((item) => (
        <NavLink key={item.modulo} item={item} pathname={pathname} />
      ))}
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
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  );
}
