import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PresupuestoSchema } from "@/lib/validations";
import { calcularSubtotalLinea, calcularTotales, calcularFechaVencimiento } from "@/lib/calculations";
import { z } from "zod";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const presupuesto = await prisma.presupuesto.findUnique({
    where: { id },
    include: { cliente: true, items: { include: { item: true }, orderBy: { orden: "asc" } }, creadoPor: { select: { nombre: true } } },
  });
  if (!presupuesto) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(presupuesto);
}

const EstadoSchema = z.object({ estado: z.enum(["BORRADOR", "ENVIADO", "ACEPTADO", "RECHAZADO"]) });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Estado-only update
  const estadoParsed = EstadoSchema.safeParse(body);
  if (estadoParsed.success && Object.keys(body).length === 1) {
    const updated = await prisma.presupuesto.update({ where: { id }, data: { estado: estadoParsed.data.estado } });
    return NextResponse.json(updated);
  }

  // Full update
  const parsed = PresupuestoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { clienteId, validezDias, ivaPorcentaje, notas, items } = parsed.data;
  const { subtotal, ivaImporte, total } = calcularTotales(items, ivaPorcentaje);
  const fechaEmision = new Date();
  const fechaVencimiento = calcularFechaVencimiento(fechaEmision, validezDias);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.presupuestoItem.deleteMany({ where: { presupuestoId: id } });
    return tx.presupuesto.update({
      where: { id },
      data: {
        clienteId, validezDias, fechaEmision, fechaVencimiento, notas,
        subtotal, ivaPorcentaje, ivaImporte, total,
        items: {
          create: items.map((item) => ({
            itemId: item.itemId,
            descripcionCustom: item.descripcionCustom,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: calcularSubtotalLinea(item.cantidad, item.precioUnitario),
            orden: item.orden,
          })),
        },
      },
      include: { cliente: true, items: { include: { item: true } } },
    });
  });

  return NextResponse.json(updated);
}
