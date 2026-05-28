import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getPresupuestoById, cambiarEstado } from "@/modules/presupuestos/actions";
import { Modulo, EstadoPresupuesto } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { ChevronLeft, Printer } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ESTADO_LABEL: Record<EstadoPresupuesto, string> = {
  BORRADOR: "Borrador", ENVIADO: "Enviado", ACEPTADO: "Aceptado", RECHAZADO: "Rechazado",
};
const ESTADO_COLOR: Record<EstadoPresupuesto, string> = {
  BORRADOR:  "bg-gray-100 text-gray-600",
  ENVIADO:   "bg-blue-100 text-blue-700",
  ACEPTADO:  "bg-green-100 text-green-700",
  RECHAZADO: "bg-red-100 text-red-700",
};
const TRANSICIONES: Record<EstadoPresupuesto, EstadoPresupuesto[]> = {
  BORRADOR:  ["ENVIADO"],
  ENVIADO:   ["ACEPTADO", "RECHAZADO"],
  ACEPTADO:  [],
  RECHAZADO: ["BORRADOR"],
};

export default async function PresupuestoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.PRESUPUESTOS);
  if (!ok) redirect("/dashboard");

  const result = await getPresupuestoById(id);
  if (!result.success) notFound();
  const p = result.data;

  const fmt = (n: unknown) =>
    Number(String(n)).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const siguientesEstados = TRANSICIONES[p.estado as EstadoPresupuesto];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/presupuestos" className="text-muted-foreground hover:text-foreground"><ChevronLeft className="h-5 w-5" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Presupuesto #{String(p.numero).padStart(4, "0")}</h1>
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", ESTADO_COLOR[p.estado as EstadoPresupuesto])}>
              {ESTADO_LABEL[p.estado as EstadoPresupuesto]}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {p.creadoPor.nombre} {p.creadoPor.apellido} · {format(new Date(p.fechaEmision), "dd/MM/yyyy", { locale: es })}
          </p>
        </div>
      </div>

      {/* Cliente */}
      <div className="rounded-lg border bg-card p-5 space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Cliente</p>
        <p className="font-semibold text-lg">{p.cliente.nombre}</p>
        {p.cliente.cuit && <p className="text-sm text-muted-foreground">CUIT: {p.cliente.cuit}</p>}
        {p.cliente.telefono && <p className="text-sm text-muted-foreground">{p.cliente.telefono}</p>}
        {p.cliente.direccion && <p className="text-sm text-muted-foreground">{p.cliente.direccion}</p>}
        <p className="text-sm text-muted-foreground">
          Válido hasta: {format(new Date(p.fechaVencimiento), "dd/MM/yyyy", { locale: es })} ({p.validezDias} días)
        </p>
      </div>

      {/* Ítems */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="hidden sm:grid grid-cols-[3fr_1fr_1fr_1fr] gap-3 px-5 py-2 text-xs text-muted-foreground font-medium border-b bg-muted/30">
          <span>Descripción</span><span className="text-center">Cant.</span>
          <span className="text-right">Precio</span><span className="text-right">Subtotal</span>
        </div>
        <div className="divide-y">
          {p.items.map((item) => (
            <div key={item.id} className="px-5 py-3 sm:grid sm:grid-cols-[3fr_1fr_1fr_1fr] sm:gap-3 sm:items-center space-y-1 sm:space-y-0">
              <p className="text-sm font-medium">
                {item.itemServicio?.descripcion ?? item.descripcionCustom}
                {item.itemServicio?.codigo && <span className="ml-2 text-xs text-muted-foreground">({item.itemServicio.codigo})</span>}
              </p>
              <p className="text-sm text-center text-muted-foreground sm:block hidden">{Number(item.cantidad).toFixed(2)}</p>
              <p className="text-sm text-right text-muted-foreground sm:block hidden">${fmt(item.precioUnitario)}</p>
              <p className="text-sm font-semibold text-right">${fmt(item.subtotal)}</p>
              <p className="text-xs text-muted-foreground sm:hidden">
                {Number(item.cantidad).toFixed(2)} × ${fmt(item.precioUnitario)}
              </p>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t bg-muted/20 space-y-1.5">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>${fmt(p.subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">IVA {Number(p.ivaPorcentaje).toFixed(1)}%</span><span>${fmt(p.ivaImporte)}</span></div>
          <div className="flex justify-between font-semibold text-base border-t pt-2"><span>Total</span><span>${fmt(p.total)}</span></div>
        </div>
      </div>

      {p.notas && (
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Notas</p>
          <p className="text-sm">{p.notas}</p>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-wrap gap-3">
        {siguientesEstados.map((estado) => (
          <form key={estado} action={async () => { "use server"; await cambiarEstado(id, estado); }}>
            <button type="submit" className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium border transition-colors",
              estado === "ACEPTADO" && "border-green-600 text-green-600 hover:bg-green-50",
              estado === "RECHAZADO" && "border-destructive text-destructive hover:bg-destructive/10",
              estado === "ENVIADO" && "border-primary text-primary hover:bg-primary/10",
              estado === "BORRADOR" && "border-border hover:bg-accent",
            )}>
              Marcar como {ESTADO_LABEL[estado]}
            </button>
          </form>
        ))}
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          <Printer className="h-4 w-4" /> Imprimir / PDF
        </button>
      </div>
    </div>
  );
}
