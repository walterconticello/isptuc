import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getVehiculos } from "@/modules/flota/actions";
import { Modulo, TipoVehiculo, EstadoVehiculo } from "@/generated/prisma/enums";
import { TIPO_VEHICULO_LABEL, ESTADO_VEHICULO_LABEL, ESTADO_VEHICULO_COLOR } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Plus, Gauge } from "lucide-react";

export default async function FlotaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.FLOTA);
  if (!ok) redirect("/dashboard");

  const result = await getVehiculos();
  if (!result.success) redirect("/dashboard");
  const vehiculos = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Flota</h1>
          <p className="text-sm text-muted-foreground">{vehiculos.length} vehículos</p>
        </div>
        <Link
          href="/flota/nuevo"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo vehículo</span>
          <span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      {/* Tabla desktop */}
      <div className="hidden md:block rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Patente</th>
              <th className="px-4 py-3 text-left font-medium">Vehículo</th>
              <th className="px-4 py-3 text-left font-medium">Tipo</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-right font-medium">Odómetro</th>
              <th className="px-4 py-3 text-left font-medium">Cuadrilla</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vehiculos.map((v) => (
              <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-mono font-semibold">{v.patente}</td>
                <td className="px-4 py-3">{v.marca} {v.modelo} <span className="text-muted-foreground">({v.anio})</span></td>
                <td className="px-4 py-3 text-muted-foreground">{TIPO_VEHICULO_LABEL[v.tipo as TipoVehiculo]}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", ESTADO_VEHICULO_COLOR[v.estado as EstadoVehiculo])}>
                    {ESTADO_VEHICULO_LABEL[v.estado as EstadoVehiculo]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">
                  {v.odometroActual.toLocaleString("es-AR")} km
                </td>
                <td className="px-4 py-3 text-muted-foreground text-sm">
                  {v.cuadrilla?.nombre ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/flota/${v.id}`} className="text-primary text-xs hover:underline mr-3">Ver</Link>
                  <Link href={`/flota/${v.id}/editar`} className="text-muted-foreground text-xs hover:underline">Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vehiculos.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No hay vehículos registrados</p>}
      </div>

      {/* Cards mobile */}
      <div className="grid gap-3 md:hidden">
        {vehiculos.map((v) => (
          <div key={v.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-mono font-semibold">{v.patente}</p>
                <p className="text-sm text-muted-foreground">{v.marca} {v.modelo} ({v.anio})</p>
              </div>
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", ESTADO_VEHICULO_COLOR[v.estado as EstadoVehiculo])}>
                {ESTADO_VEHICULO_LABEL[v.estado as EstadoVehiculo]}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" />{v.odometroActual.toLocaleString("es-AR")} km</span>
              <div className="flex gap-3">
                <Link href={`/flota/${v.id}`} className="text-primary hover:underline">Ver</Link>
                <Link href={`/flota/${v.id}/editar`} className="hover:underline">Editar</Link>
              </div>
            </div>
          </div>
        ))}
        {vehiculos.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No hay vehículos registrados</p>}
      </div>
    </div>
  );
}
