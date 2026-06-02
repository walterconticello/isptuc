import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/modules/dashboard/actions";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Users, Truck, Fuel, FileText, Package, Wrench,
  AlertTriangle, TrendingUp, TrendingDown, Activity,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

/* ── Color por módulo ───────────────────────────────────── */
const MODULE_COLORS = {
  empleados:    { bar: "bg-blue-500",   icon: "bg-blue-50 text-blue-500",    border: "before:bg-blue-500"   },
  flota:        { bar: "bg-amber-500",  icon: "bg-amber-50 text-amber-500",  border: "before:bg-amber-500"  },
  combustible:  { bar: "bg-orange-500", icon: "bg-orange-50 text-orange-500",border: "before:bg-orange-500" },
  presupuestos: { bar: "bg-green-500",  icon: "bg-green-50 text-green-500",  border: "before:bg-green-500"  },
  cuadrillas:   { bar: "bg-purple-500", icon: "bg-purple-50 text-purple-500",border: "before:bg-purple-500" },
  stock:        { bar: "bg-red-500",    icon: "bg-red-50 text-red-500",      border: "before:bg-red-500"    },
  herramientas: { bar: "bg-indigo-500", icon: "bg-indigo-50 text-indigo-500",border: "before:bg-indigo-500" },
} as const;

