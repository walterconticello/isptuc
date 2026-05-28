"use client";

import { signOut } from "next-auth/react";
import { Menu, LogOut } from "lucide-react";
import { type Session } from "next-auth";
import { SidebarContent } from "./sidebar-content";
import { ThemeSelector } from "@/components/theme-selector";
import { Modulo } from "@/generated/prisma/enums";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  session: Session;
  modulosHabilitados: Modulo[];
}

export function Header({ session, modulosHabilitados }: HeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { nombre, apellido, rol } = session.user as {
    nombre: string;
    apellido: string;
    rol: string;
  };

  return (
    <>
      {/* Header barra superior */}
      <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="rounded-md p-1.5 hover:bg-accent"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold">ISP Manager</span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-md p-1.5 hover:bg-accent"
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {/* Drawer mobile */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar shadow-xl md:hidden",
              "flex flex-col"
            )}
          >
            <div className="flex h-14 items-center justify-between border-b px-4">
              <span className="font-semibold">ISP Manager</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-md p-1.5 hover:bg-accent"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" onClick={() => setDrawerOpen(false)}>
              <SidebarContent modulosHabilitados={modulosHabilitados} />
            </div>
            <ThemeSelector />
            <UserFooter nombre={nombre} apellido={apellido} rol={rol} />
          </aside>
        </>
      )}
    </>
  );
}

function UserFooter({ nombre, apellido, rol }: { nombre: string; apellido: string; rol: string }) {
  return (
    <div className="border-t p-4">
      <div className="mb-2">
        <p className="text-sm font-medium">{nombre} {apellido}</p>
        <p className="text-xs text-muted-foreground">{rol}</p>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </div>
  );
}
