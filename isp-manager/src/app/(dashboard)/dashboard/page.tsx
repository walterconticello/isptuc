import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/modules/dashboard/actions";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Users, Truck, Fuel, FileText, Package, Wrench,
  AlertTriangle, TrendingUp, TrendingDown, Minus,
  Activity,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const result = await getDashboardData();
  if (!result.success) return <p className="text-muted-foreground">Error al cargar el dashboard</p>;

  const { empresa, empleados, vehiculos, cuadrillas, combustible, presupuestos, stockBajoCount, herramientasAsignadas, actividad } = result.data;
  const nombre = (session.user as { nombre?: string }).nombre ?? session.user.name ?? "Usuario";
  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="space-y-6">
      {/* Saludo */}
      <div>
        <h1 className="text-2xl font-semibold">{saludo}, {nombre}</h1>
        <p className="text-sm text-muted-foreground">
          {empresa?.nombre ?? "ISP Manager"} · {format(new Date(), "EEEE d 'de' MMMM yyyy", { locale: es })}
        </p>
      </div>

      {/* Alertas */}
      {(stockBajoCount > 0 || presupuestos.pendientes > 0) && (
        <div className="flex flex-wrap gap-2">
          {stockBajoCount > 0 && (
            <Link href="/stock" className="flex items-center gap-1.5 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 px-3 py-1.5 text-xs font-medium text-yellow-700 dark:text-yellow-400 hover:opacity-80">
              <AlertTriangle className="h-3.5 w-3.5" />
              {stockBajoCount} {stockBajoCount === 1 ? "producto con stock bajo" : "productos con stock bajo"}
            </Link>
          )}
          {presupuestos.pendientes > 0 && (
            <Link href="/presupuestos" className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 hover:opacity-80">
              <FileText className="h-3.5 w-3.5" />
              {presupuestos.pendientes} {presupuestos.pendientes === 1 ? "presupuesto enviado sin respuesta" : "presupuestos enviados sin respuesta"}
            </Link>
          )}
        </div>
      )}

      {/* KPIs principales */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          href="/empleados"
          icon={<Users className="h-5 w-5" />}
          label="Empleados activos"
          value={String(empleados.activos)}
          sub={`de ${empleados.total} registrados`}
        />
        <KpiCard
          href="/flota"
          icon={<Truck className="h-5 w-5" />}
          label="Vehículos activos"
          value={String(vehiculos.activos)}
          sub={vehiculos.mantenimiento > 0 ? `${vehiculos.mantenimiento} en mantenimiento` : "Flota operativa"}
          subColor={vehiculos.mantenimiento > 0 ? "text-yellow-600 dark:text-yellow-400" : undefined}
        />
        <KpiCard
          href="/combustible"
          icon={<Fuel className="h-5 w-5" />}
          label="Combustible este mes"
          value={`$${combustible.costomes.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`}
          sub={combustible.varPorcentaje !== null
            ? `${combustible.varPorcentaje >= 0 ? "+" : ""}${combustible.varPorcentaje.toFixed(0)}% vs mes anterior`
            : `${combustible.cargasMes} cargas · ${combustible.litrosMes.toFixed(0)} L`}
          trend={combustible.varPorcentaje !== null ? (combustible.varPorcentaje >= 0 ? "up" : "down") : undefined}
        />
        <KpiCard
          href="/presupuestos"
          icon={<FileText className="h-5 w-5" />}
          label="Facturado este mes"
          value={`$${presupuestos.totalMes.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`}
          sub={`${presupuestos.cantidadMes} ${presupuestos.cantidadMes === 1 ? "presupuesto" : "presupuestos"}`}
        />
      </div>

      {/* Segunda fila de KPIs */}
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard
          href="/cuadrillas"
          icon={<Users className="h-5 w-5" />}
          label="Cuadrillas activas"
          value={String(cuadrillas)}
          small
        />
        <KpiCard
          href="/stock"
          icon={<Package className="h-5 w-5" />}
          label="Alertas de stock"
          value={String(stockBajoCount)}
          sub={stockBajoCount > 0 ? "productos bajo el mínimo" : "Stock en orden"}
          subColor={stockBajoCount > 0 ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"}
          small
        />
        <KpiCard
          href="/stock/herramientas"
          icon={<Wrench className="h-5 w-5" />}
          label="Herramientas asignadas"
          value={String(herramientasAsignadas)}
          small
        />
      </div>

      {/* Actividad reciente */}
      <div className="space-y-3">
        <h2 className="font-medium flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-muted-foreground" /> Actividad reciente
        </h2>
        {actividad.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin actividad registrada aún</p>
        ) : (
          <div className="rounded-lg border divide-y">
            {actividad.map((a) => (
              <div key={`${a.tipo}-${a.id}`} className="flex items-center gap-3 px-4 py-3">
                <div className={cn(
                  "rounded-md p-1.5 shrink-0",
                  a.tipo === "combustible" && "bg-orange-100 text-orange-600 dark:bg-orange-900/30",
                  a.tipo === "stock" && "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
                  a.tipo === "presupuesto" && "bg-green-100 text-green-600 dark:bg-green-900/30",
                )}>
                  {a.tipo === "combustible" && <Fuel className="h-3.5 w-3.5" />}
                  {a.tipo === "stock" && <Package className="h-3.5 w-3.5" />}
                  {a.tipo === "presupuesto" && <FileText className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{a.descripcion}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.actor && `${a.actor} · `}
                    {formatDistanceToNow(new Date(a.fecha), { addSuffix: true, locale: es })}
                  </p>
                </div>
                {a.valor && <p className="text-sm font-semibold shrink-0">{a.valor}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  href, icon, label, value, sub, subColor, trend, small = false,
}: {
  href: string; icon: React.ReactNode; label: string; value: string;
  sub?: string; subColor?: string; trend?: "up" | "down"; small?: boolean;
}) {
  return (
    <Link href={href} className="rounded-lg border bg-card p-4 hover:bg-accent/30 transition-colors block">
      <div className="flex items-start justify-between gap-2">
        <div className="rounded-md bg-primary/10 p-2 text-primary shrink-0">{icon}</div>
        {trend && (
          <span className={cn("text-xs font-medium", trend === "up" ? "text-red-500" : "text-green-500")}>
            {trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-2">{label}</p>
      <p className={cn("font-semibold mt-0.5", small ? "text-xl" : "text-2xl")}>{value}</p>
      {sub && <p className={cn("text-xs mt-0.5", subColor ?? "text-muted-foreground")}>{sub}</p>}
    </Link>
  );
}
