import "server-only";
import { db } from "@/lib/db";
import { getContratos, getClientesWispro, nombreCliente } from "./cliente";

// Refresca la cache local `ContratoWispro` desde la API de WisPro. Cruza los
// contratos con los clientes (por client_id) para resolver el nombre. Esto evita
// pegarle a la API en cada carga de la página de RED.
export async function sincronizarContratos(): Promise<{ total: number }> {
  const [contratos, clientes] = await Promise.all([getContratos(), getClientesWispro()]);

  const nombrePorId = new Map<string, string | null>();
  for (const c of clientes) nombrePorId.set(c.id, nombreCliente(c));

  let total = 0;
  for (const c of contratos) {
    if (typeof c.public_id !== "number") continue;
    const direccion =
      [c.address_street, c.address_number, c.address_city].filter(Boolean).join(" ").trim() ||
      null;
    const nombre = c.client_id ? nombrePorId.get(c.client_id) ?? null : null;
    const datos = {
      nombreCliente: nombre,
      direccion,
      estado: c.state ?? null,
      ip: c.ip ?? null,
      pppoeUsername: c.pppoe_username ?? null,
      sincronizadoEn: new Date(),
    };
    await db.contratoWispro.upsert({
      where: { publicId: c.public_id },
      update: datos,
      create: { publicId: c.public_id, ...datos },
    });
    total++;
  }
  return { total };
}
