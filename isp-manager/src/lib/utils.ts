import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Devuelve la porción de fecha (yyyy-MM-dd) en UTC.
 * Las fechas de carga se almacenan como medianoche UTC del día elegido,
 * así que se interpretan en UTC para evitar el corrimiento de día por zona horaria.
 */
export function fechaISOUTC(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Formatea una fecha como dd/MM/yyyy usando su porción UTC (sin corrimiento por zona horaria). */
export function fechaCortaUTC(date: Date): string {
  const [y, m, d] = fechaISOUTC(date).split("-");
  return `${d}/${m}/${y}`;
}
