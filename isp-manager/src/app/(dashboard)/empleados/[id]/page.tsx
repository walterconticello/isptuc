import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getEmpleadoById, toggleEmpleadoActivo } from "@/modules/empleados/actions";
import { Modulo, Rol } from "@/generated/prisma/enums";
import { ROL_LABEL, ROL_COLOR } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { ChevronLeft, Pencil } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function EmpleadoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ok = await checkPermission(session.user.id, Modulo.EMPLEADOS);
  if (!ok) redirect("/dashboard");

  const result = await getEmpleadoById(id);
  if (!result.success) notFound();

  const emp = result.data;
  const esPropioUsuario = session.user.id === id;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/empleados" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold">{emp.apellido}, {emp.nombre}</h1>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-start justify-between">
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", ROL_COLOR[emp.rol as Rol])}>
            {ROL_LABEL[emp.rol as Rol]}
          </span>
          <span className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            emp.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {emp.activo ? "Activo" : "Inactivo"}
          </span>
        </div>

        <dl className="grid gap-3 text-sm">
          <Row label="Email" value={emp.email} />
          <Row label="DNI" value={emp.dni ?? "—"} />
          <Row label="Teléfono" value={emp.telefono ?? "—"} />
          <Row label="Alta" value={format(new Date(emp.createdAt), "dd/MM/yyyy", { locale: es })} />
        </dl>

        <div className="flex gap-3 pt-2 border-t">
          <Link
            href={`/empleados/${id}/editar`}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <Pencil className="h-4 w-4" /> Editar
          </Link>

          {!esPropioUsuario && (
            <form action={async () => {
              "use server";
              await toggleEmpleadoActivo(id);
            }}>
              <button
                type="submit"
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium",
                  emp.activo
                    ? "border border-destructive text-destructive hover:bg-destructive/10"
                    : "border border-green-600 text-green-600 hover:bg-green-50"
                )}
              >
                {emp.activo ? "Desactivar" : "Activar"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
