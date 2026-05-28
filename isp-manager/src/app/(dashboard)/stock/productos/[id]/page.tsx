import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getProductoById } from "@/modules/stock/actions";
import { Modulo, TipoMovimiento } from "@/generated/prisma/client";
import { CATEGORIA_LABEL, TIPO_MOVIMIENTO_LABEL, TIPO_MOVIMIENTO_COLOR } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { ChevronLeft, Pencil, Wrench, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function ProductoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.STOCK);
  if (!ok) redirect("/dashboard");

  const result = await getProductoById(id);
  if (!result.success) notFound();
  const p = result.data;

  const stockTotal = p.stock.reduce((s, sp) => s + sp.cantidad, 0);
  const bajo = p.stockMinimo > 0 && stockTotal <= p.stockMinimo;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/stock/productos" className="text-muted-foreground hover:text-foreground"><ChevronLeft className="h-5 w-5" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{p.nombre}</h1>
            {p.esHerramienta && <Wrench className="h-4 w-4 text-muted-foreground" />}
          </div>
          <p className="text-sm text-muted-foreground">{CATEGORIA_LABEL[p.categoria]}{p.codigo ? ` · ${p.codigo}` : ""}</p>
        </div>
        <Link href={`/stock/productos/${id}/editar`}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent">
          <Pencil className="h-4 w-4" /> Editar
        </Link>
      </div>

      {/* Stock por almacén */}
      <div className="rounded-lg border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Stock disponible</h2>
          <div className="flex items-center gap-1">
            {bajo && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
            <span className={cn("text-lg font-semibold", bajo && "text-yellow-600 dark:text-yellow-400")}>
              {stockTotal} {p.unidad}
            </span>
          </div>
        </div>
        {bajo && <p className="text-xs text-yellow-600 dark:text-yellow-400">Stock mínimo: {p.stockMinimo} {p.unidad}</p>}
        {p.stock.length > 0 ? (
          <div className="divide-y rounded-lg border">
            {p.stock.map((sp) => (
              <div key={sp.id} className="flex justify-between px-4 py-2.5 text-sm">
                <Link href={`/stock/almacenes/${sp.almacen.id}`} className="hover:underline text-muted-foreground">
                  {sp.almacen.nombre}
                </Link>
                <span className="font-medium">{sp.cantidad} {p.unidad}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sin stock en ningún almacén</p>
        )}
        <Link href={`/stock/movimientos/nuevo?productoId=${id}`}
          className="inline-flex text-xs text-primary hover:underline">
          Registrar movimiento →
        </Link>
      </div>

      {/* Herramientas asignadas */}
      {p.esHerramienta && p.asignaciones.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-medium flex items-center gap-2"><Wrench className="h-4 w-4" />Asignadas actualmente</h2>
          <div className="rounded-lg border divide-y">
            {p.asignaciones.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{a.empleado.nombre} {a.empleado.apellido}</span>
                <span className="text-muted-foreground">{a.cantidad} {p.unidad}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Últimos movimientos */}
      <div className="space-y-2">
        <h2 className="font-medium">Últimos movimientos</h2>
        {p.movimientos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin movimientos</p>
        ) : (
          <div className="rounded-lg border divide-y">
            {p.movimientos.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm">{m.almacen.nombre}{m.motivo ? ` · ${m.motivo}` : ""}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.empleado.nombre} {m.empleado.apellido} · {format(new Date(m.fecha), "dd/MM/yyyy", { locale: es })}
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn("text-sm font-semibold", TIPO_MOVIMIENTO_COLOR[m.tipo as TipoMovimiento])}>
                    {m.cantidad > 0 ? "+" : ""}{m.cantidad} {p.unidad}
                  </p>
                  <p className="text-xs text-muted-foreground">{TIPO_MOVIMIENTO_LABEL[m.tipo as TipoMovimiento]}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
