import { describe, it, expect } from "vitest";
import { agregarMiembroSchema, removerMiembroSchema } from "@/lib/validations";

describe("agregarMiembroSchema", () => {
  it("acepta IDs válidos y esJefe", () => {
    const r = agregarMiembroSchema.safeParse({
      cuadrillaId: "c1",
      empleadoId: "e1",
      esJefe: true,
    });
    expect(r.success).toBe(true);
  });

  it("esJefe es false por defecto si se omite", () => {
    const r = agregarMiembroSchema.safeParse({ cuadrillaId: "c1", empleadoId: "e1" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.esJefe).toBe(false);
  });

  it("rechaza cuadrillaId vacío", () => {
    const r = agregarMiembroSchema.safeParse({ cuadrillaId: "", empleadoId: "e1", esJefe: false });
    expect(r.success).toBe(false);
  });

  it("rechaza empleadoId vacío", () => {
    const r = agregarMiembroSchema.safeParse({ cuadrillaId: "c1", empleadoId: "", esJefe: false });
    expect(r.success).toBe(false);
  });

  it("rechaza esJefe no booleano", () => {
    const r = agregarMiembroSchema.safeParse({ cuadrillaId: "c1", empleadoId: "e1", esJefe: "si" });
    expect(r.success).toBe(false);
  });
});

describe("removerMiembroSchema", () => {
  it("acepta IDs válidos", () => {
    expect(removerMiembroSchema.safeParse({ cuadrillaId: "c1", empleadoId: "e1" }).success).toBe(true);
  });

  it("rechaza IDs vacíos", () => {
    expect(removerMiembroSchema.safeParse({ cuadrillaId: "", empleadoId: "e1" }).success).toBe(false);
    expect(removerMiembroSchema.safeParse({ cuadrillaId: "c1", empleadoId: "" }).success).toBe(false);
  });
});
