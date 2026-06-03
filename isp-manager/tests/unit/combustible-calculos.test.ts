import { describe, it, expect } from "vitest";
import {
  calcularPrecioPorLitro,
  calcularKmDesdeUltimo,
  calcularConsumo,
} from "@/modules/combustible/calculos";

describe("calcularPrecioPorLitro", () => {
  it("divide el total por los litros", () => {
    expect(calcularPrecioPorLitro(30000, 20)).toBe(1500);
    expect(calcularPrecioPorLitro(13500, 10)).toBe(1350);
  });

  it("devuelve 0 si los litros no son positivos (evita división por cero)", () => {
    expect(calcularPrecioPorLitro(30000, 0)).toBe(0);
    expect(calcularPrecioPorLitro(30000, -5)).toBe(0);
  });
});

describe("calcularKmDesdeUltimo", () => {
  it("resta el odómetro anterior", () => {
    expect(calcularKmDesdeUltimo(85000, 84500)).toBe(500);
  });

  it("null si no hay registro anterior (primera carga)", () => {
    expect(calcularKmDesdeUltimo(85000, null)).toBeNull();
  });

  it("null si el odómetro no avanzó (igual o menor)", () => {
    expect(calcularKmDesdeUltimo(85000, 85000)).toBeNull();
    expect(calcularKmDesdeUltimo(84000, 85000)).toBeNull();
  });
});

describe("calcularConsumo", () => {
  it("calcula L/100km a partir de litros y km recorridos", () => {
    // 40 L en 500 km → 8 L/100km
    expect(calcularConsumo(40, 500)).toBeCloseTo(8, 5);
    // 10 L en 100 km → 10 L/100km
    expect(calcularConsumo(10, 100)).toBeCloseTo(10, 5);
  });

  it("null si no hay km válidos", () => {
    expect(calcularConsumo(40, null)).toBeNull();
    expect(calcularConsumo(40, 0)).toBeNull();
  });
});
