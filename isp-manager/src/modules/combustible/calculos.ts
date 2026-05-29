/**
 * Cálculos puros de combustible (sin acceso a DB ni React), aislados para poder
 * testearlos como unidad.
 *
 * El consumo se expresa en **L/100km** (litros cada 100 km), tal como lo guarda
 * la base. Los km recorridos y el consumo se calculan SIEMPRE respecto del
 * registro anterior por odómetro, lo que permite insertar cargas viejas
 * (retroactivas) en el medio del historial sin romper el cálculo.
 */

/** Precio por litro a partir del total del ticket y los litros cargados. */
export function calcularPrecioPorLitro(costoTotal: number, litros: number): number {
  if (litros <= 0) return 0;
  return costoTotal / litros;
}

/**
 * Km recorridos desde el registro anterior (por odómetro).
 * null si no hay anterior o si el odómetro no avanzó.
 */
export function calcularKmDesdeUltimo(odometro: number, odometroAnterior: number | null): number | null {
  if (odometroAnterior == null) return null;
  const km = odometro - odometroAnterior;
  return km > 0 ? km : null;
}

/** Consumo en L/100km. null si no hay distancia válida. */
export function calcularConsumo(litros: number, kmDesdeUltimo: number | null): number | null {
  if (!kmDesdeUltimo || kmDesdeUltimo <= 0) return null;
  return litros / (kmDesdeUltimo / 100);
}
