import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getClientes } from "@/modules/clientes/actions";
import { Modulo } from "@/generated/prisma/client";
import { Plus } from "lucide-react";

export default async function ClientesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.CLIENTES);
  if (!ok) redirect("/dashboard");

  const result = await getClientes();
  if (!result.success) redirect("/dashboard");
  const clientes = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-sm text-muted-foreground">{clientes.length} clientes</p>
        </div>
        <Link href="/clientes/nuevo"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /><span className="hidden sm:inline">Nuevo cliente</span><span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      <div className="hidden md:block rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Nombre</th>
              <th className="px-4 py-3 text-left font-medium">CUIT</th>
              <th className="px-4 py-3 text-left font-medium">Teléfono</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{c.nombre}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.cuit ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.telefono ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.email ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/clientes/${c.id}/editar`} className="text-primary text-xs hover:underline">Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clientes.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No hay clientes registrados</p>}
      </div>

      <div className="grid gap-3 md:hidden">
        {clientes.map((c) => (
          <div key={c.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{c.nombre}</p>
                {c.cuit && <p className="text-xs text-muted-foreground">CUIT: {c.cuit}</p>}
                {c.telefono && <p className="text-xs text-muted-foreground">{c.telefono}</p>}
              </div>
              <Link href={`/clientes/${c.id}/editar`} className="text-primary text-sm hover:underline">Editar</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
