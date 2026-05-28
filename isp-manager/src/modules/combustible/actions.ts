"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkPermission } from "@/lib/permissions";
import { combustibleSchema } from "@/lib/validations";
import { Modulo, TipoCombustible } from "@/generated/prisma/client";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

async function guardCombustible() {
  const session = await auth();
  if (!session?.user?.id) return { session: null, error: "No autenticado" };
  const ok = await checkPermission(session.user.id, Modulo.COMBUSTIBLE);
  if (!ok) return { session: null, error: "Sin permisos" };
  return { session, error: null };
}

export async function getRegistrosCombustible(vehiculoId?: string) {
  const { session, error } = await guardCombustible();
  if (!session) return { success: false as const, error: error! };

  const registros = await db.registroCombustible.findMany({
    where: vehiculoId ? { vehiculoId } : undefined,
    orderBy: { fecha: "desc" },
    include: {
      vehiculo: { select: { patente: true, marca: true, modelo: true } },
      empleado: { select: { nombre: true, apellido: true } },
    },
  });
  return { success: true as const, data: registros };
}

export async function getResumenMensual() {
  const { session, error } = await guardCombustible();
  if (!session) return { success: false as const, error: error! };

  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  const registros = await db.registroCombustible.findMany({
    where: { fecha: { gte: inicioMes } },
  });

  const totalCosto = registros.reduce((s, r) => s + r.costoTotal, 0);
  const totalLitros = registros.reduce((s, r) => s + r.litros, 0);
  const cantidadCargas = registros.length;

  return {
    success: true as const,
    data: { totalCosto, totalLitros, cantidadCargas, mes: ahora.getMonth() + 1 },
  };
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

  revalidatePath("/combustible");
  revalidatePath(`/flota/${parsed.data.vehiculoId}`);
  return { success: true, data: { id: registro.id } };
}
