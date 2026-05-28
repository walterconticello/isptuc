"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { checkPermission } from "@/lib/permissions";
import { cuadrillaSchema } from "@/lib/validations";
import { Modulo, EstadoCuadrilla } from "@/generated/prisma/enums";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

async function guardCuadrillas() {
  const session = await auth();
  if (!session?.user?.id) return { session: null, error: "No autenticado" };
  const ok = await checkPermission(session.user.id, Modulo.CUADRILLAS);
  if (!ok) return { session: null, error: "Sin permisos" };
  return { session, error: null };
}

export async function getCuadrillas() {
  const { session, error } = await guardCuadrillas();
  if (!session) return { success: false as const, error: error! };

  const cuadrillas = await db.cuadrilla.findMany({
    orderBy: { nombre: "asc" },
    include: {
      miembros: { include: { empleado: { select: { nombre: true, apellido: true, rol: true } } } },
      vehiculos: { select: { patente: true, marca: true, modelo: true, estado: true } },
    },
  });
  return { success: true as const, data: cuadrillas };
}

export async function getCuadrillaById(id: string) {
  const { session, error } = await guardCuadrillas();
  if (!session) return { success: false as const, error: error! };

  const cuadrilla = await db.cuadrilla.findUnique({
    where: { id },
    include: {
      miembros: {
        include: { empleado: { select: { id: true, nombre: true, apellido: true, rol: true, activo: true } } },
      },
      vehiculos: true,
    },
  });
  if (!cuadrilla) return { success: false as const, error: "Cuadrilla no encontrada" };
  return { success: true as const, data: cuadrilla };
}

export async function createCuadrilla(rawData: unknown): Promise<ActionResult<{ id: string }>> {
  const { session, error } = await guardCuadrillas();
  if (!session) return { success: false, error: error! };

  const parsed = cuadrillaSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const cuadrilla = await db.cuadrilla.create({
    data: {
      nombre: parsed.data.nombre,
      descripcion: parsed.data.descripcion,
      estado: EstadoCuadrilla.ACTIVA,
    },
  });

  void logAudit({ empleadoId: session.user.id, accion: "CREAR_CUADRILLA", modulo: "CUADRILLAS", entidadId: cuadrilla.id, entidadNombre: cuadrilla.nombre });
  revalidatePath("/cuadrillas");
  return { success: true, data: { id: cuadrilla.id } };
}

export async function updateCuadrilla(id: string, rawData: unknown): Promise<ActionResult> {
  const { session, error } = await guardCuadrillas();
  if (!session) return { success: false, error: error! };

  const parsed = cuadrillaSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  await db.cuadrilla.update({
    where: { id },
    data: { nombre: parsed.data.nombre, descripcion: parsed.data.descripcion },
  });

  revalidatePath("/cuadrillas");
  revalidatePath(`/cuadrillas/${id}`);
  return { success: true, data: undefined };
}

export async function toggleEstadoCuadrilla(id: string): Promise<ActionResult> {
  const { session, error } = await guardCuadrillas();
  if (!session) return { success: false, error: error! };

  const cuadrilla = await db.cuadrilla.findUnique({ where: { id }, select: { estado: true } });
  if (!cuadrilla) return { success: false, error: "Cuadrilla no encontrada" };

  const nuevoEstado = cuadrilla.estado === EstadoCuadrilla.ACTIVA
    ? EstadoCuadrilla.INACTIVA
    : EstadoCuadrilla.ACTIVA;

  await db.cuadrilla.update({ where: { id }, data: { estado: nuevoEstado } });
  void logAudit({ empleadoId: session.user.id, accion: nuevoEstado === EstadoCuadrilla.ACTIVA ? "ACTIVAR_CUADRILLA" : "DESACTIVAR_CUADRILLA", modulo: "CUADRILLAS", entidadId: id });
  revalidatePath("/cuadrillas");
  revalidatePath(`/cuadrillas/${id}`);
  return { success: true, data: undefined };
}

export async function agregarMiembro(cuadrillaId: string, empleadoId: string, esJefe: boolean): Promise<ActionResult> {
  const { session, error } = await guardCuadrillas();
  if (!session) return { success: false, error: error! };

  const existe = await db.miembroCuadrilla.findUnique({
    where: { cuadrillaId_empleadoId: { cuadrillaId, empleadoId } },
  });
  if (existe) return { success: false, error: "El empleado ya es miembro de esta cuadrilla" };

  await db.miembroCuadrilla.create({ data: { cuadrillaId, empleadoId, esJefe } });
  void logAudit({ empleadoId: session.user.id, accion: "AGREGAR_MIEMBRO_CUADRILLA", modulo: "CUADRILLAS", entidadId: cuadrillaId, detalles: { empleadoAgregadoId: empleadoId, esJefe } });
  revalidatePath(`/cuadrillas/${cuadrillaId}`);
  return { success: true, data: undefined };
}

export async function removerMiembro(cuadrillaId: string, empleadoId: string): Promise<ActionResult> {
  const { session, error } = await guardCuadrillas();
  if (!session) return { success: false, error: error! };

  await db.miembroCuadrilla.delete({
    where: { cuadrillaId_empleadoId: { cuadrillaId, empleadoId } },
  });
  void logAudit({ empleadoId: session.user.id, accion: "REMOVER_MIEMBRO_CUADRILLA", modulo: "CUADRILLAS", entidadId: cuadrillaId, detalles: { empleadoRemovidoId: empleadoId } });
  revalidatePath(`/cuadrillas/${cuadrillaId}`);
  return { success: true, data: undefined };
}
