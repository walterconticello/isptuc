import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getVehiculos } from "@/modules/flota/actions";
import { Modulo, TipoVehiculo, EstadoVehiculo } from "@/generated/prisma/enums";
import { ESTADO_VEHICULO_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Plus, Search, Filter, Truck, Car, Bike, Eye, Pencil, Wrench, HelpCircle } from "lucide-react";

const TIPO_ICON: Record<TipoVehiculo, React.ElementType> = {
  AUTO:      Car,
  CAMIONETA: Truck,
  MOTO:      Bike,
  FURGON:    Truck,
  EQUIPO:    Wrench,
  OTRO:      HelpCircle,
};

const TIPO_LABEL: Record<TipoVehiculo, string> = {
  AUTO: "Auto", CAMIONETA: "Camioneta", MOTO: "Moto", FURGON: "Furgón",
  EQUIPO: "Equipo", OTRO: "Otro",
};

export default async function FlotaPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.FLOTA);
  if (!ok) redirect("/dashboard");

  const result = await getVehiculos();
  if (!result.success) redirect("/dashboard");
  const vehiculos = result.data;

  const q = (searchParams.q ?? "").toLowerCase().trim();
  const filtered = q
    ? vehiculos.filter((v) =>
        `${v.patente} ${v.marca} ${v.modelo}`.toLowerCase().includes(q)
      )
    : vehiculos;

  const activos      = vehiculos.filter((v) => v.estado === "ACTIVO").length;
  const mantenimiento = vehiculos.filter((v) => v.estado === "MANTENIMIENTO").length;
  const inactivos    = vehiculos.filter((v) => v.estado === "INACTIVO").length;
  const maxOdo       = vehiculos.reduce((m, v) => Math.max(m, v.odometroActual), 1);

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Operaciones › Flota
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Flota</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {vehiculos.length} vehículos
            {activos > 0 && ` · ${activos} activos`}
            {mantenimiento > 0 && ` · ${mantenimiento} en mantenimiento`}
            {inactivos > 0 && ` · ${inactivos} inactivos`}
          </p>
        </div>
        <Link
          href="/flota/nuevo"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo vehículo</span>
          <span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      {/* ── Buscador ── */}
      <form method="GET" className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            type="search"
            defaultValue={searchParams.q}
            placeholder="Buscar por patente, marca o modelo…"
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

      {/* ── Tabla desktop ── */}
      <div className="hidden overflow-hidden rounded-xl border bg-card shadow-sm md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Vehículo</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Estado</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Odómetro</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Cuadrilla</th>
              <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((v) => {
              const Icon = TIPO_ICON[v.tipo as TipoVehiculo];
              const odoPct = Math.round((v.odometroActual / maxOdo) * 100);
              const odoColor =
                odoPct > 80 ? "bg-red-400" :
                odoPct > 50 ? "bg-amber-400" : "bg-amber-500";
              const isInactive = v.estado === "INACTIVO";
              const isMaint    = v.estado === "MANTENIMIENTO";

              return (
                <tr
                  key={v.id}
                  className={cn(
                    "transition-colors hover:bg-muted/30",
                    isInactive && "opacity-50",
                    isMaint    && "opacity-70",
                  )}
                >
                  {/* Vehículo */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-400 text-white">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{v.marca} {v.modelo} · {v.anio}</span>
                          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
                            {v.patente}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{TIPO_LABEL[v.tipo as TipoVehiculo]}</p>
                      </div>
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-semibold",
                      v.estado === "ACTIVO"       && "text-green-600 dark:text-green-400",
                      v.estado === "MANTENIMIENTO"&& "text-amber-600 dark:text-amber-400",
                      v.estado === "INACTIVO"     && "text-red-600 dark:text-red-400",
                    )}>
                      <span className={cn(
                        "h-2 w-2 rounded-full ring-2",
                        v.estado === "ACTIVO"        && "bg-green-500 ring-green-100 dark:ring-green-900/30",
                        v.estado === "MANTENIMIENTO" && "bg-amber-500 ring-amber-100 dark:ring-amber-900/30",
                        v.estado === "INACTIVO"      && "bg-red-500 ring-red-100 dark:ring-red-900/30",
                      )} />
                      {ESTADO_VEHICULO_LABEL[v.estado as EstadoVehiculo]}
                    </span>
                  </td>

                  {/* Odómetro */}
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-semibold">
                      {v.odometroActual.toLocaleString("es-AR")} km
                    </p>
                    <div className="mt-1.5 h-1 w-20 overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full", odoColor)} style={{ width: `${odoPct}%` }} />
                    </div>
                  </td>

                  {/* Cuadrilla */}
                  <td className="px-4 py-3">
                    {v.cuadrilla ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {v.cuadrilla.nombre}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/flota/${v.id}`}
                        title="Ver vehículo"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/flota/${v.id}/editar`}
                        title="Editar"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                      >
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
              {q ? `Sin resultados para "${searchParams.q}"` : "No hay vehículos registrados"}
            </p>
          </div>
        )}
      </div>

      {/* ── Cards mobile ── */}
      <div className="grid gap-3 md:hidden">
        {filtered.map((v) => {
          const Icon = TIPO_ICON[v.tipo as TipoVehiculo];
          const isInactive = v.estado === "INACTIVO";
          const isMaint    = v.estado === "MANTENIMIENTO";
          return (
            <div
              key={v.id}
              className={cn(
                "rounded-xl border bg-card p-4 space-y-3",
                isInactive && "opacity-50",
                isMaint    && "opacity-70",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-400 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{v.marca} {v.modelo}</p>
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">{v.patente}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{TIPO_LABEL[v.tipo as TipoVehiculo]} · {v.anio}</p>
                </div>
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0",
                  v.estado === "ACTIVO"        && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                  v.estado === "MANTENIMIENTO" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                  v.estado === "INACTIVO"      && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                )}>
                  {ESTADO_VEHICULO_LABEL[v.estado as EstadoVehiculo]}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <p className="font-mono text-xs text-muted-foreground">
                  {v.odometroActual.toLocaleString("es-AR")} km
                </p>
                <div className="flex gap-1.5">
                  <Link href={`/flota/${v.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                  <Link href={`/flota/${v.id}/editar`} className="flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {q ? `Sin resultados para "${searchParams.q}"` : "No hay vehículos registrados"}
          </p>
        )}
      </div>
    </div>
  );
}