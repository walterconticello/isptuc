/** Tamaño de letra inicial (px) del bloque de ítems del presupuesto. */
export const FONT_SIZE_ITEMS_MAX_PX = 15;
/** Piso de tamaño de letra (px): nunca se baja de acá por más ítems que haya. */
export const FONT_SIZE_ITEMS_MIN_PX = 11;

/** Cantidad de ítems a partir de la cual se empieza a achicar la letra. */
const UMBRAL_ITEMS = 8;
/** Px que se descuentan por cada ítem por encima del umbral. */
const PASO_PX_POR_ITEM = 0.45;

/**
 * Calcula el tamaño de letra (px) del bloque de ítems para que el documento
 * siga entrando en la hoja a medida que se agregan filas.
 *
 * Empieza en {@link FONT_SIZE_ITEMS_MAX_PX} (hasta {@link UMBRAL_ITEMS} ítems) y
 * baja {@link PASO_PX_POR_ITEM}px por cada ítem extra, con piso en
 * {@link FONT_SIZE_ITEMS_MIN_PX} (toca el piso alrededor del ítem 17).
 */
export function calcularFontSizeItems(cantidadLineas: number): number {
  const itemsExtra = Math.max(0, cantidadLineas - UMBRAL_ITEMS);
  const px = FONT_SIZE_ITEMS_MAX_PX - itemsExtra * PASO_PX_POR_ITEM;
  // Redondeo a 2 decimales para evitar ruido de punto flotante (p. ej. 14.549999).
  return Math.max(FONT_SIZE_ITEMS_MIN_PX, Math.round(px * 100) / 100);
}
