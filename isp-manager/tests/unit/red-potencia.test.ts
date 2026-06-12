import { describe, it, expect } from "vitest";
import { clasificarSenal, parseDbm, rankSenal } from "@/modules/red/potencia";

describe("parseDbm", () => {
  it("acepta coma decimal del panel", () => {
    expect(parseDbm("-20,65")).toBe(-20.65);
  });
  it("acepta punto y enteros y números", () => {
    expect(parseDbm("-19.95")).toBe(-19.95);
    expect(parseDbm("33")).toBe(33);
    expect(parseDbm(-27.5)).toBe(-27.5);
  });
  it("devuelve null para vacío / no numérico / nulos", () => {
    expect(parseDbm("")).toBeNull();
    expect(parseDbm("¿?")).toBeNull();
    expect(parseDbm("N/A")).toBeNull();
    expect(parseDbm(null)).toBeNull();
    expect(parseDbm(undefined)).toBeNull();
    expect(parseDbm(Number.NaN)).toBeNull();
  });
});

describe("clasificarSenal", () => {
  it("clasifica cada rango de GPON", () => {
    expect(clasificarSenal(-15).nivel).toBe("bien");
    expect(clasificarSenal(-26).nivel).toBe("justa");
    expect(clasificarSenal(-29).nivel).toBe("baja");
    expect(clasificarSenal(-45).nivel).toBe("sin_senal");
    expect(clasificarSenal(-5).nivel).toBe("muy_alta");
    expect(clasificarSenal(null).nivel).toBe("sin_lectura");
  });

  it("respeta los bordes exactos de los umbrales", () => {
    expect(clasificarSenal(-8).nivel).toBe("bien"); // -8 incluido en "bien"
    expect(clasificarSenal(-25).nivel).toBe("bien"); // -25 es el borde bueno del rango normal
    expect(clasificarSenal(-28).nivel).toBe("justa"); // -28 es el borde peor de "justa"; baja es < -28
    expect(clasificarSenal(-40).nivel).toBe("sin_senal"); // -40 ya es "sin señal"
  });

  it("asigna color semántico coherente", () => {
    expect(clasificarSenal(-15).color).toBe("verde");
    expect(clasificarSenal(-26).color).toBe("ambar");
    expect(clasificarSenal(-29).color).toBe("rojo");
    expect(clasificarSenal(undefined).color).toBe("gris");
  });
});

describe("rankSenal (orden peor-señal-primero)", () => {
  it("ordena de peor a mejor, con sin-lectura al final", () => {
    const valores = [-15, -45, -26, null, -29, -5];
    const ordenado = [...valores].sort((a, b) => rankSenal(a) - rankSenal(b));
    expect(ordenado).toEqual([-45, -29, -26, -5, -15, null]);
  });
});
