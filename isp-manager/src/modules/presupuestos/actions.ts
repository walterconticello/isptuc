"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkPermission } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { z } from "zod";
import { Modulo, EstadoPresupuesto } from "@/generated/prisma/enums";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

async function guardPresupuestos() {
  const session = await auth();
  if (!session?.user?.id) return { session: null, error: "No autenticado" };
  const ok = await checkPermission(session.user.id, Modulo.PRESUPUESTOS);
  if (!ok) return { session: null, error: "Sin permisos" };
  return { session, error: null };
}

const lineaSchema = z.object({
  itemServicioId: z.string().optional(),
  descripcionCustom: z.string().optional(),
  cantidad: z.coerce.number().positive(),
  precioUnitario: z.coerce.number().positive(),
  orden: z.coerce.number().int(),
});

const presupuestoSchema = z.object({
  clienteId: z.string().min(1, "Seleccioná un cliente"),
  validezDias: z.coerce.number().int().min(1).default(15),
  notas: z.string().optional(),
  ivaPorcentaje: z.coerce.number().min(0).default(21),
  lineas: z.array(lineaSchema).min(1, "Agregá al menos un ítem"),
});

export async function getPresupuestos() {
  const { session, error } = await guardPresupuestos();
  if (!session) return { success: false as const, error: error! };

  const presupuestos = await db.presupuesto.findMany({
    orderBy: { numero: "desc" },
    include: {
      cliente: { select: { nombre: true } },
      creadoPor: { select: { nombre: true, apellido: true } },
    },
  });
  return { success: true as const, data: presupuestos };
}

export async function getPresupuestoById(id: string) {
  const { session, error } = await guardPresupuestos();
  if (!session) return { success: false as const, error: error! };

  const p = await db.presupuesto.findUnique({
    where: { id },
    include: {
      cliente: true,
      creadoPor: { select: { nombre: true, apellido: true } },
      items: {
        include: { itemServicio: { select: { codigo: true, descripcion: true } } },
        orderBy: { orden: "asc" },
      },
    },
  });
  if (!p) return { success: false as const, error: "Presupuesto no encontrado" };
  return { success: true as const, data: p };
}

export async function createPresupuesto(rawData: unknown): Promise<ActionResult<{ id: string }>> {
  const { session, error } = await guardPresupuestos();
  if (!session) return { success: false, error: error! };

  const parsed = presupuestoSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { clienteId, validezDias, notas, ivaPorcentaje, lineas } = parsed.data;

  const subtotal = lineas.reduce((s, l) => s + l.cantidad * l.precioUnitario, 0);
  const ivaImporte = subtotal * (ivaPorcentaje / 100);
  const total = subtotal + ivaImporte;

  const fechaEmision = new Date();
  const fechaVencimiento = new Date(fechaEmision);
  fechaVencimiento.setDate(fechaVencimiento.getDate() + validezDias);

  const presupuesto = await db.presupuesto.create({
    data: {
      clienteId,
      validezDias,
      notas,
      ivaPorcentaje,
      ivaImporte,
      subtotal,
      total,
      fechaEmision,
      fechaVencimiento,
      creadoPorId: session.user.id,
      items: {
        create: lineas.map((l) => ({
          itemServicioId: l.itemServicioId || null,
          descripcionCustom: l.descripcionCustom || null,
          cantidad: l.cantidad,
          precioUnitario: l.precioUnitario,
          subtotal: l.cantidad * l.precioUnitario,
          orden: l.orden,
        })),
      },
    },
  });

  void logAudit({ empleadoId: session.user.id, accion: "CREAR_PRESUPUESTO", modulo: "PRESUPUESTOS", entidadId: presupuesto.id, entidadNombre: `#${presupuesto.numero}`, detalles: { clienteId, total, ivaPorcentaje } });
  revalidatePath("/presupuestos");
  return { success: true, data: { id: presupuesto.id } };
}

export async function cambiarEstado(id: string, estado: EstadoPresupuesto): Promise<ActionResult> {
  const { session, error } = await guardPresupuestos();
  if (!session) return { success: false, error: error! };

  const anterior = await db.presupuesto.findUnique({ where: { id }, select: { estado: true, numero: true } });
  await db.presupuesto.update({ where: { id }, data: { estado } });
  void logAudit({ empleadoId: session.user.id, accion: "CAMBIAR_ESTADO_PRESUPUESTO", modulo: "PRESUPUESTOS", entidadId: id, entidadNombre: anterior ? `#${anterior.numero}` : id, detalles: { estadoAnterior: anterior?.estado, estadoNuevo: estado } });
  revalidatePath("/presupuestos");
  revalidatePath(`/presupuestos/${id}`);
  return { success: true, data: undefined };
}
