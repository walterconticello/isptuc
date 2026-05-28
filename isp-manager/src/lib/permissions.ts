import { db } from "@/lib/db";
import { Modulo } from "@/generated/prisma/client";

export async function getPermisosEmpleado(empleadoId: string): Promise<Set<Modulo>> {
  const permisos = await db.permisoModulo.findMany({
    where: { puede: true },
    select: { rol: true, modulo: true },
  });

  const empleado = await db.empleado.findUnique({
    where: { id: empleadoId },
    select: { rol: true },
  });

  if (!empleado) return new Set();

  const modulosHabilitados = permisos
    .filter((p) => p.rol === empleado.rol)
    .map((p) => p.modulo);

  return new Set(modulosHabilitados);
}

export async function checkPermission(empleadoId: string, modulo: Modulo): Promise<boolean> {
  const empleado = await db.empleado.findUnique({
    where: { id: empleadoId },
    select: { rol: true },
  });
  if (!empleado) return false;

  const permiso = await db.permisoModulo.findUnique({
    where: { rol_modulo: { rol: empleado.rol, modulo } },
  });

  return permiso?.puede ?? false;
}
