import { describe, it, expect } from "vitest";
import {
  calcularSubtotalLinea,
  calcularTotales,
  calcularFechaVencimiento,
  formatCurrency,
  formatDate,
} from "@/lib/calculations";

describe("calcularSubtotalLinea", () => {
  it("multiplica cantidad por precio unitario", () => {
    expect(calcularSubtotalLinea(3, 100)).toBe(300);
  });

  it("redondea a 2 decimales", () => {
    expect(calcularSubtotalLinea(1, 33.333)).toBe(33.33);
  });

  it("retorna 0 si cantidad es 0", () => {
    expect(calcularSubtotalLinea(0, 500)).toBe(0);
  });
});

describe("calcularTotales", () => {
  it("calcula subtotal, IVA y total correctamente", () => {
    const items = [
      { cantidad: 2, precioUnitario: 100 },
      { cantidad: 1, precioUnitario: 50 },
    ];
    const result = calcularTotales(items, 21);
    expect(result.subtotal).toBe(250);
    expect(result.ivaImporte).toBe(52.5);
    expect(result.total).toBe(302.5);
  });

  it("retorna 0 para lista vacía", () => {
    const result = calcularTotales([], 21);
    expect(result.subtotal).toBe(0);
    expect(result.ivaImporte).toBe(0);
    expect(result.total).toBe(0);
  });

  it("calcula sin IVA cuando ivaPorcentaje es 0", () => {
    const items = [{ cantidad: 1, precioUnitario: 100 }];
    const result = calcularTotales(items, 0);
    expect(result.subtotal).toBe(100);
    expect(result.ivaImporte).toBe(0);
    expect(result.total).toBe(100);
  });
});

describe("calcularFechaVencimiento", () => {
  it("agrega los días correctamente", () => {
    const base = new Date("2026-01-01");
    const result = calcularFechaVencimiento(base, 30);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(31);
  });

  it("cruza mes correctamente", () => {
    const base = new Date("2026-01-20");
    const result = calcularFechaVencimiento(base, 15);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(4);
  });
});

describe("formatCurrency", () => {
  it("formatea en ARS", () => {
    const result = formatCurrency(1000);
    expect(result).toContain("1.000");
  });
});

describe("formatDate", () => {
  it("retorna formato dd/mm/yyyy", () => {
    const result = formatDate(new Date("2026-01-15"));
    expect(result).toBe("15/01/2026");
  });
});
