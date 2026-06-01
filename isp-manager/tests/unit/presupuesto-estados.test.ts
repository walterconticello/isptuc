import { describe, it, expect } from "vitest";
import { transicionValida } from "@/modules/presupuestos/estados";

describe("transicionValida (presupuestos)", () => {
  it("permite BORRADOR → ENVIADO", () => {
    expect(transicionValida("BORRADOR", "ENVIADO")).toBe(true);
  });

  it("permite ENVIADO → ACEPTADO y ENVIADO → RECHAZADO", () => {
    expect(transicionValida("ENVIADO", "ACEPTADO")).toBe(true);
    expect(transicionValida("ENVIADO", "RECHAZADO")).toBe(true);
  });

  it("permite volver a BORRADOR desde ENVIADO o RECHAZADO para reeditar", () => {
    expect(transicionValida("ENVIADO", "BORRADOR")).toBe(true);
    expect(transicionValida("RECHAZADO", "BORRADOR")).toBe(true);
  });

  it("rechaza saltos inválidos", () => {
    expect(transicionValida("BORRADOR", "ACEPTADO")).toBe(false);
    expect(transicionValida("BORRADOR", "RECHAZADO")).toBe(false);
    expect(transicionValida("ACEPTADO", "BORRADOR")).toBe(false);
    expect(transicionValida("RECHAZADO", "ACEPTADO")).toBe(false);
  });

  it("trata ACEPTADO como estado final", () => {
    expect(transicionValida("ACEPTADO", "ENVIADO")).toBe(false);
    expect(transicionValida("ACEPTADO", "RECHAZADO")).toBe(false);
  });

  it("no considera válido quedarse en el mismo estado", () => {
    expect(transicionValida("BORRADOR", "BORRADOR")).toBe(false);
    expect(transicionValida("ENVIADO", "ENVIADO")).toBe(false);
  });
});
