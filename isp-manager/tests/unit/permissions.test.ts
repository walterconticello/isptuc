import { describe, it, expect } from "vitest";

// Replica la lógica de la invariante sin tocar la DB
describe("invariante DUENO/ADMIN", () => {
  function canToggle(rol: string, modulo: string): boolean {
    if (rol === "DUENO" && modulo === "ADMIN") return false;
    return true;
  }

  it("no permite quitar ADMIN al DUENO", () => {
    expect(canToggle("DUENO", "ADMIN")).toBe(false);
  });

  it("permite quitar ADMIN al GERENTE", () => {
    expect(canToggle("GERENTE", "ADMIN")).toBe(true);
  });

  it("permite quitar cualquier otro módulo al DUENO", () => {
    expect(canToggle("DUENO", "STOCK")).toBe(true);
    expect(canToggle("DUENO", "PRESUPUESTOS")).toBe(true);
  });

  it("permite toggle en cualquier otro caso", () => {
    expect(canToggle("TECNICO", "STOCK")).toBe(true);
    expect(canToggle("ADMIN", "ADMIN")).toBe(true);
  });
});
