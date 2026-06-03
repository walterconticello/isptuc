"use client";

import { signOut } from "next-auth/react";
import { Menu, LogOut, X } from "lucide-react";
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

  const initials = `${nombre?.[0] ?? ""}${apellido?.[0] ?? ""}`.toUpperCase();

  return (
    <>
      {/* Header mobile */}
      <header className="flex h-14 items-center justify-between border-b border-white/[0.07] bg-[#0f172a] px-4 md:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="rounded-md p-1.5 text-white/60 hover:bg-white/5 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo_isp_v2.png"
          alt="ISP Tucumán"
          className="h-7 w-auto"
          style={{ filter: "invert(1) hue-rotate(180deg) brightness(1.05)" }}
        />

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-md p-1.5 text-white/60 hover:bg-white/5 transition-colors"
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {/* Drawer mobile */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] shadow-2xl md:hidden",
              "flex flex-col border-r border-white/[0.07]"
            )}
          >
            <div className="flex h-14 items-center justify-between border-b border-white/[0.07] px-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo_isp_v2.png"
                alt="ISP Tucumán"
                className="h-7 w-auto"
                style={{ filter: "invert(1) hue-rotate(180deg) brightness(1.05)" }}
              />
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-md p-1.5 text-white/50 hover:bg-white/5 transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto" onClick={() => setDrawerOpen(false)}>
              <SidebarContent modulosHabilitados={modulosHabilitados} />
            </div>

            <ThemeSelector />

            {/* Footer usuario */}
            <div className="border-t border-white/[0.07] p-3">
              <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-400 text-xs font-bold text-white">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/85 truncate">{nombre} {apellido}</p>
                  <p className="text-xs text-white/35">{rol}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-white/25 hover:text-white/70 transition-colors"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}