"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { checkPermission } from "@/lib/permissions";
import { combustibleSchema } from "@/lib/validations";
import { Modulo, TipoCombustible } from "@/generated/prisma/enums";
import { type FiltrosCombustible, whereCombustible } from "./filtros";
import { calcularPrecioPorLitro, calcularKmDesdeUltimo, calcularConsumo } from "./calculos";

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

  const { vehiculoId, empleadoId, fecha, litros, costoTotal, odometro, tipoCombustible, estacion, notas } = parsed.data;

  // El precio por litro se calcula a partir del total del ticket.
  const precioPorLitro = calcularPrecioPorLitro(costoTotal, litros);

  // Buscar registros vecinos por odómetro: soporta cargas viejas (retroactivas)
  // insertadas en el medio del historial, no solo la última.
  const [anterior, siguiente, duplicado] = await Promise.all([
    db.registroCombustible.findFirst({
      where: { vehiculoId, odometro: { lt: odometro } },
      orderBy: { odometro: "desc" },
    }),
    db.registroCombustible.findFirst({
      where: { vehiculoId, odometro: { gt: odometro } },
      orderBy: { odometro: "asc" },
    }),
    db.registroCombustible.findFirst({
      where: { vehiculoId, odometro },
    }),
  ]);

  if (duplicado) {
    return { success: false, error: `Ya existe una carga con ${odometro.toLocaleString("es-AR")} km para este vehículo.` };
  }

  const kmDesdeUltimo = calcularKmDesdeUltimo(odometro, anterior?.odometro ?? null);
  const consumo = calcularConsumo(litros, kmDesdeUltimo);

  const registro = await db.$transaction(async (tx) => {
    const creado = await tx.registroCombustible.create({
      data: {
        vehiculoId,
        empleadoId,
        fecha: new Date(fecha),
        litros,
        precioPorLitro,
        costoTotal,
        odometro,
        kmDesdeUltimo,
        consumo,
        tipoCombustible: tipoCombustible as TipoCombustible,
        estacion,
        notas,
      },
    });

    // Si había una carga posterior, ahora su predecesor cambió: recalcular sus
    // km recorridos y consumo respecto de la carga recién insertada.
    if (siguiente) {
      const kmSiguiente = calcularKmDesdeUltimo(siguiente.odometro, odometro);
      await tx.registroCombustible.update({
        where: { id: siguiente.id },
        data: { kmDesdeUltimo: kmSiguiente, consumo: calcularConsumo(siguiente.litros, kmSiguiente) },
      });
    }

    // Solo actualizar el odómetro del vehículo si esta es la carga más reciente.
    if (!siguiente) {
      await tx.vehiculo.updateMany({
        where: { id: vehiculoId, odometroActual: { lt: odometro } },
        data: { odometroActual: odometro },
      });
    }

    return creado;
  });

  void logAudit({ empleadoId: session.user.id, accion: "REGISTRAR_COMBUSTIBLE", modulo: "COMBUSTIBLE", entidadId: registro.id, detalles: { vehiculoId, litros, costoTotal, precioPorLitro, odometro, tipoCombustible } });
  revalidatePath("/combustible");
  revalidatePath(`/flota/${vehiculoId}`);
  return { success: true, data: { id: registro.id } };
}
