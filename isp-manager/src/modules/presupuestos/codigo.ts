/**
 * Código interno del presupuesto: `PRES-AAAA-NNNN`.
 *
 * Se deriva del año de emisión y del número correlativo que ya tiene cada
 * presupuesto (no se persiste un campo nuevo). El correlativo es global: no
 * reinicia al cambiar de año.
 */
export function codigoPresupuesto(numero: number, fechaEmision: Date): string {
  const anio = fechaEmision.getFullYear();
  return `PRES-${anio}-${String(numero).padStart(4, "0")}`;
}
