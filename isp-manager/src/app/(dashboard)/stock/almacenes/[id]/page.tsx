import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getAlmacenById } from "@/modules/stock/actions";
import { Modulo } from "@/generated/prisma/enums";
import { ChevronLeft, Pencil, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function AlmacenDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.STOCK);
  if (!ok) redirect("/dashboard");

  const result = await getAlmacenById(id);
  if (!result.success) notFound();
  const a = result.data;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/stock/almacenes" className="text-muted-foreground hover:text-foreground"><ChevronLeft className="h-5 w-5" /></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{a.nombre}</h1>
          {a.ubicacion && <p className="text-sm text-muted-foreground">{a.ubicacion}</p>}
          {a.encargado && <p className="text-sm text-muted-foreground">Encargado: {a.encargado.nombre} {a.encargado.apellido}</p>}
        </div>
        <Link href={`/stock/almacenes/${id}/editar`}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent">
          <Pencil className="h-4 w-4" /> Editar
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Stock ({a.stock.length} productos)</h2>
          <Link href={`/stock/movimientos/nuevo?almacenId=${id}`} className="text-xs text-primary hover:underline">
            Registrar movimiento
          </Link>
        </div>
        {a.stock.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin productos en este almacén</p>
        ) : (
          <div className="rounded-lg border divide-y">
            {a.stock.map((sp) => {
              const bajoDeMiniom = sp.producto.stockMinimo > 0 && sp.cantidad <= sp.producto.stockMinimo;
              return (
                <Link key={sp.id} href={`/stock/productos/${sp.producto.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{sp.producto.nombre}</p>
                    {sp.producto.codigo && <p className="text-xs text-muted-foreground">{sp.producto.codigo}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {bajoDeMiniom && <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />}
                    <span className={cn("text-sm font-semibold", bajoDeMiniom && "text-yellow-600 dark:text-yellow-400")}>
                      {sp.cantidad} {sp.producto.unidad}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
