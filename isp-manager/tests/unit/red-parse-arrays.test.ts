import { describe, it, expect } from "vitest";
import { parseArrays } from "@/modules/red/fuentes/parse-arrays";

// Muestra con el formato real del panel (incluye mojibake "Â¿?" en ESTADO y
// potencia con coma). Cols: PON,ID,ESTADO,SERIE,CLIENTE,USUARIO,PASS,IP,POT,VLAN
const MUESTRA = JSON.stringify({
  data: [
    ["1", "1", "¿?", "485754432ACAB59D", "2811", "Gevelardi@Eduardo", "14076649", "172.28.2.7", "-20,65", "22"],
    ["1", "2", "¿?", "485754432A881D9D", "2974", "Ferroni@FrancoGabriel", "24503389", "172.28.2.140", "-30,45", "22"],
  ],
});

describe("parseArrays", () => {
  it("mapea las columnas a OnuCruda normalizada", () => {
    const onus = parseArrays(MUESTRA);
    expect(onus).toHaveLength(2);
    expect(onus[0]).toEqual({
      pon: "1",
      idOnu: "1",
      estado: null, // "¿?" se normaliza a null
      serial: "485754432ACAB59D",
      publicIdWispro: 2811, // col CLIENTE = public_id de WisPro (entero)
      pppoeUser: "Gevelardi@Eduardo",
      ip: "172.28.2.7",
      potenciaDbm: -20.65, // coma decimal -> número
      vlan: "22",
    });
    expect(onus[1].potenciaDbm).toBe(-30.45);
  });

  it("acepta tanto string JSON como objeto ya parseado", () => {
    const obj = JSON.parse(MUESTRA);
    expect(parseArrays(obj)).toHaveLength(2);
  });

  it("public_id no numérico -> null; potencia inválida -> null", () => {
    const onus = parseArrays({
      data: [["3", "0", "", "SER123", "SIN-ID", "user@x", "1", "10.0.0.1", "s/d", "500"]],
    });
    expect(onus[0].publicIdWispro).toBeNull();
    expect(onus[0].potenciaDbm).toBeNull();
    expect(onus[0].estado).toBeNull();
  });

  it("es tolerante: ignora filas inválidas y entradas corruptas", () => {
    expect(parseArrays("no-es-json")).toEqual([]);
    expect(parseArrays({ data: [42, null, [], ["", ""]] })).toEqual([]);
    expect(parseArrays({})).toEqual([]);
  });
});
