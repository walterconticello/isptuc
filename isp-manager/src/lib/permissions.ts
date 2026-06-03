import { db } from "@/lib/db";
import { Modulo, Rol } from "@/generated/prisma/enums";

// Jerarquía de roles (mayor número = más autoridad). Fuente única de verdad para
// decidir qué roles puede gestionar cada actor y evitar escaladas de privilegio.
export const JERARQUIA_ROLES: Record<Rol, number> = {
  DUENO: 4,
  GERENTE: 3,
  ADMIN: 2,
  ADMINISTRATIVO: 1,
  TECNICO: 0,
};

/**
 * ¿El actor puede crear/editar/asignar el rol objetivo?
 * - DUENO puede gestionar cualquier rol (incluido otro DUENO).
 * - El resto solo puede gestionar roles ESTRICTAMENTE inferiores al propio,
 *   nunca uno igual o superior. Cierra el hallazgo A1 (escalada de privilegios).
 */
export function puedeGestionarRol(rolActor: Rol, rolObjetivo: Rol): boolean {
  if (rolActor === "DUENO") return true;
  return JERARQUIA_ROLES[rolActor] > JERARQUIA_ROLES[rolObjetivo];
}

/** Rol actual de un empleado, o null si no existe. */
export async function getRolEmpleado(empleadoId: string): Promise<Rol | null> {
  const empleado = await db.empleado.findUnique({
    where: { id: empleadoId },
    select: { rol: true },
  });
  return empleado?.rol ?? null;
}

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
