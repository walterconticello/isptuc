"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkPermission } from "@/lib/permissions";
import { z } from "zod";
import { Modulo } from "@/generated/prisma/client";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

const itemSchema = z.object({
  codigo: z.string().optional(),
  descripcion: z.string().min(1, "La descripción es requerida"),
  precioUnitario: z.coerce.number().min(0, "El precio no puede ser negativo"),
  unidad: z.string().min(1, "La unidad es requerida"),
});

async function guardItems() {
  const session = await auth();
  if (!session?.user?.id) return { session: null, error: "No autenticado" };
  const ok = await checkPermission(session.user.id, Modulo.ITEMS);
  if (!ok) return { session: null, error: "Sin permisos" };
  return { session, error: null };
}

export async function getItems() {
  const { session, error } = await guardItems();
  if (!session) return { success: false as const, error: error! };

  const items = await db.itemServicio.findMany({
    where: { activo: true },
    orderBy: { descripcion: "asc" },
  });
  return { success: true as const, data: items };
}

export async function createItem(rawData: unknown): Promise<ActionResult<{ id: string }>> {
  const { session, error } = await guardItems();
  if (!session) return { success: false, error: error! };

  const parsed = itemSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const item = await db.itemServicio.create({
    data: {
      codigo: parsed.data.codigo || null,
      descripcion: parsed.data.descripcion,
      precioUnitario: parsed.data.precioUnitario,
      unidad: parsed.data.unidad,
    },
  });

  revalidatePath("/items");
  return { success: true, data: { id: item.id } };
}

export async function updateItem(id: string, rawData: unknown): Promise<ActionResult> {
  const { session, error } = await guardItems();
  if (!session) return { success: false, error: error! };

  const parsed = itemSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  await db.itemServicio.update({
    where: { id },
    data: {
      codigo: parsed.data.codigo || null,
      descripcion: parsed.data.descripcion,
      precioUnitario: parsed.data.precioUnitario,
      unidad: parsed.data.unidad,
    },
  });

  revalidatePath("/items");
  return { success: true, data: undefined };
}

export async function toggleItemActivo(id: string): Promise<ActionResult> {
  const { session, error } = await guardItems();
  if (!session) return { success: false, error: error! };

  const item = await db.itemServicio.findUnique({ where: { id }, select: { activo: true } });
  if (!item) return { success: false, error: "Item no encontrado" };

  await db.itemServicio.update({ where: { id }, data: { activo: !item.activo } });
  revalidatePath("/items");
  return { success: true, data: undefined };
}
