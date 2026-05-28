import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getMovimientos } from "@/modules/stock/actions";
import { Modulo, TipoMovimiento } from "@/generated/prisma/enums";
import { TIPO_MOVIMIENTO_LABEL, TIPO_MOVIMIENTO_COLOR } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function MovimientosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.STOCK);
  if (!ok) redirect("/dashboard");

  const result = await getMovimientos();
  if (!result.success) redirect("/stock");
  const movimientos = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Movimientos de stock</h1>
          <p className="text-sm text-muted-foreground">{movimientos.length} registros recientes</p>
        </div>
        <Link href="/stock/movimientos/nuevo"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /><span className="hidden sm:inline">Nuevo movimiento</span><span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      <div className="rounded-lg border divide-y">
        {movimientos.map((m) => (
          <div key={m.id} className="flex items-center justify-between px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{m.producto.nombre}</p>
              <p className="text-xs text-muted-foreground">
                {m.almacen.nombre} · {m.empleado.nombre} {m.empleado.apellido} · {format(new Date(m.fecha), "dd/MM/yyyy HH:mm", { locale: es })}
                {m.motivo ? ` · ${m.motivo}` : ""}
              </p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className={cn("text-sm font-semibold", TIPO_MOVIMIENTO_COLOR[m.tipo as TipoMovimiento])}>
                {m.cantidad > 0 ? "+" : ""}{m.cantidad} {m.producto.unidad}
              </p>
              <p className="text-xs text-muted-foreground">{TIPO_MOVIMIENTO_LABEL[m.tipo as TipoMovimiento]}</p>
            </div>
          </div>
        ))}
        {movimientos.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Sin movimientos registrados</p>}
      </div>
    </div>
  );
}
