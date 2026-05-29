import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getCuadrillas } from "@/modules/cuadrillas/actions";
import { Modulo, EstadoCuadrilla } from "@/generated/prisma/enums";
import { ESTADO_CUADRILLA_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

export default async function CuadrillasPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.CUADRILLAS);
  if (!ok) redirect("/dashboard");

  const result = await getCuadrillas();
  if (!result.success) redirect("/dashboard");
  const cuadrillas = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Cuadrillas</h1>
          <p className="text-sm text-muted-foreground">
            {cuadrillas.length} {cuadrillas.length === 1 ? "cuadrilla" : "cuadrillas"}
          </p>
        </div>
        <Link href="/cuadrillas/nueva"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva cuadrilla</span>
          <span className="sm:hidden">Nueva</span>
        </Link>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">Nombre</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Miembros</th>
              <th className="px-4 py-3 text-left font-medium">Vehículos</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cuadrillas.map((c) => {
              const jefe = c.miembros.find((m) => m.esJefe);
              return (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.nombre}</p>
                    {c.descripcion && <p className="text-xs text-muted-foreground">{c.descripcion}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      c.estado === EstadoCuadrilla.ACTIVA
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {ESTADO_CUADRILLA_LABEL[c.estado as EstadoCuadrilla]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.miembros.length === 0
                      ? "—"
                      : `${c.miembros.length} ${c.miembros.length === 1 ? "miembro" : "miembros"}${jefe ? ` · jefe: ${jefe.empleado.apellido} ${jefe.empleado.nombre}` : ""}`}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.vehiculos.length > 0 ? c.vehiculos.map((v) => v.patente).join(", ") : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/cuadrillas/${c.id}`} className="text-primary text-xs hover:underline">Ver</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {cuadrillas.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No hay cuadrillas registradas</p>
        )}
      </div>
    </div>
  );
}
