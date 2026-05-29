/**
 * Lógica pura de presentación del rendimiento de combustible (sin React ni DB).
 *
 * La base de datos guarda el consumo como **L/100km** (litros cada 100 km).
 * La UI permite verlo como **Km/L** (kilómetros por litro) o como **L/100km**.
 * Ambas son inversas: Km/L = 100 / (L/100km).
 *
 * Los umbrales de color se evalúan siempre sobre el equivalente Km/L para que el
 * semáforo sea coherente en las dos unidades: verde rinde más, rojo rinde menos.
 */

export type UnidadRendimiento = "kmL" | "l100";
export type NivelRendimiento = "alto" | "medio" | "bajo" | "indefinido";

/** Convierte L/100km a Km/L. Devuelve null si el consumo no es válido. */
export function kmPorLitro(consumoL100: number | null | undefined): number | null {
  if (consumoL100 == null || consumoL100 <= 0) return null;
  return 100 / consumoL100;
}

/**
 * Clasifica el rendimiento según los mismos umbrales que fleet-manager (en Km/L):
 * alto ≥ 10, medio ≥ 7, bajo el resto.
 */
export function nivelRendimiento(consumoL100: number | null | undefined): NivelRendimiento {
  const kmL = kmPorLitro(consumoL100);
  if (kmL == null) return "indefinido";
  if (kmL >= 10) return "alto";
  if (kmL >= 7) return "medio";
  return "bajo";
}

/** Texto a mostrar según la unidad elegida; "—" si no hay dato. */
export function textoRendimiento(
  consumoL100: number | null | undefined,
  unidad: UnidadRendimiento,
): string {
  if (consumoL100 == null || consumoL100 <= 0) return "—";
  const valor = unidad === "kmL" ? 100 / consumoL100 : consumoL100;
  return valor.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
