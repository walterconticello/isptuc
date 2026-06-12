// Clasificación de la señal óptica (potencia RX) de una ONU GPON.
// Lógica PURA y sin dependencias de UI: la vista mapea el `color` semántico a
// clases Tailwind. Umbrales habituales de GPON (sensibilidad clase B+ ≈ -28 dBm).

export type NivelSenal =
  | "bien"
  | "justa"
  | "baja"
  | "sin_senal"
  | "muy_alta"
  | "sin_lectura";

export type ColorSenal = "verde" | "ambar" | "rojo" | "gris";

export interface Senal {
  nivel: NivelSenal;
  etiqueta: string;
  color: ColorSenal;
}

// Umbrales en dBm (de mejor a peor). Exportados para tests y reutilización.
export const UMBRAL = {
  muyAlta: -8, // por encima de -8 dBm: demasiada potencia (ONU muy cerca)
  bien: -25, // -8 … -25: rango normal de trabajo
  justa: -28, // -25 … -28: límite, vigilar
  sinSenal: -40, // ≤ -40 dBm: sin señal óptica (fibra cortada)
} as const;

/**
 * Convierte un valor de potencia crudo a número. Acepta coma decimal
 * (formato del panel: "-20,65"), punto, o número. Devuelve null si no es
 * un número válido (campo vacío, "n/a", "¿?", etc.).
 */
export function parseDbm(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  const limpio = raw.trim().replace(",", ".");
  if (!/^[-+]?\d+(\.\d+)?$/.test(limpio)) return null;
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}

/**
 * Clasifica la potencia de RECEPCIÓN (dBm) de una ONU GPON en un nivel de
 * señal con etiqueta y color semántico. `null`/sin lectura → "sin_lectura".
 */
export function clasificarSenal(dbm: number | null | undefined): Senal {
  if (dbm === null || dbm === undefined || !Number.isFinite(dbm)) {
    return { nivel: "sin_lectura", etiqueta: "Sin lectura", color: "gris" };
  }
  if (dbm <= UMBRAL.sinSenal) {
    return { nivel: "sin_senal", etiqueta: "Sin señal", color: "rojo" };
  }
  if (dbm < UMBRAL.justa) {
    return { nivel: "baja", etiqueta: "Baja", color: "rojo" };
  }
  if (dbm < UMBRAL.bien) {
    return { nivel: "justa", etiqueta: "Justa", color: "ambar" };
  }
  if (dbm <= UMBRAL.muyAlta) {
    return { nivel: "bien", etiqueta: "Bien", color: "verde" };
  }
  return { nivel: "muy_alta", etiqueta: "Muy alta", color: "ambar" };
}

// Orden para "peor señal primero": menor rank = peor (se muestra arriba).
// Sin lectura va al final (no es accionable como una señal baja real).
const RANK: Record<NivelSenal, number> = {
  sin_senal: 0,
  baja: 1,
  justa: 2,
  muy_alta: 3,
  bien: 4,
  sin_lectura: 5,
};

export function rankSenal(dbm: number | null | undefined): number {
  return RANK[clasificarSenal(dbm).nivel];
}
