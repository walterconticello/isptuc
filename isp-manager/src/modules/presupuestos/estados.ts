import { EstadoPresupuesto } from "@/generated/prisma/enums";

// Máquina de estados de un presupuesto. Define qué transiciones son válidas y
// evita saltos arbitrarios (p. ej. de ACEPTADO a BORRADOR). Cierra el hallazgo V1.
const TRANSICIONES: Record<EstadoPresupuesto, EstadoPresupuesto[]> = {
  BORRADOR: ["ENVIADO"],
  ENVIADO: ["ACEPTADO", "RECHAZADO", "BORRADOR"],
  ACEPTADO: [],
  RECHAZADO: ["BORRADOR"],
};

/** ¿Es válido pasar del estado actual al nuevo? Quedarse igual no es transición. */
export function transicionValida(
  actual: EstadoPresupuesto,
  nuevo: EstadoPresupuesto
): boolean {
  if (actual === nuevo) return false;
  return TRANSICIONES[actual].includes(nuevo);
}
