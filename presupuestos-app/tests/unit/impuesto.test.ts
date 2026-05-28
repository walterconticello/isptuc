import { describe, it, expect } from "vitest";
import { ImpuestoSchema } from "@/lib/validations";

describe("ImpuestoSchema", () => {
  it("acepta un impuesto válido", () => {
    const result = ImpuestoSchema.safeParse({ nombre: "IVA 21%", porcentaje: 21 });
    expect(result.success).toBe(true);
  });

  it("acepta porcentaje 0 (exento)", () => {
    const result = ImpuestoSchema.safeParse({ nombre: "Exento", porcentaje: 0 });
    expect(result.success).toBe(true);
  });

  it("rechaza nombre vacío", () => {
    const result = ImpuestoSchema.safeParse({ nombre: "", porcentaje: 21 });
    expect(result.success).toBe(false);
  });

  it("rechaza porcentaje negativo", () => {
    const result = ImpuestoSchema.safeParse({ nombre: "IVA", porcentaje: -1 });
    expect(result.success).toBe(false);
  });

  it("rechaza porcentaje mayor a 100", () => {
    const result = ImpuestoSchema.safeParse({ nombre: "IVA", porcentaje: 101 });
    expect(result.success).toBe(false);
  });

  it("esDefault es false por defecto", () => {
    const result = ImpuestoSchema.safeParse({ nombre: "IVA 21%", porcentaje: 21 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.esDefault).toBe(false);
  });

  it("acepta porcentaje decimal (10.5)", () => {
    const result = ImpuestoSchema.safeParse({ nombre: "IVA 10,5%", porcentaje: 10.5 });
    expect(result.success).toBe(true);
  });
});
