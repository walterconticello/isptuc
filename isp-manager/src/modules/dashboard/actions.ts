"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getDashboardData() {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "No autenticado" };

  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
  const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0);

  const [
    empleados,
    vehiculos,
    cuadrillas,
    combustibleMes,
    combustibleMesAnterior,
    presupuestosPendientes,
    presupuestosMes,
    stockBajoCount,
    herramientasAsignadas,
    actividadReciente,
    empresa,
  ] = await Promise.all([
    db.empleado.groupBy({ by: ["activo"], _count: true }),
    db.vehiculo.groupBy({ by: ["estado"], _count: true }),
    db.cuadrilla.count({ where: { estado: "ACTIVA" } }),
    db.registroCombustible.aggregate({
      where: { fecha: { gte: inicioMes } },
      _sum: { costoTotal: true, litros: true },
      _count: true,
    }),
    db.registroCombustible.aggregate({
      where: { fecha: { gte: inicioMesAnterior, lte: finMesAnterior } },
      _sum: { costoTotal: true },
    }),
    db.presupuesto.count({ where: { estado: "ENVIADO" } }),
    db.presupuesto.aggregate({
      where: { fechaEmision: { gte: inicioMes } },
      _sum: { total: true },
      _count: true,
    }),
    // Stock bajo
    db.producto.findMany({
      where: { activo: true, stockMinimo: { gt: 0 } },
      include: { stock: { select: { cantidad: true } } },
    }).then((prods) =>
      prods.filter((p) => p.stock.reduce((s, sp) => s + sp.cantidad, 0) <= p.stockMinimo).length
    ),
    db.asignacionHerramienta.count({ where: { fechaDevolucion: null } }),
    // Actividad reciente: últimas cargas + últimos movimientos de stock + presupuestos
    Promise.all([
      db.registroCombustible.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, createdAt: true, costoTotal: true, litros: true, vehiculo: { select: { patente: true } }, empleado: { select: { nombre: true, apellido: true } } },
      }),
      db.movimientoStock.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, createdAt: true, tipo: true, cantidad: true, producto: { select: { nombre: true, unidad: true } }, empleado: { select: { nombre: true, apellido: true } } },
      }),
      db.presupuesto.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, createdAt: true, numero: true, total: true, estado: true, cliente: { select: { nombre: true } } },
      }),
    ]),
    db.empresa.findFirst(),
  ]);

  const empleadosActivos = empleados.find((e) => e.activo)?._count ?? 0;
  const empleadosTotal = empleados.reduce((s, e) => s + e._count, 0);
  const vehiculosActivos = vehiculos.find((v) => v.estado === "ACTIVO")?._count ?? 0;
  const vehiculosMantenimiento = vehiculos.find((v) => v.estado === "MANTENIMIENTO")?._count ?? 0;

  const costoCombustibleMes = combustibleMes._sum.costoTotal ?? 0;
  const costoCombustibleAnterior = combustibleMesAnterior._sum.costoTotal ?? 0;
  const varCombustible = costoCombustibleAnterior > 0
    ? ((costoCombustibleMes - costoCombustibleAnterior) / costoCombustibleAnterior) * 100
    : null;

  const [cargas, movimientos, presupuestos] = actividadReciente;

  const actividad = [
    ...cargas.map((c) => ({
      id: c.id,
      tipo: "combustible" as const,
      fecha: c.createdAt,
      descripcion: `Carga ${c.vehiculo.patente} — ${c.litros.toFixed(1)} L`,
      actor: `${c.empleado.nombre} ${c.empleado.apellido}`,
      valor: `$${c.costoTotal.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`,
    })),
    ...movimientos.map((m) => ({
      id: m.id,
      tipo: "stock" as const,
      fecha: m.createdAt,
      descripcion: `${m.tipo} ${m.producto.nombre} — ${Math.abs(m.cantidad)} ${m.producto.unidad}`,
      actor: `${m.empleado.nombre} ${m.empleado.apellido}`,
      valor: "",
    })),
    ...presupuestos.map((p) => ({
      id: p.id,
      tipo: "presupuesto" as const,
      fecha: p.createdAt,
      descripcion: `Presupuesto #${String(p.numero).padStart(4, "0")} — ${p.cliente.nombre}`,
      actor: "",
      valor: `$${Number(p.total).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`,
    })),
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 6);

  return {
    success: true as const,
    data: {
      empresa,
      empleados: { activos: empleadosActivos, total: empleadosTotal },
      vehiculos: { activos: vehiculosActivos, mantenimiento: vehiculosMantenimiento },
      cuadrillas,
      combustible: {
        costomes: costoCombustibleMes,
        litrosMes: combustibleMes._sum.litros ?? 0,
        cargasMes: combustibleMes._count,
        varPorcentaje: varCombustible,
      },
      presupuestos: {
        pendientes: presupuestosPendientes,
        totalMes: Number(presupuestosMes._sum.total ?? 0),
        cantidadMes: presupuestosMes._count,
      },
      stockBajoCount,
      herramientasAsignadas,
      actividad,
    },
  };
}
