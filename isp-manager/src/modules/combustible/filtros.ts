/**
 * Lógica pura de filtrado de combustible (sin acceso a DB ni "use server").
 * Aislada para poder testearla como unidad.
 *
 * Las fechas de carga se almacenan como instantes UTC; el filtrado por día/rango
 * se interpreta en UTC para evitar el corrimiento de día según la zona horaria.
 */

export interface FiltrosCombustible {
  vehiculoId?: string;
  empleadoId?: string;
  desde?: string; // yyyy-MM-dd
  hasta?: string; // yyyy-MM-dd
  dia?: string;   // yyyy-MM-dd — día puntual; tiene prioridad sobre desde/hasta
}

/** Convierte un yyyy-MM-dd válido a medianoche UTC; null si es inválido. */
export function fechaUTC(valor?: string): Date | null {
  if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const d = new Date(`${valor}T00:00:00.000Z`);
  return isNaN(d.getTime()) ? null : d;
}

/** Construye la condición sobre `fecha` (rango UTC) a partir de los filtros, o undefined si no hay. */
export function condicionFecha(filtros: FiltrosCombustible): { gte?: Date; lt?: Date } | undefined {
  const dia = fechaUTC(filtros.dia);
  if (dia) {
    const finDia = new Date(dia);
    finDia.setUTCDate(finDia.getUTCDate() + 1);
    return { gte: dia, lt: finDia };
  }
  const cond: { gte?: Date; lt?: Date } = {};
  const desde = fechaUTC(filtros.desde);
  if (desde) cond.gte = desde;
  const hasta = fechaUTC(filtros.hasta);
  if (hasta) {
    hasta.setUTCDate(hasta.getUTCDate() + 1); // incluir el día "hasta" completo
    cond.lt = hasta;
  }
  return cond.gte || cond.lt ? cond : undefined;
}

/** Construye el `where` de Prisma para registros de combustible a partir de los filtros. */
export function whereCombustible(filtros: FiltrosCombustible) {
  const fecha = condicionFecha(filtros);
  return {
    ...(filtros.vehiculoId ? { vehiculoId: filtros.vehiculoId } : {}),
    ...(filtros.empleadoId ? { empleadoId: filtros.empleadoId } : {}),
    ...(fecha ? { fecha } : {}),
  };
}
