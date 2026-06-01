import { describe, it, expect } from "vitest";
import { assertSecretValido } from "@/lib/auth-secret";

// Un secreto fuerte de ejemplo (44 chars, estilo `openssl rand -base64 32`).
const SECRETO_FUERTE = "Hj8s+Qd2K9vF1pLzR7mNxYcW0aE5tBnU4gI6oP3uS8w=";

describe("assertSecretValido", () => {
  describe("en producción", () => {
    it("lanza si el secreto es undefined", () => {
      expect(() => assertSecretValido(undefined, "production")).toThrow();
    });

    it("lanza si el secreto está vacío o es solo espacios", () => {
      expect(() => assertSecretValido("", "production")).toThrow();
      expect(() => assertSecretValido("   ", "production")).toThrow();
    });

    it("lanza si el secreto es el placeholder inseguro del .env de dev", () => {
      expect(() => assertSecretValido("isp-manager-dev-secret-2026", "production")).toThrow();
    });

    it("lanza si el secreto es el placeholder del .env.example", () => {
      expect(() => assertSecretValido("cambia-esto-por-un-secreto-seguro", "production")).toThrow();
    });

    it("lanza si el secreto es demasiado corto", () => {
      expect(() => assertSecretValido("corto123", "production")).toThrow();
    });

    it("no lanza con un secreto fuerte", () => {
      expect(() => assertSecretValido(SECRETO_FUERTE, "production")).not.toThrow();
    });
  });

  describe("fuera de producción", () => {
    it("no lanza aunque el secreto sea inseguro o falte", () => {
      expect(() => assertSecretValido(undefined, "development")).not.toThrow();
      expect(() => assertSecretValido("isp-manager-dev-secret-2026", "development")).not.toThrow();
      expect(() => assertSecretValido("", "test")).not.toThrow();
    });
  });
});
