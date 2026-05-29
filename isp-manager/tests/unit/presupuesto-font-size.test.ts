import { describe, it, expect } from "vitest";
import {
  calcularFontSizeItems,
  FONT_SIZE_ITEMS_MAX_PX,
  FONT_SIZE_ITEMS_MIN_PX,
} from "@/modules/presupuestos/font-size";

describe("calcularFontSizeItems", () => {
  it("usa el tamaño máximo (15px) hasta 8 ítems", () => {
    expect(calcularFontSizeItems(0)).toBe(15);
    expect(calcularFontSizeItems(1)).toBe(15);
    expect(calcularFontSizeItems(8)).toBe(15);
  });

  it("baja 0.45px por cada ítem por encima de 8", () => {
    expect(calcularFontSizeItems(9)).toBe(14.55);
    expect(calcularFontSizeItems(10)).toBe(14.1);
    expect(calcularFontSizeItems(16)).toBe(11.4);
  });

  it("nunca baja del piso de 11px", () => {
    // En el ítem ~17 toca el piso y ya no baja más.
    expect(calcularFontSizeItems(17)).toBe(11);
    expect(calcularFontSizeItems(30)).toBe(11);
    expect(calcularFontSizeItems(100)).toBe(11);
  });

  it("trata cantidades negativas como cero (tamaño máximo)", () => {
    expect(calcularFontSizeItems(-5)).toBe(15);
  });

  it("expone los límites como constantes", () => {
    expect(FONT_SIZE_ITEMS_MAX_PX).toBe(15);
    expect(FONT_SIZE_ITEMS_MIN_PX).toBe(11);
  });
});
