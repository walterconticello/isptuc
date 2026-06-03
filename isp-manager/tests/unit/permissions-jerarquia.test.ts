import { describe, it, expect } from "vitest";
import { puedeGestionarRol } from "@/lib/permissions";

describe("puedeGestionarRol", () => {
  describe("DUENO", () => {
    it("puede gestionar cualquier rol, incluido otro DUENO", () => {
      expect(puedeGestionarRol("DUENO", "DUENO")).toBe(true);
      expect(puedeGestionarRol("DUENO", "GERENTE")).toBe(true);
      expect(puedeGestionarRol("DUENO", "TECNICO")).toBe(true);
    });
  });

  describe("roles no-DUENO: solo roles estrictamente inferiores", () => {
    it("GERENTE no puede gestionar DUENO ni otro GERENTE", () => {
      expect(puedeGestionarRol("GERENTE", "DUENO")).toBe(false);
      expect(puedeGestionarRol("GERENTE", "GERENTE")).toBe(false);
    });

    it("GERENTE puede gestionar ADMIN, ADMINISTRATIVO y TECNICO", () => {
      expect(puedeGestionarRol("GERENTE", "ADMIN")).toBe(true);
      expect(puedeGestionarRol("GERENTE", "ADMINISTRATIVO")).toBe(true);
      expect(puedeGestionarRol("GERENTE", "TECNICO")).toBe(true);
    });

    it("ADMIN no puede gestionar GERENTE ni otro ADMIN (cierra la escalada A1)", () => {
      expect(puedeGestionarRol("ADMIN", "DUENO")).toBe(false);
      expect(puedeGestionarRol("ADMIN", "GERENTE")).toBe(false);
      expect(puedeGestionarRol("ADMIN", "ADMIN")).toBe(false);
    });

    it("ADMIN puede gestionar ADMINISTRATIVO y TECNICO", () => {
      expect(puedeGestionarRol("ADMIN", "ADMINISTRATIVO")).toBe(true);
      expect(puedeGestionarRol("ADMIN", "TECNICO")).toBe(true);
    });

    it("TECNICO no puede gestionar a nadie", () => {
      expect(puedeGestionarRol("TECNICO", "TECNICO")).toBe(false);
      expect(puedeGestionarRol("TECNICO", "ADMINISTRATIVO")).toBe(false);
      expect(puedeGestionarRol("TECNICO", "DUENO")).toBe(false);
    });
  });
});
