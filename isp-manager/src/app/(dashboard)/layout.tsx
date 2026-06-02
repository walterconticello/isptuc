import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPermisosEmpleado } from "@/lib/permissions";
import { SidebarContent } from "@/components/layout/sidebar-content";
import { Header } from "@/components/layout/header";
import { ThemeSelector } from "@/components/theme-selector";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [modulosHabilitados] = await Promise.all([
    getPermisosEmpleado(session.user.id).then((s) => Array.from(s)),
  ]);

  const { nombre, apellido, rol } = session.user as {
    nombre: string;
    apellido: string;
    rol: string;
  };

  const initials = `${nombre?.[0] ?? ""}${apellido?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:w-60 md:flex-col border-r border-white/[0.07] bg-[#0f172a]">
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-white/[0.07] px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo_isp_v2.png"
            alt="ISP Tucumán"
            className="h-8 w-auto"
            style={{ filter: "invert(1) hue-rotate(180deg) brightness(1.05)" }}
          />
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto">
          <SidebarContent modulosHabilitados={modulosHabilitados} />
        </div>

        {/* Selector de tema */}
        <ThemeSelector />

        {/* Usuario + logout */}
        <div className="border-t border-white/[0.07] p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-white/5 transition-colors group">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-400 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/85 truncate">{nombre} {apellido}</p>
              <p className="text-xs text-white/35">{rol}</p>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="text-white/25 hover:text-white/70 transition-colors cursor-pointer"
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex flex-1 flex-col">
        {/* Header mobile */}
        <Header session={session} modulosHabilitados={modulosHabilitados} />

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}