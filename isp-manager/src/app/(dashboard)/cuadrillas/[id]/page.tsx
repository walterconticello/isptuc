import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getCuadrillaById, toggleEstadoCuadrilla, removerMiembro } from "@/modules/cuadrillas/actions";
import { Modulo, EstadoCuadrilla, Rol } from "@/generated/prisma/enums";
import { ROL_LABEL, ROL_COLOR, ESTADO_CUADRILLA_LABEL, ESTADO_VEHICULO_LABEL, ESTADO_VEHICULO_COLOR } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { ChevronLeft, UserPlus, Truck } from "lucide-react";
import AgregarMiembroForm from "./agregar-miembro-form";
import { db } from "@/lib/db";

export default async function CuadrillaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.CUADRILLAS);
  if (!ok) redirect("/dashboard");

  const [result, empleadosDisponibles] = await Promise.all([
    getCuadrillaById(id),
    db.empleado.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, apellido: true },
      orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
    }),
  ]);
  if (!result.success) notFound();
  const c = result.data;

  const miembroIds = new Set(c.miembros.map((m) => m.empleadoId));
  const disponibles = empleadosDisponibles.filter((e) => !miembroIds.has(e.id));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/cuadrillas" className="text-muted-foreground hover:text-foreground"><ChevronLeft className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-2xl font-semibold">{c.nombre}</h1>
          {c.descripcion && <p className="text-sm text-muted-foreground">{c.descripcion}</p>}
        </div>
        <span className={cn(
          "ml-auto rounded-full px-2.5 py-1 text-xs font-medium",
          c.estado === EstadoCuadrilla.ACTIVA ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
        )}>
          {ESTADO_CUADRILLA_LABEL[c.estado as EstadoCuadrilla]}
        </span>
      </div>

      {/* Miembros */}
      <div className="space-y-3">
        <h2 className="font-medium flex items-center gap-2"><UserPlus className="h-4 w-4" />Miembros</h2>
        {c.miembros.length > 0 ? (
          <div className="rounded-lg border divide-y">
            {c.miembros.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">
                    {m.empleado.apellido} {m.empleado.nombre}
                    {m.esJefe && <span className="ml-2 text-xs text-muted-foreground">(jefe)</span>}
                  </p>
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", ROL_COLOR[m.empleado.rol as Rol])}>
                    {ROL_LABEL[m.empleado.rol as Rol]}
                  </span>
                </div>
                <form action={async () => {
                  "use server";
                  await removerMiembro(id, m.empleadoId);
                }}>
                  <button type="submit" className="text-xs text-destructive hover:underline">Remover</button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sin miembros asignados</p>
        )}
        {disponibles.length > 0 && <AgregarMiembroForm cuadrillaId={id} empleados={disponibles} />}
      </div>

      {/* Vehículos */}
      <div className="space-y-3">
        <h2 className="font-medium flex items-center gap-2"><Truck className="h-4 w-4" />Vehículos asignados</h2>
        {c.vehiculos.length > 0 ? (
          <div className="rounded-lg border divide-y">
            {c.vehiculos.map((v) => (
              <div key={v.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <p className="font-mono font-semibold">{v.patente}</p>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium",
                  ESTADO_VEHICULO_COLOR[v.estado])}>
                  {ESTADO_VEHICULO_LABEL[v.estado]}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sin vehículos asignados</p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex gap-3 border-t pt-4">
        <form action={async () => {
          "use server";
          await toggleEstadoCuadrilla(id);
        }}>
          <button type="submit" className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium border",
            c.estado === EstadoCuadrilla.ACTIVA
              ? "border-destructive text-destructive hover:bg-destructive/10"
              : "border-green-600 text-green-600 hover:bg-green-50"
          )}>
            {c.estado === EstadoCuadrilla.ACTIVA ? "Desactivar cuadrilla" : "Activar cuadrilla"}
          </button>
        </form>
      </div>
    </div>
  );
}
