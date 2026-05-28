import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getRegistrosCombustible, getDiasConCargas } from "@/modules/combustible/actions";
import { db } from "@/lib/db";
import { Modulo, TipoCombustible } from "@/generated/prisma/enums";
import { TIPO_COMBUSTIBLE_LABEL } from "@/lib/labels";
import { fechaCortaUTC } from "@/lib/utils";
import { Plus, Fuel, TrendingDown, Droplets } from "lucide-react";
import CombustibleFilters from "./filters";

export default async function CombustiblePage({
  searchParams,
}: {
  searchParams: Promise<{ vehiculoId?: string; empleadoId?: string; desde?: string; hasta?: string; dia?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.COMBUSTIBLE);
  if (!ok) redirect("/dashboard");

  const filtros = {
    vehiculoId: params.vehiculoId,
    empleadoId: params.empleadoId,
    desde: params.desde,
    hasta: params.hasta,
    dia: params.dia,
  };

  const [registrosResult, diasResult, vehiculos, empleados] = await Promise.all([
    getRegistrosCombustible(filtros),
    getDiasConCargas({ vehiculoId: params.vehiculoId, empleadoId: params.empleadoId }),
    db.vehiculo.findMany({
      select: { id: true, patente: true, marca: true, modelo: true },
      orderBy: { patente: "asc" },
    }),
    db.empleado.findMany({
      select: { id: true, nombre: true, apellido: true },
      orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
    }),
  ]);

  if (!registrosResult.success) redirect("/dashboard");
  const registros = registrosResult.data;
  const diasConCarga = diasResult.success ? diasResult.data : [];

  // Resumen calculado sobre el conjunto filtrado.
  const totalCosto = registros.reduce((s, r) => s + r.costoTotal, 0);
  const totalLitros = registros.reduce((s, r) => s + r.litros, 0);
  const cantidadCargas = registros.length;

  const hayFiltros = !!(params.vehiculoId || params.empleadoId || params.desde || params.hasta || params.dia);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Combustible</h1>
          <p className="text-sm text-muted-foreground">
            {hayFiltros
              ? `${cantidadCargas} ${cantidadCargas === 1 ? "registro" : "registros"} (filtrado)`
              : `${cantidadCargas} registros totales`}
          </p>
        </div>
        <Link href="/combustible/nuevo"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva carga</span>
          <span className="sm:hidden">Nueva</span>
        </Link>
      </div>

      {/* Filtros */}
      <CombustibleFilters
        vehiculos={vehiculos}
        empleados={empleados}
        diasConCarga={diasConCarga}
        filtroActual={filtros}
      />

      {/* Resumen — refleja los filtros aplicados */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={<Fuel className="h-5 w-5" />} label={hayFiltros ? "Costo (filtrado)" : "Costo total"}
          value={`$${totalCosto.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`} />
        <StatCard icon={<Droplets className="h-5 w-5" />} label="Litros cargados"
          value={`${totalLitros.toFixed(1)} L`} />
        <StatCard icon={<TrendingDown className="h-5 w-5" />} label={hayFiltros ? "Cargas (filtrado)" : "Cargas totales"}
          value={String(cantidadCargas)} />
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {registros.map((r) => (
          <div key={r.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-semibold">{r.vehiculo.patente}</span>
                  <span className="text-sm text-muted-foreground">{r.vehiculo.marca} {r.vehiculo.modelo}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {TIPO_COMBUSTIBLE_LABEL[r.tipoCombustible as TipoCombustible]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {fechaCortaUTC(new Date(r.fecha))} · {r.empleado.nombre} {r.empleado.apellido}
                  {r.estacion ? ` · ${r.estacion}` : ""}
                </p>
                <p className="text-sm mt-0.5">
                  {r.litros.toFixed(2)} L · {r.odometro.toLocaleString("es-AR")} km
                  {r.kmDesdeUltimo ? ` · +${r.kmDesdeUltimo.toFixed(0)} km` : ""}
                  {r.consumo ? ` · ${r.consumo.toFixed(1)} L/100km` : ""}
                </p>
              </div>
              <p className="font-semibold text-right whitespace-nowrap">
                ${r.costoTotal.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        ))}
        {registros.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {hayFiltros ? "No hay cargas con los filtros seleccionados" : "No hay registros de combustible"}
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
      <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}
