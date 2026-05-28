import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("admin123", 12);
  const ownerHash = await bcrypt.hash("owner123", 12);

  await prisma.user.upsert({
    where: { email: "admin@empresa.com" },
    update: {},
    create: { email: "admin@empresa.com", passwordHash: adminHash, nombre: "Administrador", role: "ADMIN" },
  });

  await prisma.user.upsert({
    where: { email: "dueno@empresa.com" },
    update: {},
    create: { email: "dueno@empresa.com", passwordHash: ownerHash, nombre: "Dueño", role: "OWNER" },
  });

  const companyCount = await prisma.company.count();
  if (companyCount === 0) {
    await prisma.company.create({
      data: { nombre: "Mi Empresa ISP", cuit: "30-00000000-0" },
    });
  }

  const impuestoCount = await prisma.impuesto.count();
  if (impuestoCount === 0) {
    await prisma.impuesto.createMany({
      data: [
        { nombre: "Exento", porcentaje: 0, activo: true, esDefault: false },
        { nombre: "IVA 10,5%", porcentaje: 10.5, activo: true, esDefault: false },
        { nombre: "IVA 21%", porcentaje: 21, activo: true, esDefault: true },
      ],
    });
  }

  console.log("Seed completado.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
