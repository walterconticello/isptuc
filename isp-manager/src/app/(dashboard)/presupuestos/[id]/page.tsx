import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import { getPresupuestoById, cambiarEstado } from "@/modules/presupuestos/actions";
import { codigoPresupuesto } from "@/modules/presupuestos/codigo";
import { Modulo, EstadoPresupuesto } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { PrintButton } from "../_components/print-button";
import { PresupuestoDocumento } from "../_components/presupuesto-documento";

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

  const [result, empresa] = await Promise.all([getPresupuestoById(id), db.empresa.findFirst()]);
  if (!result.success) notFound();
  const p = result.data;

  const estado = p.estado as EstadoPresupuesto;
  const siguientesEstados = TRANSICIONES[estado];

  const lineas = p.items.map((item) => ({
    descripcion: [item.itemServicio?.descripcion ?? item.descripcionCustom ?? "", item.itemServicio?.codigo ? `(${item.itemServicio.codigo})` : ""]
      .filter(Boolean)
      .join(" "),
    cantidad: Number(item.cantidad),
    precioUnitario: Number(item.precioUnitario),
    subtotal: Number(item.subtotal),
  }));

  return (
    <div className="space-y-4">
      {/* Barra de herramientas — oculta al imprimir */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/presupuestos" className="text-muted-foreground hover:text-foreground" aria-label="Volver a presupuestos">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">{codigoPresupuesto(p.numero, new Date(p.fechaEmision))}</h1>
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", ESTADO_COLOR[estado])}>
            {ESTADO_LABEL[estado]}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {siguientesEstados.map((siguiente) => (
            <form key={siguiente} action={async () => { "use server"; await cambiarEstado(id, siguiente); }}>
              <button type="submit" className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                siguiente === "ACEPTADO" && "border-green-600 text-green-600 hover:bg-green-50",
                siguiente === "RECHAZADO" && "border-destructive text-destructive hover:bg-destructive/10",
                siguiente === "ENVIADO" && "border-primary text-primary hover:bg-primary/10",
                siguiente === "BORRADOR" && "border-border hover:bg-accent",
              )}>
                Marcar como {ESTADO_LABEL[siguiente]}
              </button>
            </form>
          ))}
          <PrintButton />
        </div>
      </div>

      <PresupuestoDocumento
        empresa={empresa}
        cliente={p.cliente}
        lineas={lineas}
        numero={p.numero}
        estado={estado}
        fechaEmision={new Date(p.fechaEmision)}
        fechaVencimiento={new Date(p.fechaVencimiento)}
        validezDias={p.validezDias}
        subtotal={Number(p.subtotal)}
        ivaPorcentaje={Number(p.ivaPorcentaje)}
        ivaImporte={Number(p.ivaImporte)}
        total={Number(p.total)}
        notas={p.notas}
      />
    </div>
  );
}
