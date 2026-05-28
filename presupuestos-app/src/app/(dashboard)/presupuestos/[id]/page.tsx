import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PresupuestoEditor } from "@/components/presupuesto/PresupuestoEditor";

export default async function EditPresupuestoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [company, presupuesto] = await Promise.all([
    prisma.company.findFirst(),
    prisma.presupuesto.findUnique({
      where: { id },
      include: {
        cliente: true,
        items: { include: { item: true }, orderBy: { orden: "asc" } },
      },
    }),
  ]);

  if (!presupuesto) notFound();

  const editorData = {
    id: presupuesto.id,
    numero: presupuesto.numero,
    cliente: presupuesto.cliente,
    validezDias: presupuesto.validezDias,
    ivaPorcentaje: Number(presupuesto.ivaPorcentaje),
    notas: presupuesto.notas ?? "",
    estado: presupuesto.estado,
    items: presupuesto.items.map((item) => ({
      id: item.id,
      itemId: item.itemId ?? undefined,
      descripcionCustom: item.descripcionCustom ?? undefined,
      descripcion: item.item?.descripcion ?? item.descripcionCustom ?? "",
      cantidad: Number(item.cantidad),
      precioUnitario: Number(item.precioUnitario),
      subtotal: Number(item.subtotal),
      orden: item.orden,
    })),
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6 print:hidden">
        Presupuesto N° {presupuesto.numero.toString().padStart(4, "0")}
      </h1>
      <PresupuestoEditor company={company} presupuesto={editorData} />
    </div>
  );
}
