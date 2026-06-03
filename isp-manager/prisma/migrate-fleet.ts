/**
 * Script de migración: fleet-manager → isp-manager
 *
 * Qué migra:
 *   - 6 empleados (técnicos) identificados por nombre en fuel logs + cuadrilla
 *   - 1 cuadrilla con 2 miembros
 *   - 7 vehículos
 *   - 16 registros de combustible
 *
 * Ejecutar: npm run db:migrate-fleet
 */
import { PrismaClient as IspClient, Rol, TipoVehiculo, EstadoVehiculo, TipoCombustible, EstadoCuadrilla } from "../src/generated/prisma/client";
import { PrismaPg as IspPg } from "@prisma/adapter-pg";
import pg from "pg";

// ─── Conexiones ───────────────────────────────────────────────────────────────

const ispAdapter = new IspPg(
  process.env.DATABASE_URL ??
  "postgresql://isp:isp123@localhost:5434/isp_manager?schema=public"
);
const isp = new IspClient({ adapter: ispAdapter });

const fleetPool = new pg.Pool({
  connectionString: "postgresql://fleet:fleet123@localhost:5433/fleet_manager",
});

// ─── Datos conocidos (empleados del fleet-manager) ────────────────────────────

const EMPLEADOS = [
  { nombre: "Gonzalo", apellido: "Heredia",   email: "heredia.gonzalo@isp.local",   loadedByNames: ["Heredia Gonzalo"],    esJefe: false },
  { nombre: "Ramon",   apellido: "Robles",    email: "robles.ramon@isp.local",      loadedByNames: ["Robles Ramon", "ROBLES RAMON"], esJefe: true },
  { nombre: "Javier",  apellido: "Gonzalez",  email: "gonzalez.javier@isp.local",   loadedByNames: ["Gonzalez Javier"],    esJefe: false },
  { nombre: "Dario",   apellido: "Ponce",     email: "ponce.dario@isp.local",       loadedByNames: ["Ponce Dario"],        esJefe: false },
  { nombre: "Enrique", apellido: "Navarro",   email: "navarro.enrique@isp.local",   loadedByNames: ["Enrique Navarro"],    esJefe: false },
  { nombre: "Fernando",apellido: "Figueroa",  email: "figueroa.fernando@isp.local", loadedByNames: ["Figueroa Fernando"],  esJefe: false },
];

// ─── Mappings de enums ────────────────────────────────────────────────────────

const TIPO_VEHICULO: Record<string, TipoVehiculo> = {
  CAR:        TipoVehiculo.AUTO,
  VAN:        TipoVehiculo.FURGON,
  TRUCK:      TipoVehiculo.CAMIONETA,
  MOTORCYCLE: TipoVehiculo.MOTO,
};

const ESTADO_VEHICULO: Record<string, EstadoVehiculo> = {
  ACTIVE:      EstadoVehiculo.ACTIVO,
  INACTIVE:    EstadoVehiculo.INACTIVO,
  MAINTENANCE: EstadoVehiculo.MANTENIMIENTO,
};

