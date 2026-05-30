import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getAsignacionesActivas, devolverHerramienta } from "@/modules/stock/actions";
import { Modulo } from "@/generated/prisma/enums";
import { Wrench } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import AsignarHerramientaForm from "./asignar-form";
import { db } from "@/lib/db";

export default async function HerramientasPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.STOCK);
  if (!ok) redirect("/dashboard");

  const [result, herramientas, empleados] = await Promise.all([
    getAsignacionesActivas(),
    db.producto.findMany({
      where: { esHerramienta: true, activo: true },
      select: { id: true, nombre: true, unidad: true },
      orderBy: { nombre: "asc" },
    }),
    db.empleado.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, apellido: true },
      orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
    }),
  ]);

  if (!result.success) redirect("/stock");
  const asignaciones = result.data;

  // Agrupar por empleado
  const porEmpleado = asignaciones.reduce<Record<string, typeof asignaciones>>((acc, a) => {
    const key = `${a.empleado.apellido} ${a.empleado.nombre}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Herramientas asignadas</h1>
        <p className="text-sm text-muted-foreground">{asignaciones.length} asignaciones activas</p>
      </div>

      {/* Formulario de asignación */}
      <div className="rounded-lg border bg-card p-5 space-y-3">
        <h2 className="font-medium text-sm">Asignar herramienta</h2>
        {herramientas.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay herramientas en el catálogo. <Link href="/stock/productos/nuevo" className="text-primary hover:underline">Crear producto</Link></p>
        ) : (
          <AsignarHerramientaForm herramientas={herramientas} empleados={empleados} />
        )}
      </div>

      {/* Lista por empleado */}
      {Object.keys(porEmpleado).length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay herramientas asignadas actualmente</p>
      ) : (
        Object.entries(porEmpleado).map(([empleado, items]) => (
          <div key={empleado} className="space-y-2">
            <h2 className="font-medium flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              {empleado}
            </h2>
            <div className="rounded-lg border divide-y">
              {items.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{a.producto.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.cantidad} {a.producto.unidad} · asignado el {format(new Date(a.fechaAsignacion), "dd/MM/yyyy", { locale: es })}
                      {a.notas ? ` · ${a.notas}` : ""}
                    </p>
                  </div>
                  <form action={async () => { "use server"; await devolverHerramienta(a.id); }}>
                    <button type="submit"
                      className="text-xs text-muted-foreground hover:text-foreground border rounded px-2.5 py-1 hover:bg-accent">
                      Devolver
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
