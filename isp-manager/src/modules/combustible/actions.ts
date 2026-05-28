"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { checkPermission } from "@/lib/permissions";
import { combustibleSchema } from "@/lib/validations";
import { Modulo, TipoCombustible } from "@/generated/prisma/enums";
import { type FiltrosCombustible, whereCombustible } from "./filtros";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

async function guardCombustible() {
  const session = await auth();
  if (!session?.user?.id) return { session: null, error: "No autenticado" };
  const ok = await checkPermission(session.user.id, Modulo.COMBUSTIBLE);
  if (!ok) return { session: null, error: "Sin permisos" };
  return { session, error: null };
}

export async function getRegistrosCombustible(filtros: FiltrosCombustible = {}) {
  const { session, error } = await guardCombustible();
  if (!session) return { success: false as const, error: error! };

  const registros = await db.registroCombustible.findMany({
    where: whereCombustible(filtros),
    orderBy: { fecha: "desc" },
    include: {
      vehiculo: { select: { patente: true, marca: true, modelo: true } },
      empleado: { select: { nombre: true, apellido: true } },
    },
  });
  return { success: true as const, data: registros };
}

/**
 * Días (yyyy-MM-dd, UTC) que tienen al menos una carga, opcionalmente acotados
 * por vehículo/empleado. NO aplica el filtro de fecha: sirve para resaltar en el
 * calendario qué días tienen cargas dentro del alcance seleccionado.
 */
export async function getDiasConCargas(filtros: Pick<FiltrosCombustible, "vehiculoId" | "empleadoId"> = {}) {
  const { session, error } = await guardCombustible();
  if (!session) return { success: false as const, error: error! };

  const registros = await db.registroCombustible.findMany({
    where: {
      ...(filtros.vehiculoId ? { vehiculoId: filtros.vehiculoId } : {}),
      ...(filtros.empleadoId ? { empleadoId: filtros.empleadoId } : {}),
    },
    select: { fecha: true },
  });

  const dias = Array.from(new Set(registros.map((r) => r.fecha.toISOString().slice(0, 10))));
  return { success: true as const, data: dias };
}

export async function createRegistroCombustible(rawData: unknown): Promise<ActionResult<{ id: string }>> {
  const { session, error } = await guardCombustible();
  if (!session) return { success: false, error: error! };

  const parsed = combustibleSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  // Calcular km desde el último registro y consumo
  const ultimo = await db.registroCombustible.findFirst({
    where: { vehiculoId: parsed.data.vehiculoId },
    orderBy: { odometro: "desc" },
  });

  const kmDesdeUltimo =
    ultimo && parsed.data.odometro > ultimo.odometro
      ? parsed.data.odometro - ultimo.odometro
      : null;

  const consumo =
    kmDesdeUltimo && kmDesdeUltimo > 0
      ? parsed.data.litros / (kmDesdeUltimo / 100)
      : null;

  const costoTotal = parsed.data.litros * parsed.data.precioPorLitro;

  const registro = await db.registroCombustible.create({
    data: {
      vehiculoId: parsed.data.vehiculoId,
      empleadoId: parsed.data.empleadoId,
      fecha: new Date(parsed.data.fecha),
      litros: parsed.data.litros,
      precioPorLitro: parsed.data.precioPorLitro,
      costoTotal,
      odometro: parsed.data.odometro,
      kmDesdeUltimo,
      consumo,
      tipoCombustible: parsed.data.tipoCombustible as TipoCombustible,
      estacion: parsed.data.estacion,
      notas: parsed.data.notas,
    },
  });

  // Actualizar odómetro del vehículo si es mayor al actual
  await db.vehiculo.updateMany({
    where: { id: parsed.data.vehiculoId, odometroActual: { lt: parsed.data.odometro } },
    data: { odometroActual: parsed.data.odometro },
  });

  void logAudit({ empleadoId: session.user.id, accion: "REGISTRAR_COMBUSTIBLE", modulo: "COMBUSTIBLE", entidadId: registro.id, detalles: { vehiculoId: parsed.data.vehiculoId, litros: parsed.data.litros, costoTotal, odometro: parsed.data.odometro, tipoCombustible: parsed.data.tipoCombustible } });
  revalidatePath("/combustible");
  revalidatePath(`/flota/${parsed.data.vehiculoId}`);
  return { success: true, data: { id: registro.id } };
}
