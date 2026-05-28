import { describe, it, expect } from "vitest";
import { fechaISOUTC, fechaCortaUTC } from "@/lib/utils";

describe("fechaISOUTC", () => {
  it("devuelve la porción de fecha en UTC", () => {
    expect(fechaISOUTC(new Date("2026-05-27T18:00:00.000Z"))).toBe("2026-05-27");
  });
});

describe("fechaCortaUTC", () => {
  it("formatea como dd/MM/yyyy usando la fecha UTC", () => {
    expect(fechaCortaUTC(new Date("2026-05-27T18:00:00.000Z"))).toBe("27/05/2026");
  });

  // Regresión: el formateo en hora local (UTC-3) mostraba el día anterior para
  // cargas guardadas a medianoche UTC. Debe respetarse la fecha UTC del instante.
  it("no corre el día por zona horaria (instante de madrugada UTC)", () => {
    // 02:00 UTC del 28 = 23:00 del 27 en Argentina (UTC-3): debe seguir siendo el 28.
    expect(fechaCortaUTC(new Date("2026-05-28T02:00:00.000Z"))).toBe("28/05/2026");
  });

  it("formatea medianoche UTC (cargas creadas desde el formulario)", () => {
    expect(fechaCortaUTC(new Date("2026-05-28T00:00:00.000Z"))).toBe("28/05/2026");
  });
});
