import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getItems, toggleItemActivo } from "@/modules/items/actions";
import { Modulo } from "@/generated/prisma/client";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function ItemsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.ITEMS);
  if (!ok) redirect("/dashboard");

  const result = await getItems();
  if (!result.success) redirect("/dashboard");
  const items = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Items / Servicios</h1>
          <p className="text-sm text-muted-foreground">{items.length} items activos</p>
        </div>
        <Link href="/items/nuevo"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /><span className="hidden sm:inline">Nuevo item</span><span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Código</th>
              <th className="px-4 py-3 text-left font-medium">Descripción</th>
              <th className="px-4 py-3 text-left font-medium">Unidad</th>
              <th className="px-4 py-3 text-right font-medium">Precio unit.</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.codigo ?? "—"}</td>
                <td className="px-4 py-3 font-medium">{item.descripcion}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.unidad}</td>
                <td className="px-4 py-3 text-right font-semibold">
                  ${Number(item.precioUnitario).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link href={`/items/${item.id}/editar`} className="text-primary text-xs hover:underline">Editar</Link>
                  <form className="inline" action={async () => { "use server"; await toggleItemActivo(item.id); }}>
                    <button type="submit" className="text-xs text-muted-foreground hover:underline">
                      {item.activo ? "Desactivar" : "Activar"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No hay items registrados</p>}
      </div>
    </div>
  );
}
