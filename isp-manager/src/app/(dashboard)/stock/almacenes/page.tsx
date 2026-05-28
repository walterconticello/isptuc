import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getAlmacenes } from "@/modules/stock/actions";
import { Modulo } from "@/generated/prisma/enums";
import { Plus, Warehouse } from "lucide-react";

export default async function AlmacenesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.STOCK);
  if (!ok) redirect("/dashboard");

  const result = await getAlmacenes();
  if (!result.success) redirect("/stock");
  const almacenes = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Almacenes</h1>
          <p className="text-sm text-muted-foreground">{almacenes.length} almacenes activos</p>
        </div>
        <Link href="/stock/almacenes/nuevo"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /><span className="hidden sm:inline">Nuevo almacén</span><span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {almacenes.map((a) => (
          <Link key={a.id} href={`/stock/almacenes/${a.id}`}
            className="rounded-lg border bg-card p-5 hover:bg-accent/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <Warehouse className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{a.nombre}</p>
                {a.ubicacion && <p className="text-sm text-muted-foreground">{a.ubicacion}</p>}
                {a.encargado && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Encargado: {a.encargado.nombre} {a.encargado.apellido}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{a._count.stock} productos</p>
              </div>
            </div>
          </Link>
        ))}
        {almacenes.length === 0 && (
          <p className="col-span-2 py-8 text-center text-sm text-muted-foreground">No hay almacenes registrados</p>
        )}
      </div>
    </div>
  );
}