const TIPO_COMBUSTIBLE: Record<string, TipoCombustible> = {
  GASOLINE: TipoCombustible.NAFTA,
  DIESEL:   TipoCombustible.DIESEL,
  CNG:      TipoCombustible.GNC,
  PREMIUM:  TipoCombustible.PREMIUM,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findEmpleadoByLoadedBy(
  empleados: Map<string, string>,
  loadedBy: string
): string | null {
  for (const def of EMPLEADOS) {
    if (def.loadedByNames.includes(loadedBy)) {
      return empleados.get(def.email) ?? null;
    }
  }
  return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚛 Iniciando migración desde fleet-manager...\n");

  // 1. Empleados
  console.log("👷 Creando empleados...");
  const empleadosMap = new Map<string, string>(); // email → id en isp

  for (const def of EMPLEADOS) {
    const emp = await isp.empleado.upsert({
      where: { email: def.email },
      update: {},
      create: {
        email: def.email,
        passwordHash: "$migrado$", // cuenta inactiva — admin debe asignar contraseña
        nombre: def.nombre,
        apellido: def.apellido,
        rol: Rol.TECNICO,
        activo: false, // requiere activación manual
      },
    });
    empleadosMap.set(def.email, emp.id);
    console.log(`  ✅ ${def.apellido} ${def.nombre} (${def.email})`);
  }

  // 2. Cuadrilla
  console.log("\n👥 Creando cuadrilla...");
  const cuadrilla = await isp.cuadrilla.upsert({
    where: { id: "cuadrilla-migrada-1" },
    update: {},
    create: {
      id: "cuadrilla-migrada-1",
      nombre: "Cuadrilla 1",
      estado: EstadoCuadrilla.ACTIVA,
    },
  });
  console.log(`  ✅ ${cuadrilla.nombre}`);

  // Miembros de la cuadrilla (solo los 2 que estaban asignados)
  const miembrosDef = EMPLEADOS.filter((e) =>
    ["heredia.gonzalo@isp.local", "robles.ramon@isp.local"].includes(e.email)
  );
  for (const def of miembrosDef) {
    const empId = empleadosMap.get(def.email)!;
    await isp.miembroCuadrilla.upsert({
      where: { cuadrillaId_empleadoId: { cuadrillaId: cuadrilla.id, empleadoId: empId } },
      update: {},
      create: {
        cuadrillaId: cuadrilla.id,
        empleadoId: empId,
        esJefe: def.esJefe,
      },
    });
    console.log(`  ✅ ${def.apellido} ${def.nombre} (jefe: ${def.esJefe})`);
  }

  // 3. Vehículos
  console.log("\n🚗 Migrando vehículos...");
  const { rows: fleetVehicles } = await fleetPool.query<{
    id: string; plateNumber: string; brand: string; model: string;
    year: number; type: string; status: string; currentOdometer: number;
    crewId: string | null; notes: string | null;
  }>('SELECT * FROM "Vehicle"');

  const vehiculosMap = new Map<string, string>(); // fleet id → isp id

  for (const v of fleetVehicles) {
    const vehiculo = await isp.vehiculo.upsert({
      where: { patente: v.plateNumber },
      update: {},
      create: {
        patente: v.plateNumber,
        marca: v.brand === "-" ? "Sin marca" : v.brand,
        modelo: v.model === "-" ? "Sin modelo" : v.model,
        anio: v.year,
        tipo: TIPO_VEHICULO[v.type] ?? TipoVehiculo.AUTO,
        estado: ESTADO_VEHICULO[v.status] ?? EstadoVehiculo.ACTIVO,
        odometroActual: v.currentOdometer,
        cuadrillaId: v.crewId ? cuadrilla.id : null,
        notas: v.notes,
      },
    });
    vehiculosMap.set(v.id, vehiculo.id);
    console.log(`  ✅ ${v.plateNumber} — ${v.brand} ${v.model} (${v.year})`);
  }

  // 4. Registros de combustible
  console.log("\n⛽ Migrando registros de combustible...");
  const { rows: fuelLogs } = await fleetPool.query<{
    id: string; vehicleId: string; date: Date; liters: number;
    pricePerLiter: number; totalCost: number; odometerReading: number;
    kmSinceLast: number | null; consumptionRate: number | null;
    fuelType: string; stationName: string | null; loadedBy: string; notes: string | null;
  }>('SELECT * FROM "FuelLog" ORDER BY date');

  let migrated = 0;
  let skipped = 0;

  for (const fl of fuelLogs) {
    const vehiculoId = vehiculosMap.get(fl.vehicleId);
    const empleadoId = findEmpleadoByLoadedBy(empleadosMap, fl.loadedBy);

    if (!vehiculoId || !empleadoId) {
      console.log(`  ⚠️  Saltando log ${fl.id} — vehiculoId: ${vehiculoId ? "✓" : "✗"}, empleadoId: ${empleadoId ? "✓" : "✗"}`);
      skipped++;
      continue;
    }

    await isp.registroCombustible.upsert({
      where: { id: `fleet-${fl.id}` },
      update: {},
      create: {
        id: `fleet-${fl.id}`,
        vehiculoId,
        empleadoId,
        fecha: fl.date,
        litros: fl.liters,
        precioPorLitro: fl.pricePerLiter,
        costoTotal: fl.totalCost,
        odometro: fl.odometerReading,
        kmDesdeUltimo: fl.kmSinceLast,
        // fleet guarda consumptionRate en km/L; isp usa L/100km → recalcular.
        consumo:
          fl.kmSinceLast && fl.kmSinceLast > 0
            ? (fl.liters * 100) / fl.kmSinceLast
            : null,
        tipoCombustible: TIPO_COMBUSTIBLE[fl.fuelType] ?? TipoCombustible.NAFTA,
        estacion: fl.stationName,
        notas: fl.notes,
      },
    });
    migrated++;
  }
  console.log(`  ✅ ${migrated} registros migrados, ${skipped} saltados`);

  console.log("\n🎉 Migración completada.");
  console.log("📋 Recordá activar las cuentas de los empleados desde /admin o /empleados.");
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(async () => {
    await isp.$disconnect();
    await fleetPool.end();
  });
