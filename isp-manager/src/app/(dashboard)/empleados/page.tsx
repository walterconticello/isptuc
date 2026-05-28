import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getEmpleados } from "@/modules/empleados/actions";
import { Modulo, Rol } from "@/generated/prisma/enums";
import { ROL_LABEL, ROL_COLOR } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { UserPlus } from "lucide-react";

export default async function EmpleadosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ok = await checkPermission(session.user.id, Modulo.EMPLEADOS);
  if (!ok) redirect("/dashboard");

  const result = await getEmpleados();
  if (!result.success) redirect("/dashboard");

  const { empleados } = result.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Empleados</h1>
          <p className="text-sm text-muted-foreground">{result.data.total} empleados registrados</p>
        </div>
        <Link
          href="/empleados/nuevo"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo empleado</span>
          <span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      {/* Tabla desktop */}
      <div className="hidden md:block rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Nombre</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Rol</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((emp) => (
              <tr key={emp.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">
                  {emp.apellido}, {emp.nombre}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{emp.email}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", ROL_COLOR[emp.rol as Rol])}>
                    {ROL_LABEL[emp.rol as Rol]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    emp.activo
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  )}>
                    {emp.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/empleados/${emp.id}`} className="text-primary hover:underline text-xs mr-3">
                    Ver
                  </Link>
                  <Link href={`/empleados/${emp.id}/editar`} className="text-muted-foreground hover:underline text-xs">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {empleados.length === 0 && (
          <p className="py-8 text-center text-muted-foreground text-sm">No hay empleados registrados</p>
        )}
      </div>

      {/* Cards mobile */}
      <div className="grid gap-3 md:hidden">
        {empleados.map((emp) => (
          <div key={emp.id} className="rounded-lg border bg-card p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{emp.apellido}, {emp.nombre}</p>
                <p className="text-sm text-muted-foreground">{emp.email}</p>
              </div>
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", ROL_COLOR[emp.rol as Rol])}>
                {ROL_LABEL[emp.rol as Rol]}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                emp.activo
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              )}>
                {emp.activo ? "Activo" : "Inactivo"}
              </span>
              <div className="flex gap-3">
                <Link href={`/empleados/${emp.id}`} className="text-primary text-sm hover:underline">Ver</Link>
                <Link href={`/empleados/${emp.id}/editar`} className="text-muted-foreground text-sm hover:underline">Editar</Link>
              </div>
            </div>
          </div>
        ))}
        {empleados.length === 0 && (
          <p className="py-8 text-center text-muted-foreground text-sm">No hay empleados registrados</p>
        )}
      </div>
    </div>
  );
}
