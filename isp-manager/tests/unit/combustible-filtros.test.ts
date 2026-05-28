import { describe, it, expect } from "vitest";
import { fechaUTC, condicionFecha, whereCombustible } from "@/modules/combustible/filtros";

describe("fechaUTC", () => {
  it("convierte un yyyy-MM-dd a medianoche UTC", () => {
    expect(fechaUTC("2026-05-27")?.toISOString()).toBe("2026-05-27T00:00:00.000Z");
  });

  it("devuelve null para entradas vacías o inválidas", () => {
    expect(fechaUTC(undefined)).toBeNull();
    expect(fechaUTC("")).toBeNull();
    expect(fechaUTC("27/05/2026")).toBeNull();
    expect(fechaUTC("2026-13-99")).toBeNull();
  });
});

describe("condicionFecha", () => {
  it("sin filtros de fecha devuelve undefined", () => {
    expect(condicionFecha({})).toBeUndefined();
    expect(condicionFecha({ vehiculoId: "v1" })).toBeUndefined();
  });

  it("dia acota al día UTC completo (gte ese día, lt el siguiente)", () => {
    const cond = condicionFecha({ dia: "2026-05-27" });
    expect(cond?.gte?.toISOString()).toBe("2026-05-27T00:00:00.000Z");
    expect(cond?.lt?.toISOString()).toBe("2026-05-28T00:00:00.000Z");
  });

  it("dia tiene prioridad sobre desde/hasta", () => {
    const cond = condicionFecha({ dia: "2026-05-27", desde: "2020-01-01", hasta: "2030-12-31" });
    expect(cond?.gte?.toISOString()).toBe("2026-05-27T00:00:00.000Z");
    expect(cond?.lt?.toISOString()).toBe("2026-05-28T00:00:00.000Z");
  });

  it("el rango incluye el día 'hasta' completo (lt = hasta + 1 día)", () => {
    const cond = condicionFecha({ desde: "2026-05-01", hasta: "2026-05-31" });
    expect(cond?.gte?.toISOString()).toBe("2026-05-01T00:00:00.000Z");
    expect(cond?.lt?.toISOString()).toBe("2026-06-01T00:00:00.000Z");
  });

  it("acepta solo 'desde' o solo 'hasta'", () => {
    expect(condicionFecha({ desde: "2026-05-01" })).toEqual({ gte: new Date("2026-05-01T00:00:00.000Z") });
    expect(condicionFecha({ hasta: "2026-05-31" })).toEqual({ lt: new Date("2026-06-01T00:00:00.000Z") });
  });

  it("ignora fechas inválidas", () => {
    expect(condicionFecha({ desde: "basura" })).toBeUndefined();
  });
});

describe("whereCombustible", () => {
  it("vacío produce un where vacío", () => {
    expect(whereCombustible({})).toEqual({});
  });

  it("incluye vehiculoId y empleadoId cuando están presentes", () => {
    expect(whereCombustible({ vehiculoId: "v1", empleadoId: "e1" })).toEqual({
      vehiculoId: "v1",
      empleadoId: "e1",
    });
  });

  it("combina filtros de entidad con el rango de fecha", () => {
    const where = whereCombustible({ vehiculoId: "v1", dia: "2026-05-27" });
    expect(where.vehiculoId).toBe("v1");
    expect(where.fecha).toEqual({
      gte: new Date("2026-05-27T00:00:00.000Z"),
      lt: new Date("2026-05-28T00:00:00.000Z"),
    });
  });

  it("omite 'fecha' cuando no hay filtros de fecha", () => {
    expect(whereCombustible({ vehiculoId: "v1" })).not.toHaveProperty("fecha");
  });
});
