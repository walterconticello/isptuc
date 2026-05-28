"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { checkPermission } from "@/lib/permissions";
import { z } from "zod";
import { Modulo } from "@/generated/prisma/enums";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

const clienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  cuit: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
});

async function guardClientes() {
  const session = await auth();
  if (!session?.user?.id) return { session: null, error: "No autenticado" };
  const ok = await checkPermission(session.user.id, Modulo.CLIENTES);
  if (!ok) return { session: null, error: "Sin permisos" };
  return { session, error: null };
}

export async function getClientes() {
  const { session, error } = await guardClientes();
  if (!session) return { success: false as const, error: error! };

  const clientes = await db.cliente.findMany({ orderBy: { nombre: "asc" } });
  return { success: true as const, data: clientes };
}

export async function getClienteById(id: string) {
  const { session, error } = await guardClientes();
  if (!session) return { success: false as const, error: error! };

  const cliente = await db.cliente.findUnique({ where: { id } });
  if (!cliente) return { success: false as const, error: "Cliente no encontrado" };
  return { success: true as const, data: cliente };
}

export async function createCliente(rawData: unknown): Promise<ActionResult<{ id: string }>> {
  const { session, error } = await guardClientes();
  if (!session) return { success: false, error: error! };

  const parsed = clienteSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const cliente = await db.cliente.create({
    data: {
      nombre: parsed.data.nombre,
      cuit: parsed.data.cuit || null,
      direccion: parsed.data.direccion || null,
      telefono: parsed.data.telefono || null,
      email: parsed.data.email || null,
    },
  });

  void logAudit({ empleadoId: session.user.id, accion: "CREAR_CLIENTE", modulo: "CLIENTES", entidadId: cliente.id, entidadNombre: parsed.data.nombre });
  revalidatePath("/clientes");
  return { success: true, data: { id: cliente.id } };
}

export async function updateCliente(id: string, rawData: unknown): Promise<ActionResult> {
  const { session, error } = await guardClientes();
  if (!session) return { success: false, error: error! };

  const parsed = clienteSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  await db.cliente.update({
    where: { id },
    data: {
      nombre: parsed.data.nombre,
      cuit: parsed.data.cuit || null,
      direccion: parsed.data.direccion || null,
      telefono: parsed.data.telefono || null,
      email: parsed.data.email || null,
    },
  });

  void logAudit({ empleadoId: session.user.id, accion: "EDITAR_CLIENTE", modulo: "CLIENTES", entidadId: id, entidadNombre: parsed.data.nombre });
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  return { success: true, data: undefined };
}
