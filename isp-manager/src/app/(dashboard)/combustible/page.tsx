import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getRegistrosCombustible, getDiasConCargas } from "@/modules/combustible/actions";
import { db } from "@/lib/db";
import { Modulo } from "@/generated/prisma/enums";
import { Plus, Fuel, TrendingDown, Droplets } from "lucide-react";
import CombustibleFilters from "./filters";
import TablaRegistros from "./tabla-registros";

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

      {/* Lista — tabla con toggle de unidad de rendimiento */}
      <TablaRegistros registros={registros} hayFiltros={hayFiltros} />
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
