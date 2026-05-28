"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { checkPermission } from "@/lib/permissions";
import { Modulo, Rol } from "@/generated/prisma/enums";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

type PermisosMatrix = Record<Rol, Record<Modulo, boolean>>;

async function guardAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { session: null, error: "No autenticado" };
  const ok = await checkPermission(session.user.id, Modulo.ADMIN);
  if (!ok) return { session: null, error: "Sin permisos de administración" };
  return { session, error: null };
}

export async function getPermisosMatrix(): Promise<ActionResult<PermisosMatrix>> {
  const { session, error } = await guardAdmin();
  if (!session) return { success: false, error: error! };

  const todos = await db.permisoModulo.findMany();

  const matrix = {} as PermisosMatrix;
  for (const rol of Object.values(Rol)) {
    matrix[rol] = {} as Record<Modulo, boolean>;
    for (const modulo of Object.values(Modulo)) {
      matrix[rol][modulo] = false;
    }
  }
  for (const p of todos) {
    matrix[p.rol][p.modulo] = p.puede;
  }

  return { success: true, data: matrix };
}

export async function togglePermiso(rol: Rol, modulo: Modulo): Promise<ActionResult> {
  const { session, error } = await guardAdmin();
  if (!session) return { success: false, error: error! };

  // DUENO siempre mantiene acceso a ADMIN
  if (rol === Rol.DUENO && modulo === Modulo.ADMIN) {
    return { success: false, error: "El dueño siempre debe tener acceso a Administración" };
  }

  const actual = await db.permisoModulo.findUnique({
    where: { rol_modulo: { rol, modulo } },
  });

  if (!actual) return { success: false, error: "Permiso no encontrado" };

  await db.permisoModulo.update({
    where: { rol_modulo: { rol, modulo } },
    data: { puede: !actual.puede },
  });

  void logAudit({ empleadoId: session.user.id, accion: "CAMBIAR_PERMISO", modulo: "ADMIN", detalles: { rol, modulo, anteriorPuede: actual.puede, nuevoPuede: !actual.puede } });
  revalidatePath("/admin/permisos");
  return { success: true, data: undefined };
}
