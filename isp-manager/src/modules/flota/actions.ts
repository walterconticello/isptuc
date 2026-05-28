"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { checkPermission } from "@/lib/permissions";
import { vehiculoSchema } from "@/lib/validations";
import { Modulo, TipoVehiculo, EstadoVehiculo } from "@/generated/prisma/enums";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

async function guardFlota() {
  const session = await auth();
  if (!session?.user?.id) return { session: null, error: "No autenticado" };
  const ok = await checkPermission(session.user.id, Modulo.FLOTA);
  if (!ok) return { session: null, error: "Sin permisos" };
  return { session, error: null };
}

export async function getVehiculos() {
  const { session, error } = await guardFlota();
  if (!session) return { success: false as const, error: error! };

  const vehiculos = await db.vehiculo.findMany({
    orderBy: { patente: "asc" },
    include: { cuadrilla: { select: { nombre: true } } },
  });
  return { success: true as const, data: vehiculos };
}

export async function getVehiculoById(id: string) {
  const { session, error } = await guardFlota();
  if (!session) return { success: false as const, error: error! };

  const vehiculo = await db.vehiculo.findUnique({
    where: { id },
    include: {
      cuadrilla: { select: { id: true, nombre: true } },
      registrosCombustible: {
        orderBy: { fecha: "desc" },
        take: 5,
        include: { empleado: { select: { nombre: true, apellido: true } } },
      },
    },
  });
  if (!vehiculo) return { success: false as const, error: "Vehículo no encontrado" };
  return { success: true as const, data: vehiculo };
}

export async function createVehiculo(rawData: unknown): Promise<ActionResult<{ id: string }>> {
  const { session, error } = await guardFlota();
  if (!session) return { success: false, error: error! };

  const parsed = vehiculoSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const existing = await db.vehiculo.findUnique({ where: { patente: parsed.data.patente } });
  if (existing) return { success: false, error: "Ya existe un vehículo con esa patente" };

  const vehiculo = await db.vehiculo.create({
    data: {
      patente: parsed.data.patente,
      marca: parsed.data.marca,
      modelo: parsed.data.modelo,
      anio: parsed.data.anio,
      tipo: parsed.data.tipo as TipoVehiculo,
      estado: parsed.data.estado as EstadoVehiculo,
      odometroActual: parsed.data.odometroActual,
      cuadrillaId: parsed.data.cuadrillaId || null,
      notas: parsed.data.notas,
    },
  });

  void logAudit({ empleadoId: session.user.id, accion: "CREAR_VEHICULO", modulo: "FLOTA", entidadId: vehiculo.id, entidadNombre: `${parsed.data.patente} — ${parsed.data.marca} ${parsed.data.modelo}` });
  revalidatePath("/flota");
  return { success: true, data: { id: vehiculo.id } };
}

export async function updateVehiculo(id: string, rawData: unknown): Promise<ActionResult> {
  const { session, error } = await guardFlota();
  if (!session) return { success: false, error: error! };

  const parsed = vehiculoSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  await db.vehiculo.update({
    where: { id },
    data: {
      patente: parsed.data.patente,
      marca: parsed.data.marca,
      modelo: parsed.data.modelo,
      anio: parsed.data.anio,
      tipo: parsed.data.tipo as TipoVehiculo,
      estado: parsed.data.estado as EstadoVehiculo,
      odometroActual: parsed.data.odometroActual,
      cuadrillaId: parsed.data.cuadrillaId || null,
      notas: parsed.data.notas,
    },
  });

  void logAudit({ empleadoId: session.user.id, accion: "EDITAR_VEHICULO", modulo: "FLOTA", entidadId: id, entidadNombre: `${parsed.data.patente}` });
  revalidatePath("/flota");
  revalidatePath(`/flota/${id}`);
  return { success: true, data: undefined };
}
