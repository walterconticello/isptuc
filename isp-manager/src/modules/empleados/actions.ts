"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { checkPermission } from "@/lib/permissions";
import { crearEmpleadoSchema, editarEmpleadoSchema } from "@/lib/validations";
import { Modulo } from "@/generated/prisma/enums";
import bcrypt from "bcryptjs";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

async function getSessionOrFail() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session;
}

export async function getEmpleados(page = 1, pageSize = 20) {
  const session = await getSessionOrFail();
  if (!session) return { success: false as const, error: "No autenticado" };

  const ok = await checkPermission(session.user.id, Modulo.EMPLEADOS);
  if (!ok) return { success: false as const, error: "Sin permisos" };

  const [empleados, total] = await Promise.all([
    db.empleado.findMany({
      orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, nombre: true, apellido: true, email: true,
        dni: true, telefono: true, rol: true, activo: true, createdAt: true,
      },
    }),
    db.empleado.count(),
  ]);

  return { success: true as const, data: { empleados, total, page, pageSize } };
}

export async function getEmpleadoById(id: string) {
  const session = await getSessionOrFail();
  if (!session) return { success: false as const, error: "No autenticado" };

  const ok = await checkPermission(session.user.id, Modulo.EMPLEADOS);
  if (!ok) return { success: false as const, error: "Sin permisos" };

  const empleado = await db.empleado.findUnique({
    where: { id },
    select: {
      id: true, nombre: true, apellido: true, email: true,
      dni: true, telefono: true, rol: true, activo: true, createdAt: true,
    },
  });

  if (!empleado) return { success: false as const, error: "Empleado no encontrado" };
  return { success: true as const, data: empleado };
}

export async function createEmpleado(rawData: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await getSessionOrFail();
  if (!session) return { success: false, error: "No autenticado" };

  const ok = await checkPermission(session.user.id, Modulo.EMPLEADOS);
  if (!ok) return { success: false, error: "Sin permisos" };

  const parsed = crearEmpleadoSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const existing = await db.empleado.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { success: false, error: "Ya existe un empleado con ese email" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const empleado = await db.empleado.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      nombre: parsed.data.nombre,
      apellido: parsed.data.apellido,
      dni: parsed.data.dni,
      telefono: parsed.data.telefono,
      rol: parsed.data.rol as import("@/generated/prisma/client").Rol,
    },
  });

  void logAudit({ empleadoId: session.user.id, accion: "CREAR_EMPLEADO", modulo: "EMPLEADOS", entidadId: empleado.id, entidadNombre: `${parsed.data.nombre} ${parsed.data.apellido}`, detalles: { rol: parsed.data.rol, email: parsed.data.email } });
  revalidatePath("/empleados");
  return { success: true, data: { id: empleado.id } };
}

export async function updateEmpleado(id: string, rawData: unknown): Promise<ActionResult> {
  const session = await getSessionOrFail();
  if (!session) return { success: false, error: "No autenticado" };

  const ok = await checkPermission(session.user.id, Modulo.EMPLEADOS);
  if (!ok) return { success: false, error: "Sin permisos" };

  const parsed = editarEmpleadoSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  // No se puede cambiar el propio rol
  if (id === session.user.id) {
    const actual = await db.empleado.findUnique({ where: { id }, select: { rol: true } });
    if (actual && actual.rol !== parsed.data.rol) {
      return { success: false, error: "No podés cambiar tu propio rol" };
    }
  }

  const updateData: Record<string, unknown> = {
    nombre: parsed.data.nombre,
    apellido: parsed.data.apellido,
    email: parsed.data.email,
    dni: parsed.data.dni,
    telefono: parsed.data.telefono,
    rol: parsed.data.rol,
  };

  if (parsed.data.password) {
    updateData.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  }

  await db.empleado.update({ where: { id }, data: updateData });

  void logAudit({ empleadoId: session.user.id, accion: "EDITAR_EMPLEADO", modulo: "EMPLEADOS", entidadId: id, entidadNombre: `${parsed.data.nombre} ${parsed.data.apellido}` });
  revalidatePath("/empleados");
  revalidatePath(`/empleados/${id}`);
  return { success: true, data: undefined };
}

export async function toggleEmpleadoActivo(id: string): Promise<ActionResult> {
  const session = await getSessionOrFail();
  if (!session) return { success: false, error: "No autenticado" };

  const ok = await checkPermission(session.user.id, Modulo.EMPLEADOS);
  if (!ok) return { success: false, error: "Sin permisos" };

  if (id === session.user.id) {
    return { success: false, error: "No podés desactivar tu propia cuenta" };
  }

  const empleado = await db.empleado.findUnique({ where: { id }, select: { activo: true } });
  if (!empleado) return { success: false, error: "Empleado no encontrado" };

  await db.empleado.update({ where: { id }, data: { activo: !empleado.activo } });

  void logAudit({ empleadoId: session.user.id, accion: empleado.activo ? "DESACTIVAR_EMPLEADO" : "ACTIVAR_EMPLEADO", modulo: "EMPLEADOS", entidadId: id, detalles: { estadoNuevo: !empleado.activo } });
  revalidatePath("/empleados");
  return { success: true, data: undefined };
}
