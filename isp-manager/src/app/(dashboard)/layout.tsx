import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPermisosEmpleado } from "@/lib/permissions";
import { SidebarContent } from "@/components/layout/sidebar-content";
import { Header } from "@/components/layout/header";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const modulosHabilitados = Array.from(
    await getPermisosEmpleado(session.user.id)
  );

  const { nombre, apellido, rol } = session.user as {
    nombre: string;
    apellido: string;
    rol: string;
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop (oculto en mobile) */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:bg-sidebar">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            ISP
          </div>
          <span className="font-semibold">ISP Manager</span>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto">
          <SidebarContent modulosHabilitados={modulosHabilitados} />
        </div>

        {/* Usuario + logout */}
        <div className="border-t p-4">
          <p className="text-sm font-medium">{nombre} {apellido}</p>
          <p className="text-xs text-muted-foreground mb-3">{rol}</p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </form>
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
