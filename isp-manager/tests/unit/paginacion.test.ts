import { describe, it, expect } from "vitest";
import { normalizarPaginacion } from "@/lib/validations";

describe("normalizarPaginacion", () => {
  it("deja pasar valores válidos", () => {
    expect(normalizarPaginacion(2, 30)).toEqual({ page: 2, pageSize: 30 });
  });

  it("acota page mínimo a 1", () => {
    expect(normalizarPaginacion(0, 20).page).toBe(1);
    expect(normalizarPaginacion(-5, 20).page).toBe(1);
  });

  it("acota pageSize al máximo de 100", () => {
    expect(normalizarPaginacion(1, 1_000_000_000).pageSize).toBe(100);
    expect(normalizarPaginacion(1, 101).pageSize).toBe(100);
  });

  it("usa el default cuando pageSize es inválido o falta", () => {
    expect(normalizarPaginacion(1, undefined, 50).pageSize).toBe(50);
    expect(normalizarPaginacion(1, 0, 50).pageSize).toBe(50);
    expect(normalizarPaginacion(1, NaN, 20).pageSize).toBe(20);
  });

  it("respeta el default por endpoint", () => {
    expect(normalizarPaginacion(3, undefined, 50)).toEqual({ page: 3, pageSize: 50 });
  });

  it("cae a page 1 si page no es entero válido", () => {
    expect(normalizarPaginacion(1.5, 20).page).toBe(1);
  });
});