/* ── Sparkline (7 barras simuladas) ────────────────────── */
function Sparkline({ heights, colorClass }: { heights: number[]; colorClass: string }) {
  return (
    <div className="flex items-end gap-0.5 h-6 mt-3">
      {heights.map((h, i) => (
        <div
          key={i}
          className={cn("flex-1 rounded-sm", colorClass, i < heights.length - 1 ? "opacity-20" : "opacity-85")}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const result = await getDashboardData();
  if (!result.success) return <p className="text-muted-foreground">Error al cargar el dashboard</p>;

  const {
    empresa, empleados, vehiculos, cuadrillas,
    combustible, presupuestos, stockBajoCount, herramientasAsignadas, actividad,
  } = result.data;

  const nombre = (session.user as { nombre?: string }).nombre ?? session.user.name ?? "Usuario";
  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="space-y-5">

      {/* ── Saludo ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {saludo}, {nombre}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {empresa?.nombre ?? "ISP Tucumán"} · {format(new Date(), "EEEE d 'de' MMMM yyyy", { locale: es })}
        </p>
      </div>

      {/* ── Alertas en banner ── */}
      {(stockBajoCount > 0 || presupuestos.pendientes > 0) && (
        <div className="flex flex-col gap-2">
          {stockBajoCount > 0 && (
            <Link
              href="/stock"
              className="flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 dark:border-yellow-800/60 dark:bg-yellow-900/20 px-4 py-3 transition-opacity hover:opacity-80"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                  {stockBajoCount} {stockBajoCount === 1 ? "producto con stock bajo" : "productos con stock bajo"}
                </p>
                <p className="text-xs text-yellow-700/70 dark:text-yellow-400/70 mt-0.5">
                  Revisar almacén antes de fin de semana
                </p>
              </div>
              <span className="text-yellow-600/40 dark:text-yellow-400/40">›</span>
            </Link>
          )}
          {presupuestos.pendientes > 0 && (
            <Link
              href="/presupuestos"
              className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/60 dark:bg-blue-900/20 px-4 py-3 transition-opacity hover:opacity-80"
            >
              <FileText className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                  {presupuestos.pendientes} {presupuestos.pendientes === 1 ? "presupuesto enviado sin respuesta" : "presupuestos enviados sin respuesta"}
                </p>
                <p className="text-xs text-blue-700/70 dark:text-blue-400/70 mt-0.5">
                  Enviados hace más de 5 días · Hacer seguimiento
                </p>
              </div>
              <span className="text-blue-600/40 dark:text-blue-400/40">›</span>
            </Link>
          )}
        </div>
      )}

      {/* ── KPIs principales ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

        {/* Empleados */}
        <KpiCard
          href="/empleados"
          icon={<Users className="h-5 w-5" />}
          iconClass={MODULE_COLORS.empleados.icon}
          borderClass={MODULE_COLORS.empleados.border}
          label="Empleados activos"
          value={String(empleados.activos)}
          sub={`de ${empleados.total} registrados`}
          sparkHeights={[40, 55, 50, 65, 70, 75, 80]}
          sparkColor={MODULE_COLORS.empleados.bar}
        />

        {/* Flota */}
        <KpiCard
          href="/flota"
          icon={<Truck className="h-5 w-5" />}
          iconClass={MODULE_COLORS.flota.icon}
          borderClass={MODULE_COLORS.flota.border}
          label="Vehículos activos"
          value={String(vehiculos.activos)}
          sub={vehiculos.mantenimiento > 0 ? `${vehiculos.mantenimiento} en mantenimiento` : "Flota operativa"}
          subClass={vehiculos.mantenimiento > 0 ? "text-amber-600 dark:text-amber-400" : undefined}
          trend={vehiculos.mantenimiento > 0 ? "warn" : undefined}
          trendLabel={vehiculos.mantenimiento > 0 ? `${vehiculos.mantenimiento} mant.` : undefined}
          sparkHeights={[100, 100, 83, 83, 100, 83, 83]}
          sparkColor={MODULE_COLORS.flota.bar}
        />

        {/* Combustible */}
        <KpiCard
          href="/combustible"
          icon={<Fuel className="h-5 w-5" />}
          iconClass={MODULE_COLORS.combustible.icon}
          borderClass={MODULE_COLORS.combustible.border}
          label="Combustible este mes"
          value={`$${combustible.costomes.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`}
          sub={combustible.varPorcentaje !== null
            ? `vs $${Math.round(combustible.costomes / (1 + combustible.varPorcentaje / 100)).toLocaleString("es-AR")} mes anterior`
            : `${combustible.cargasMes} cargas · ${combustible.litrosMes.toFixed(0)} L`}
          trend={combustible.varPorcentaje !== null ? (combustible.varPorcentaje >= 0 ? "up" : "down") : undefined}
          trendLabel={combustible.varPorcentaje !== null ? `${combustible.varPorcentaje >= 0 ? "+" : ""}${combustible.varPorcentaje.toFixed(0)}%` : undefined}
          sparkHeights={[45, 60, 50, 75, 65, 80, 100]}
          sparkColor={MODULE_COLORS.combustible.bar}
        />

        {/* Presupuestos */}
        <KpiCard
          href="/presupuestos"
          icon={<FileText className="h-5 w-5" />}
          iconClass={MODULE_COLORS.presupuestos.icon}
          borderClass={MODULE_COLORS.presupuestos.border}
          label="Facturado este mes"
          value={`$${presupuestos.totalMes.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`}
          sub={`${presupuestos.cantidadMes} ${presupuestos.cantidadMes === 1 ? "presupuesto" : "presupuestos"}`}
          sparkHeights={[55, 40, 70, 60, 85, 75, 100]}
          sparkColor={MODULE_COLORS.presupuestos.bar}
        />
      </div>

      {/* ── KPIs secundarios ── */}
      <div className="grid gap-3 sm:grid-cols-3">

        <KpiCard
          href="/cuadrillas"
          icon={<Users className="h-5 w-5" />}
          iconClass={MODULE_COLORS.cuadrillas.icon}
          borderClass={MODULE_COLORS.cuadrillas.border}
          label="Cuadrillas activas"
          value={String(cuadrillas)}
          small
        />

        <KpiCard
          href="/stock"
          icon={<Package className="h-5 w-5" />}
          iconClass={stockBajoCount > 0 ? MODULE_COLORS.stock.icon : "bg-green-50 text-green-500"}
          borderClass={stockBajoCount > 0 ? MODULE_COLORS.stock.border : "before:bg-green-500"}
          label="Alertas de stock"
          value={String(stockBajoCount)}
          sub={stockBajoCount > 0 ? "productos bajo el mínimo" : "Stock en orden"}
          subClass={stockBajoCount > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}
          small
        />

        <KpiCard
          href="/stock/herramientas"
          icon={<Wrench className="h-5 w-5" />}
          iconClass={MODULE_COLORS.herramientas.icon}
          borderClass={MODULE_COLORS.herramientas.border}
          label="Herramientas asignadas"
          value={String(herramientasAsignadas)}
          small
        />
      </div>

      {/* ── Actividad reciente ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Activity className="h-4 w-4 text-primary" />
            Actividad reciente
          </h2>
          <Link href="#" className="text-xs text-primary hover:underline font-medium">
            Ver todo →
          </Link>
        </div>

        {actividad.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin actividad registrada aún</p>
        ) : (
          <div className="rounded-xl border divide-y overflow-hidden">
            {actividad.map((a) => (
              <div key={`${a.tipo}-${a.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                <div className={cn(
                  "rounded-lg p-2 shrink-0",
                  a.tipo === "combustible" && "bg-orange-50 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400",
                  a.tipo === "stock"       && "bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400",
                  a.tipo === "presupuesto" && "bg-green-50 text-green-500 dark:bg-green-900/30 dark:text-green-400",
                )}>
                  {a.tipo === "combustible" && <Fuel className="h-3.5 w-3.5" />}
                  {a.tipo === "stock"       && <Package className="h-3.5 w-3.5" />}
                  {a.tipo === "presupuesto" && <FileText className="h-3.5 w-3.5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.descripcion}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {/* Tag de tipo */}
                    <span className={cn(
                      "inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide",
                      a.tipo === "combustible" && "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
                      a.tipo === "stock"       && "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                      a.tipo === "presupuesto" && "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                    )}>
                      {a.tipo}
                    </span>
                    {a.actor && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="text-xs text-muted-foreground">{a.actor}</span>
                      </>
                    )}
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(a.fecha), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                </div>

                {a.valor && (
                  <p className="text-sm font-bold shrink-0 tabular-nums">{a.valor}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── KpiCard ────────────────────────────────────────────── */
function KpiCard({
  href, icon, iconClass, borderClass, label, value,
  sub, subClass, trend, trendLabel, sparkHeights, sparkColor, small = false,
}: {
  href: string;
  icon: React.ReactNode;
  iconClass: string;
  borderClass: string;
  label: string;
  value: string;
  sub?: string;
  subClass?: string;
  trend?: "up" | "down" | "warn";
  trendLabel?: string;
  sparkHeights?: number[];
  sparkColor?: string;
  small?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative block rounded-xl border bg-card p-4 overflow-hidden",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        // borde de color en la parte superior via pseudo-elemento
        "before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:rounded-t-xl",
        borderClass,
      )}
    >
      {/* Fila superior: ícono + trend */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className={cn("rounded-lg p-2 shrink-0", iconClass)}>
          {icon}
        </div>
        {trend && trendLabel && (
          <span className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
            trend === "up"   && "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
            trend === "down" && "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
            trend === "warn" && "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
          )}>
            {trend === "up"   && <TrendingUp className="h-2.5 w-2.5" />}
            {trend === "down" && <TrendingDown className="h-2.5 w-2.5" />}
            {trend === "warn" && <AlertTriangle className="h-2.5 w-2.5" />}
            {trendLabel}
          </span>
        )}
      </div>

      {/* Label + valor */}
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("font-bold tracking-tight mt-0.5", small ? "text-2xl" : "text-3xl")}>{value}</p>
      {sub && <p className={cn("text-xs mt-1", subClass ?? "text-muted-foreground")}>{sub}</p>}

      {/* Sparkline */}
      {sparkHeights && sparkColor && !small && (
        <div className="flex items-end gap-0.5 h-6 mt-3">
          {sparkHeights.map((h, i) => (
            <div
              key={i}
              className={cn("flex-1 rounded-sm min-h-[3px]", sparkColor, i < sparkHeights.length - 1 ? "opacity-20" : "opacity-80")}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      )}
    </Link>
  );
}