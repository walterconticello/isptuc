import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { Modulo, EstadoPresupuesto } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { getPresupuestoById } from "@/modules/presupuestos/actions";
import PresupuestoEditor from "../../_components/presupuesto-editor";

export default async function EditarPresupuestoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.PRESUPUESTOS);
  if (!ok) redirect("/dashboard");

  const result = await getPresupuestoById(id);
  if (!result.success) notFound();
  const p = result.data;
  // Solo se editan borradores; cualquier otro estado vuelve al detalle.
  if (p.estado !== EstadoPresupuesto.BORRADOR) redirect(`/presupuestos/${id}`);

  const [clientes, items, empresa] = await Promise.all([
    db.cliente.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true, cuit: true, email: true, telefono: true, direccion: true } }),
    db.itemServicio.findMany({ where: { activo: true }, orderBy: { descripcion: "asc" } })
      .then((rows) => rows.map((r) => ({ ...r, precioUnitario: Number(r.precioUnitario) }))),
    db.empresa.findFirst(),
  ]);

  const inicial = {
    id: p.id,
    numero: p.numero,
    fechaEmision: p.fechaEmision,
    clienteId: p.clienteId,
    validezDias: p.validezDias,
    ivaPorcentaje: Number(p.ivaPorcentaje),
    notas: p.notas ?? "",
    lineas: p.items.map((item) => ({
      itemServicioId: item.itemServicioId ?? undefined,
      descripcion: item.itemServicio?.descripcion ?? item.descripcionCustom ?? "",
      cantidad: Number(item.cantidad),
      precioUnitario: Number(item.precioUnitario),
    })),
  };

  return (
    <PresupuestoEditor
      clientes={clientes}
      items={items}
      empresa={empresa}
      ivaPorcentajeDefault={Number(p.ivaPorcentaje)}
      presupuesto={inicial}
    />
  );
}
