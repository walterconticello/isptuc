import { describe, it, expect } from "vitest";
import { getCredencialesAdminSeed } from "../../prisma/seed-helpers";

describe("getCredencialesAdminSeed", () => {
  it("devuelve email y password cuando ambos son válidos", () => {
    const cred = getCredencialesAdminSeed({
      SEED_ADMIN_EMAIL: "admin@empresa.com",
      SEED_ADMIN_PASSWORD: "unaClaveFuerte123",
    });
    expect(cred).toEqual({
      email: "admin@empresa.com",
      password: "unaClaveFuerte123",
    });
  });

  it("lanza si falta SEED_ADMIN_PASSWORD", () => {
    expect(() =>
      getCredencialesAdminSeed({ SEED_ADMIN_EMAIL: "admin@empresa.com" })
    ).toThrow();
  });

  it("lanza si falta SEED_ADMIN_EMAIL", () => {
    expect(() =>
      getCredencialesAdminSeed({ SEED_ADMIN_PASSWORD: "unaClaveFuerte123" })
    ).toThrow();
  });

  it("lanza si el email es inválido", () => {
    expect(() =>
      getCredencialesAdminSeed({
        SEED_ADMIN_EMAIL: "no-es-email",
        SEED_ADMIN_PASSWORD: "unaClaveFuerte123",
      })
    ).toThrow();
  });

  it("lanza si la contraseña es demasiado corta", () => {
    expect(() =>
      getCredencialesAdminSeed({
        SEED_ADMIN_EMAIL: "admin@empresa.com",
        SEED_ADMIN_PASSWORD: "corta",
      })
    ).toThrow();
  });

  it("no acepta el placeholder inseguro admin123", () => {
    expect(() =>
      getCredencialesAdminSeed({
        SEED_ADMIN_EMAIL: "admin@empresa.com",
        SEED_ADMIN_PASSWORD: "admin123",
      })
    ).toThrow();
  });
});
