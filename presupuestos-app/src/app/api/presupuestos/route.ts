import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PresupuestoSchema } from "@/lib/validations";
import { calcularSubtotalLinea, calcularTotales, calcularFechaVencimiento } from "@/lib/calculations";

export async function GET(req: NextRequest) {
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? "1"));
  const pageSize = 20;

  const [presupuestos, total] = await Promise.all([
    prisma.presupuesto.findMany({
      include: { cliente: true, creadoPor: { select: { nombre: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.presupuesto.count(),
  ]);

  return NextResponse.json({ presupuestos, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = PresupuestoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { clienteId, validezDias, ivaPorcentaje, notas, items } = parsed.data;
  const { subtotal, ivaImporte, total } = calcularTotales(items, ivaPorcentaje);
  const fechaEmision = new Date();
  const fechaVencimiento = calcularFechaVencimiento(fechaEmision, validezDias);

  const presupuesto = await prisma.$transaction(async (tx) => {
    return tx.presupuesto.create({
      data: {
        clienteId,
        validezDias,
        fechaEmision,
        fechaVencimiento,
        notas,
        subtotal,
        ivaPorcentaje,
        ivaImporte,
        total,
        creadoPorId: session.user!.id!,
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

  return NextResponse.json(presupuesto, { status: 201 });
}
