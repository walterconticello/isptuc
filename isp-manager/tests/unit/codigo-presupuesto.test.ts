import { describe, it, expect } from "vitest";
import { codigoPresupuesto } from "@/modules/presupuestos/codigo";

describe("codigoPresupuesto", () => {
  it("arma PRES-AAAA-NNNN con el año de emisión y el número en 4 dígitos", () => {
    expect(codigoPresupuesto(42, new Date("2026-05-30T12:00:00"))).toBe("PRES-2026-0042");
  });

  it("padea números chicos a 4 dígitos", () => {
    expect(codigoPresupuesto(1, new Date("2026-01-15T00:00:00"))).toBe("PRES-2026-0001");
  });

  it("no recorta números de más de 4 dígitos", () => {
    expect(codigoPresupuesto(12345, new Date("2027-12-31T00:00:00"))).toBe("PRES-2027-12345");
  });

  it("usa el año de la fecha de emisión", () => {
    expect(codigoPresupuesto(7, new Date("2030-03-15T00:00:00"))).toBe("PRES-2030-0007");
  });
});
