export function calcularSubtotalLinea(cantidad: number, precioUnitario: number): number {
  return Math.round(cantidad * precioUnitario * 100) / 100;
}

export function calcularTotales(
  items: { cantidad: number; precioUnitario: number }[],
  ivaPorcentaje: number
): { subtotal: number; ivaImporte: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + calcularSubtotalLinea(item.cantidad, item.precioUnitario), 0);
  const ivaImporte = Math.round(subtotal * (ivaPorcentaje / 100) * 100) / 100;
  const total = Math.round((subtotal + ivaImporte) * 100) / 100;
  return { subtotal, ivaImporte, total };
}

export function calcularFechaVencimiento(fechaEmision: Date, validezDias: number): Date {
  const result = new Date(fechaEmision);
  result.setUTCDate(result.getUTCDate() + validezDias);
  return result;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount);
}

export function formatDate(date: Date): string {
  const d = date.getUTCDate().toString().padStart(2, "0");
  const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const y = date.getUTCFullYear();
  return `${d}/${m}/${y}`;
}
