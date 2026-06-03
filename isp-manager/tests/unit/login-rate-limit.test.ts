import { describe, it, expect } from "vitest";
import { superaLimiteIntentos, MAX_INTENTOS_LOGIN } from "@/lib/rate-limit";

describe("superaLimiteIntentos", () => {
  it("no bloquea sin intentos", () => {
    expect(superaLimiteIntentos(0)).toBe(false);
  });

  it("no bloquea por debajo del límite", () => {
    expect(superaLimiteIntentos(MAX_INTENTOS_LOGIN - 1)).toBe(false);
  });

  it("bloquea al alcanzar el límite", () => {
    expect(superaLimiteIntentos(MAX_INTENTOS_LOGIN)).toBe(true);
  });

  it("bloquea por encima del límite", () => {
    expect(superaLimiteIntentos(MAX_INTENTOS_LOGIN + 5)).toBe(true);
  });

  it("respeta un límite custom", () => {
    expect(superaLimiteIntentos(3, 5)).toBe(false);
    expect(superaLimiteIntentos(5, 5)).toBe(true);
  });
});
