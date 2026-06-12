import { parseDbm } from "@/modules/red/potencia";

// Parser PURO del JSON que publica el panel de ONUs (fuente PANEL), ej. El Mollar
// en `/ajax/data/arrays.txt`. Formato: { data: [ [c0..c9], ... ] } donde cada
// fila es: [PON, ID, ESTADO, N-SERIE, CLIENTE, USUARIO, PASSWORD, IP, POTENCIA, VLAN].
// La columna CLIENTE es el public_id del contrato en WisPro (clave de cruce).

export interface OnuCruda {
  pon: string;
  idOnu: string;
  estado: string | null;
  serial: string | null;
  publicIdWispro: number | null; // col CLIENTE
  pppoeUser: string | null; // col USUARIO
  ip: string | null;
  potenciaDbm: number | null; // col POTENCIA (coma decimal)
  vlan: string | null;
}

// Índices de columna en cada fila del array.
const COL = {
  pon: 0,
  idOnu: 1,
  estado: 2,
  serial: 3,
  cliente: 4,
  usuario: 5,
  // password: 6 (no se importa; dato sensible que ya vive en WisPro)
  ip: 7,
  potencia: 8,
  vlan: 9,
} as const;

/** Normaliza una celda de texto: trim y "" / placeholder → null. */
function txt(v: unknown): string | null {
  if (typeof v !== "string") return v == null ? null : String(v);
  const s = v.trim();
  if (s === "" || s === "¿?" || s === "?" || s === "-" || s === "N/A") return null;
  return s;
}

/** Entero del public_id de WisPro, o null si la celda no es numérica. */
function entero(v: unknown): number | null {
  const s = txt(v);
  if (s === null) return null;
  return /^\d+$/.test(s) ? Number(s) : null;
}

/**
 * Parsea el contenido del endpoint (string JSON o ya parseado) y devuelve las
 * ONUs normalizadas. Tolerante: ignora filas que no sean arrays con datos.
 */
export function parseArrays(entrada: string | { data?: unknown[] } | unknown[]): OnuCruda[] {
  let data: unknown[] = [];
  try {
    const obj = typeof entrada === "string" ? JSON.parse(entrada) : entrada;
    if (Array.isArray(obj)) data = obj;
    else if (obj && Array.isArray((obj as { data?: unknown[] }).data)) {
      data = (obj as { data: unknown[] }).data;
    }
  } catch {
    return [];
  }

  const onus: OnuCruda[] = [];
  for (const fila of data) {
    if (!Array.isArray(fila) || fila.length < 2) continue;
    const pon = txt(fila[COL.pon]);
    const idOnu = txt(fila[COL.idOnu]);
    if (pon === null && idOnu === null) continue; // fila vacía/no útil
    onus.push({
      pon: pon ?? "",
      idOnu: idOnu ?? "",
      estado: txt(fila[COL.estado]),
      serial: txt(fila[COL.serial]),
      publicIdWispro: entero(fila[COL.cliente]),
      pppoeUser: txt(fila[COL.usuario]),
      ip: txt(fila[COL.ip]),
      potenciaDbm: parseDbm(typeof fila[COL.potencia] === "string" ? (fila[COL.potencia] as string) : null),
      vlan: txt(fila[COL.vlan]),
    });
  }
  return onus;
}
