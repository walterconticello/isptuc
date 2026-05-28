import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getStockDashboard } from "@/modules/stock/actions";
import { Modulo, TipoMovimiento } from "@/generated/prisma/client";
import { TIPO_MOVIMIENTO_LABEL, TIPO_MOVIMIENTO_COLOR } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Warehouse, Package, AlertTriangle, Wrench, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function StockPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.STOCK);
  if (!ok) redirect("/dashboard");

  const result = await getStockDashboard();
  if (!result.success) redirect("/dashboard");
  const { stockBajo, totalAlmacenes, movimientosRecientes, herramientasAsignadas } = result.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Stock e Inventario</h1>
        <p className="text-sm text-muted-foreground">Gestión de almacenes, productos y herramientas</p>
      </div>

      {/* Accesos rápidos */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink href="/stock/almacenes" icon={<Warehouse className="h-5 w-5" />}
          label="Almacenes" value={String(totalAlmacenes)} />
        <QuickLink href="/stock/movimientos/nuevo" icon={<Package className="h-5 w-5" />}
          label="Registrar movimiento" value="+" primary />
        <QuickLink href="/stock/herramientas" icon={<Wrench className="h-5 w-5" />}
          label="Herramientas asignadas" value={String(herramientasAsignadas)} />
        <QuickLink href="/stock/productos" icon={<Package className="h-5 w-5" />}
          label="Catálogo" value="Ver productos" />
      </div>

      {/* Alertas de stock bajo */}
      {stockBajo.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-medium flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="h-4 w-4" /> Stock bajo ({stockBajo.length})
          </h2>
          <div className="rounded-lg border border-yellow-200 dark:border-yellow-900/50 divide-y divide-yellow-100 dark:divide-yellow-900/30">
            {stockBajo.map((p) => {
              const total = p.stock.reduce((s, sp) => s + sp.cantidad, 0);
              return (
                <Link key={p.id} href={`/stock/productos/${p.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{p.nombre}</p>
                    <p className="text-xs text-muted-foreground">Mínimo: {p.stockMinimo} {p.unidad}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">{total} {p.unidad}</p>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Últimos movimientos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Últimos movimientos</h2>
          <Link href="/stock/movimientos" className="text-xs text-primary hover:underline">Ver todos</Link>
        </div>
        {movimientosRecientes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin movimientos registrados aún</p>
        ) : (
          <div className="rounded-lg border divide-y">
            {movimientosRecientes.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{m.producto.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.almacen.nombre} · {m.empleado.nombre} {m.empleado.apellido} · {format(new Date(m.fecha), "dd/MM/yyyy", { locale: es })}
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn("text-sm font-semibold", TIPO_MOVIMIENTO_COLOR[m.tipo as TipoMovimiento])}>
                    {m.cantidad > 0 ? "+" : ""}{m.cantidad} {m.producto.unidad}
                  </p>
                  <p className="text-xs text-muted-foreground">{TIPO_MOVIMIENTO_LABEL[m.tipo as TipoMovimiento]}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navegación por secciones */}
      <div className="grid gap-3 sm:grid-cols-2">
        <SectionCard href="/stock/productos" title="Catálogo de productos"
          description="Administrá equipos, herrajes, herramientas y consumibles" />
        <SectionCard href="/stock/almacenes" title="Almacenes"
          description="Gestioná ubicaciones y encargados de cada almacén" />
        <SectionCard href="/stock/movimientos" title="Historial de movimientos"
          description="Entradas, salidas, ajustes y transferencias" />
        <SectionCard href="/stock/herramientas" title="Herramientas asignadas"
          description="Controlá qué empleado tiene cada herramienta" />
      </div>
    </div>
  );
}

function QuickLink({ href, icon, label, value, primary = false }:
  { href: string; icon: React.ReactNode; label: string; value: string; primary?: boolean }) {
  return (
    <Link href={href} className={cn(
      "rounded-lg border p-4 flex items-center gap-3 transition-colors hover:bg-accent/50",
      primary && "bg-primary/5 border-primary/20"
    )}>
      <div className={cn("rounded-md p-2", primary ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </Link>
  );
}

function SectionCard({ href, title, description }:
  { href: string; title: string; description: string }) {
  return (
    <Link href={href}
      className="rounded-lg border bg-card p-4 hover:bg-accent/30 transition-colors flex items-start justify-between gap-3">
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
    </Link>
  );
}
