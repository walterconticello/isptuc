/**
 * Recalcula `consumo` (L/100km) de todos los registros de combustible a partir de
 * litros y kmDesdeUltimo, usando la fórmula canónica del módulo.
 *
 * Necesario porque la primera migración desde fleet-manager guardó el consumo en
 * km/L (la métrica de fleet) en un campo que la app interpreta como L/100km.
 * Idempotente: correrlo de nuevo no cambia nada si los datos ya son correctos.
 *
 *   npx tsx prisma/fix-consumo.ts
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { calcularConsumo } from "../src/modules/combustible/calculos";

const adapter = new PrismaPg(
  process.env.DATABASE_URL ?? "postgresql://isp:isp123@localhost:5434/isp_manager?schema=public"
);
const db = new PrismaClient({ adapter });

async function main() {
  const registros = await db.registroCombustible.findMany({
    select: { id: true, litros: true, kmDesdeUltimo: true, consumo: true },
  });

  let corregidos = 0;
  for (const r of registros) {
    const esperado = calcularConsumo(r.litros, r.kmDesdeUltimo);
    const actual = r.consumo;
    const distinto =
      (esperado === null) !== (actual === null) ||
      (esperado !== null && actual !== null && Math.abs(esperado - actual) > 1e-6);
    if (distinto) {
      await db.registroCombustible.update({ where: { id: r.id }, data: { consumo: esperado } });
      corregidos++;
    }
  }

  console.log(`✅ Registros revisados: ${registros.length} · corregidos: ${corregidos}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
