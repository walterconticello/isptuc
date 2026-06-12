import { PrismaClient, Rol, Modulo } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { getCredencialesAdminSeed } from "./seed-helpers";

const adapter = new PrismaPg(
  process.env.DATABASE_URL ??
    "postgresql://isp:isp123@localhost:5434/isp_manager?schema=public"
);
const db = new PrismaClient({ adapter });

// Permisos por defecto: true = tiene acceso, false = sin acceso
// Orden: DUENO, GERENTE, ADMIN, ADMINISTRATIVO, TECNICO
const PERMISOS_DEFAULT: Record<Modulo, Record<Rol, boolean>> = {
  DASHBOARD:    { DUENO: true,  GERENTE: true,  ADMIN: true,  ADMINISTRATIVO: true,  TECNICO: true  },
  EMPLEADOS:    { DUENO: true,  GERENTE: true,  ADMIN: true,  ADMINISTRATIVO: false, TECNICO: false },
  FLOTA:        { DUENO: true,  GERENTE: true,  ADMIN: true,  ADMINISTRATIVO: true,  TECNICO: true  },
  COMBUSTIBLE:  { DUENO: true,  GERENTE: true,  ADMIN: true,  ADMINISTRATIVO: true,  TECNICO: true  },
  CUADRILLAS:   { DUENO: true,  GERENTE: true,  ADMIN: true,  ADMINISTRATIVO: true,  TECNICO: true  },
  PRESUPUESTOS: { DUENO: true,  GERENTE: true,  ADMIN: true,  ADMINISTRATIVO: false, TECNICO: false },
  CLIENTES:     { DUENO: true,  GERENTE: true,  ADMIN: true,  ADMINISTRATIVO: true,  TECNICO: false },
  ITEMS:        { DUENO: true,  GERENTE: true,  ADMIN: true,  ADMINISTRATIVO: true,  TECNICO: false },
  STOCK:        { DUENO: true,  GERENTE: true,  ADMIN: true,  ADMINISTRATIVO: true,  TECNICO: true  },
  RED:          { DUENO: true,  GERENTE: true,  ADMIN: true,  ADMINISTRATIVO: false, TECNICO: true  },
  ADMIN:        { DUENO: true,  GERENTE: false, ADMIN: true,  ADMINISTRATIVO: false, TECNICO: false },
};

async function main() {
  console.log("🌱 Iniciando seed...");

  // Empresa
  const empresa = await db.empresa.upsert({
    where: { id: "empresa-principal" },
    update: {},
    create: {
      id: "empresa-principal",
      nombre: "Mi ISP S.R.L.",
      cuit: "00-00000000-0",
    },
  });
  console.log(`✅ Empresa: ${empresa.nombre}`);

  // Permisos por módulo (50 registros: 5 roles × 10 módulos)
  const roles = Object.values(Rol);
  const modulos = Object.values(Modulo);
  let permisosCreados = 0;

  for (const modulo of modulos) {
    for (const rol of roles) {
      await db.permisoModulo.upsert({
        where: { rol_modulo: { rol, modulo } },
        update: {},
        create: {
          rol,
          modulo,
          puede: PERMISOS_DEFAULT[modulo][rol],
        },
      });
      permisosCreados++;
    }
  }
  console.log(`✅ Permisos: ${permisosCreados} registros`);

  // Usuario administrador (DUENO) — credenciales desde el entorno, sin hardcodear.
  const { email: adminEmail, password: adminPassword } = getCredencialesAdminSeed();
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await db.empleado.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      nombre: "Admin",
      apellido: "Sistema",
      rol: Rol.DUENO,
      activo: true,
    },
  });
  console.log(`✅ Empleado admin: ${admin.email} (${admin.rol})`);

  // Impuesto IVA por defecto
  await db.impuesto.upsert({
    where: { id: "iva-21" },
    update: {},
    create: {
      id: "iva-21",
      nombre: "IVA 21%",
      porcentaje: 21,
      activo: true,
      esDefault: true,
    },
  });
  console.log("✅ Impuesto: IVA 21%");

  console.log("\n🎉 Seed completado.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
