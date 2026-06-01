import { describe, it, expect } from "vitest";
import {
  kmPorLitro,
  nivelRendimiento,
  textoRendimiento,
} from "@/modules/combustible/rendimiento";

describe("kmPorLitro", () => {
  it("convierte L/100km a Km/L (inversa por 100)", () => {
    expect(kmPorLitro(10)).toBeCloseTo(10, 5); // 100/10
    expect(kmPorLitro(8)).toBeCloseTo(12.5, 5); // 100/8
    expect(kmPorLitro(20)).toBeCloseTo(5, 5); // 100/20
  });

  it("devuelve null para valores inválidos", () => {
    expect(kmPorLitro(null)).toBeNull();
    expect(kmPorLitro(undefined)).toBeNull();
    expect(kmPorLitro(0)).toBeNull();
    expect(kmPorLitro(-5)).toBeNull();
  });
});

describe("nivelRendimiento", () => {
  it("clasifica como alto cuando Km/L ≥ 10 (consumo ≤ 10 L/100km)", () => {
    expect(nivelRendimiento(10)).toBe("alto"); // 10 Km/L
    expect(nivelRendimiento(8)).toBe("alto"); // 12.5 Km/L
  });

  it("clasifica como medio cuando 7 ≤ Km/L < 10", () => {
    expect(nivelRendimiento(12)).toBe("medio"); // ~8.3 Km/L
    expect(nivelRendimiento(100 / 7)).toBe("medio"); // exactamente 7 Km/L
  });

  it("clasifica como bajo cuando Km/L < 7", () => {
    expect(nivelRendimiento(20)).toBe("bajo"); // 5 Km/L
    expect(nivelRendimiento(15)).toBe("bajo"); // ~6.7 Km/L
  });

  it("devuelve indefinido sin dato válido", () => {
    expect(nivelRendimiento(null)).toBe("indefinido");
    expect(nivelRendimiento(0)).toBe("indefinido");
  });
});

describe("textoRendimiento", () => {
  it("muestra Km/L con una decimal", () => {
    expect(textoRendimiento(8, "kmL")).toBe("12,5"); // es-AR usa coma decimal
  });

  it("muestra L/100km tal cual con una decimal", () => {
    expect(textoRendimiento(8.34, "l100")).toBe("8,3");
  });

  it("muestra — sin dato", () => {
    expect(textoRendimiento(null, "kmL")).toBe("—");
    expect(textoRendimiento(0, "l100")).toBe("—");
  });
});
