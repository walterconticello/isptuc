import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getEmpleados } from "@/modules/empleados/actions";
import { Modulo, Rol } from "@/generated/prisma/enums";
import { ROL_LABEL, ROL_COLOR } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { UserPlus, Search, Eye, Pencil, Filter } from "lucide-react";

const AVATAR_GRADIENT: Record<Rol, string> = {
  DUENO:          "from-violet-600 to-violet-400",
  GERENTE:        "from-blue-600 to-blue-400",
  ADMIN:          "from-orange-500 to-orange-400",
  ADMINISTRATIVO: "from-green-600 to-green-400",
  TECNICO:        "from-slate-500 to-slate-400",
};

export default async function EmpleadosPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ok = await checkPermission(session.user.id, Modulo.EMPLEADOS);
  if (!ok) redirect("/dashboard");

  const result = await getEmpleados();
  if (!result.success) redirect("/dashboard");

  const { empleados } = result.data;

  const q = (searchParams.q ?? "").toLowerCase().trim();
  const filtered = q
    ? empleados.filter((emp) =>
        `${emp.apellido} ${emp.nombre} ${emp.email}`.toLowerCase().includes(q)
      )
    : empleados;

  const activos   = empleados.filter((e) => e.activo).length;
  const inactivos = empleados.length - activos;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Operaciones › Empleados
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Empleados</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {result.data.total} empleados · {activos} activos · {inactivos} inactivos
          </p>
        </div>
        <Link
          href="/empleados/nuevo"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:-translate-y-0.5"
        >
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo empleado</span>
          <span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      {/* Buscador */}
      <form method="GET" className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            type="search"
            defaultValue={searchParams.q}
            placeholder="Buscar por nombre o email…"
            className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </form>

      {/* Tabla desktop */}
      <div className="hidden overflow-hidden rounded-xl border bg-card shadow-sm md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Empleado</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Rol</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Estado</th>
              <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((emp) => {
              const initials = `${emp.apellido?.[0] ?? ""}${emp.nombre?.[0] ?? ""}`.toUpperCase();
              const gradient = AVATAR_GRADIENT[emp.rol as Rol];
              return (
                <tr
                  key={emp.id}
                  className={cn(
                    "transition-colors hover:bg-muted/30",
                    !emp.activo && "opacity-60"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white", gradient)}>
                        {initials}
                      </div>
                      <div>
                        <p className="font-semibold">{emp.apellido}, {emp.nombre}</p>
                        <p className="text-xs text-muted-foreground">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", ROL_COLOR[emp.rol as Rol])}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                      {ROL_LABEL[emp.rol as Rol]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", emp.activo ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                      <span className={cn("h-2 w-2 rounded-full ring-2", emp.activo ? "bg-green-500 ring-green-100 dark:ring-green-900/30" : "bg-red-500 ring-red-100 dark:ring-red-900/30")} />
                      {emp.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/empleados/${emp.id}`} title="Ver perfil" className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary">
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                      <Link href={`/empleados/${emp.id}/editar`} title="Editar" className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary">
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {q ? `Sin resultados para "${searchParams.q}"` : "No hay empleados registrados"}
            </p>
          </div>
        )}
      </div>

      {/* Cards mobile */}
      <div className="grid gap-3 md:hidden">
        {filtered.map((emp) => {
          const initials = `${emp.apellido?.[0] ?? ""}${emp.nombre?.[0] ?? ""}`.toUpperCase();
          const gradient = AVATAR_GRADIENT[emp.rol as Rol];
          return (
            <div key={emp.id} className={cn("rounded-xl border bg-card p-4 space-y-3", !emp.activo && "opacity-60")}>
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white", gradient)}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{emp.apellido}, {emp.nombre}</p>
                  <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                </div>
                <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", ROL_COLOR[emp.rol as Rol])}>
                  {ROL_LABEL[emp.rol as Rol]}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", emp.activo ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                  <span className={cn("h-2 w-2 rounded-full ring-2", emp.activo ? "bg-green-500 ring-green-100 dark:ring-green-900/30" : "bg-red-500 ring-red-100 dark:ring-red-900/30")} />
                  {emp.activo ? "Activo" : "Inactivo"}
                </span>
                <div className="flex gap-1.5">
                  <Link href={`/empleados/${emp.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                  <Link href={`/empleados/${emp.id}/editar`} className="flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {q ? `Sin resultados para "${searchParams.q}"` : "No hay empleados registrados"}
          </p>
        )}
      </div>
    </div>
  );
}