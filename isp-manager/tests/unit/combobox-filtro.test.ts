import { describe, it, expect } from "vitest";
import {
  normalizar,
  filtrarOpciones,
  debeMostrarCrear,
  type OpcionCombobox,
} from "@/app/(dashboard)/presupuestos/_components/combobox-filtro";

const opciones: OpcionCombobox[] = [
  { value: "1", label: "Juan Pérez", sublabel: "20-12345678-9" },
  { value: "2", label: "Juan Pereyra" },
  { value: "3", label: "Acme S.A." },
];

describe("normalizar", () => {
  it("pasa a minúsculas y recorta espacios", () => {
    expect(normalizar("  HoLa  ")).toBe("hola");
  });

  it("quita acentos para comparar", () => {
    expect(normalizar("Pérez")).toBe("perez");
    expect(normalizar("ÁÉÍÓÚ")).toBe("aeiou");
  });
});

describe("filtrarOpciones", () => {
  it("devuelve todas las opciones con query vacía o de solo espacios", () => {
    expect(filtrarOpciones(opciones, "")).toHaveLength(3);
    expect(filtrarOpciones(opciones, "   ")).toHaveLength(3);
  });

  it("filtra por substring ignorando mayúsculas", () => {
    const r = filtrarOpciones(opciones, "JUAN");
    expect(r.map((o) => o.value)).toEqual(["1", "2"]);
  });

  it("ignora los acentos al comparar (busca «perez», matchea «Pérez»)", () => {
    const r = filtrarOpciones(opciones, "perez");
    expect(r.map((o) => o.value)).toEqual(["1"]);
  });

  it("también busca en el sublabel", () => {
    const r = filtrarOpciones(opciones, "12345678");
    expect(r.map((o) => o.value)).toEqual(["1"]);
  });

  it("devuelve vacío si nada coincide", () => {
    expect(filtrarOpciones(opciones, "zzz")).toHaveLength(0);
  });
});

describe("debeMostrarCrear", () => {
  it("es false con query vacía o de solo espacios", () => {
    expect(debeMostrarCrear(opciones, "")).toBe(false);
    expect(debeMostrarCrear(opciones, "   ")).toBe(false);
  });

  it("es true cuando hay texto y ninguna opción coincide exactamente por label", () => {
    expect(debeMostrarCrear(opciones, "Juan")).toBe(true);
    expect(debeMostrarCrear(opciones, "Cliente nuevo")).toBe(true);
  });

  it("es false cuando existe una opción con label exactamente igual (ignorando caso/acentos)", () => {
    expect(debeMostrarCrear(opciones, "juan perez")).toBe(false);
    expect(debeMostrarCrear(opciones, "  Acme S.A.  ")).toBe(false);
  });
});
