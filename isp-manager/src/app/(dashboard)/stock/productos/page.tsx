import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getProductos } from "@/modules/stock/actions";
import { Modulo, CategoriaProducto } from "@/generated/prisma/client";
import { CATEGORIA_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Plus, AlertTriangle, Wrench } from "lucide-react";

export default async function ProductosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.STOCK);
  if (!ok) redirect("/dashboard");

  const result = await getProductos();
  if (!result.success) redirect("/stock");
  const productos = result.data;

  // Agrupar por categoría
  const porCategoria = productos.reduce<Record<string, typeof productos>>((acc, p) => {
    const cat = p.categoria;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Catálogo de productos</h1>
          <p className="text-sm text-muted-foreground">{productos.length} productos activos</p>
        </div>
        <Link href="/stock/productos/nuevo"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /><span className="hidden sm:inline">Nuevo producto</span><span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      {Object.entries(porCategoria).map(([categoria, items]) => (
        <div key={categoria} className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {CATEGORIA_LABEL[categoria as CategoriaProducto]}
          </h2>
          <div className="rounded-lg border divide-y">
            {items.map((p) => {
              const stockTotal = p.stock.reduce((s, sp) => s + sp.cantidad, 0);
              const bajo = p.stockMinimo > 0 && stockTotal <= p.stockMinimo;
              return (
                <Link key={p.id} href={`/stock/productos/${p.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    {p.esHerramienta && <Wrench className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.nombre}</p>
                      {p.codigo && <p className="text-xs text-muted-foreground">{p.codigo}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {bajo && <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />}
                    <span className={cn("text-sm font-semibold", bajo && "text-yellow-600 dark:text-yellow-400")}>
                      {stockTotal} {p.unidad}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {productos.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">No hay productos en el catálogo</p>
      )}
    </div>
  );
}
