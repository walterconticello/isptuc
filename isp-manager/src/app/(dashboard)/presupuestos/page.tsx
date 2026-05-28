import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getPresupuestos } from "@/modules/presupuestos/actions";
import { Modulo, EstadoPresupuesto } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { Plus, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ESTADO_LABEL: Record<EstadoPresupuesto, string> = {
  BORRADOR: "Borrador", ENVIADO: "Enviado", ACEPTADO: "Aceptado", RECHAZADO: "Rechazado",
};
const ESTADO_COLOR: Record<EstadoPresupuesto, string> = {
  BORRADOR:  "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  ENVIADO:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  ACEPTADO:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  RECHAZADO: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default async function PresupuestosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.PRESUPUESTOS);
  if (!ok) redirect("/dashboard");

  const result = await getPresupuestos();
  if (!result.success) redirect("/dashboard");
  const presupuestos = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Presupuestos</h1>
          <p className="text-sm text-muted-foreground">{presupuestos.length} presupuestos</p>
        </div>
        <Link href="/presupuestos/nuevo"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /><span className="hidden sm:inline">Nuevo presupuesto</span><span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      {/* Tabla desktop */}
      <div className="hidden md:block rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">N°</th>
              <th className="px-4 py-3 text-left font-medium">Cliente</th>
              <th className="px-4 py-3 text-left font-medium">Fecha</th>
              <th className="px-4 py-3 text-left font-medium">Vence</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {presupuestos.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-muted-foreground">#{String(p.numero).padStart(4, "0")}</td>
                <td className="px-4 py-3 font-medium">{p.cliente.nombre}</td>
                <td className="px-4 py-3 text-muted-foreground">{format(new Date(p.fechaEmision), "dd/MM/yy", { locale: es })}</td>
                <td className="px-4 py-3 text-muted-foreground">{format(new Date(p.fechaVencimiento), "dd/MM/yy", { locale: es })}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", ESTADO_COLOR[p.estado as EstadoPresupuesto])}>
                    {ESTADO_LABEL[p.estado as EstadoPresupuesto]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  ${Number(p.total).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/presupuestos/${p.id}`} className="text-primary text-xs hover:underline">Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {presupuestos.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No hay presupuestos</p>}
      </div>

      {/* Cards mobile */}
      <div className="grid gap-3 md:hidden">
        {presupuestos.map((p) => (
          <Link key={p.id} href={`/presupuestos/${p.id}`} className="rounded-lg border bg-card p-4 block hover:bg-accent/30">
            <div className="flex items-start justify-between mb-1">
              <p className="font-medium">{p.cliente.nombre}</p>
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", ESTADO_COLOR[p.estado as EstadoPresupuesto])}>
                {ESTADO_LABEL[p.estado as EstadoPresupuesto]}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>#{String(p.numero).padStart(4, "0")} · {format(new Date(p.fechaEmision), "dd/MM/yy", { locale: es })}</span>
              <span className="font-semibold text-foreground">${Number(p.total).toLocaleString("es-AR", { maximumFractionDigits: 0 })}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
