import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getCuadrillas } from "@/modules/cuadrillas/actions";
import { Modulo, EstadoCuadrilla } from "@/generated/prisma/enums";
import { ESTADO_CUADRILLA_LABEL, ROL_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Plus, Users } from "lucide-react";

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
          <p className="text-sm text-muted-foreground">{cuadrillas.length} cuadrillas</p>
        </div>
        <Link href="/cuadrillas/nueva"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva cuadrilla</span>
          <span className="sm:hidden">Nueva</span>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cuadrillas.map((c) => (
          <Link key={c.id} href={`/cuadrillas/${c.id}`}
            className="rounded-lg border bg-card p-5 hover:bg-accent/30 transition-colors space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{c.nombre}</p>
                {c.descripcion && <p className="text-sm text-muted-foreground">{c.descripcion}</p>}
              </div>
              <span className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                c.estado === EstadoCuadrilla.ACTIVA
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-gray-100 text-gray-600"
              )}>
                {ESTADO_CUADRILLA_LABEL[c.estado as EstadoCuadrilla]}
              </span>
            </div>

            {c.miembros.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                {c.miembros.map((m) => (
                  <span key={m.id} className="text-xs text-muted-foreground">
                    {m.empleado.apellido} {m.empleado.nombre}{m.esJefe ? " (jefe)" : ""}
                  </span>
                ))}
              </div>
            )}

            {c.vehiculos.length > 0 && (
              <p className="text-xs text-muted-foreground">
                🚗 {c.vehiculos.map((v) => v.patente).join(", ")}
              </p>
            )}
          </Link>
        ))}

        {cuadrillas.length === 0 && (
          <p className="col-span-2 py-8 text-center text-sm text-muted-foreground">No hay cuadrillas registradas</p>
        )}
      </div>
    </div>
  );
}
