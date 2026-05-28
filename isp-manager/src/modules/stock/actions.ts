"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkPermission } from "@/lib/permissions";
import { z } from "zod";
import { Modulo, CategoriaProducto, TipoMovimiento } from "@/generated/prisma/client";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

async function guardStock() {
  const session = await auth();
  if (!session?.user?.id) return { session: null, error: "No autenticado" };
  const ok = await checkPermission(session.user.id, Modulo.STOCK);
  if (!ok) return { session: null, error: "Sin permisos" };
  return { session, error: null };
}

// ─── Schemas ─────────────────────────────────────────────────────────────────

const almacenSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  ubicacion: z.string().optional(),
  encargadoId: z.string().optional().or(z.literal("")),
});

const productoSchema = z.object({
  codigo: z.string().optional(),
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  categoria: z.enum(Object.values(CategoriaProducto) as [string, ...string[]]),
  unidad: z.string().min(1, "La unidad es requerida"),
  stockMinimo: z.coerce.number().int().min(0).default(0),
  esHerramienta: z.coerce.boolean().default(false),
});

const movimientoSchema = z.object({
  almacenId: z.string().min(1, "Seleccioná un almacén"),
  productoId: z.string().min(1, "Seleccioná un producto"),
  tipo: z.enum(Object.values(TipoMovimiento) as [string, ...string[]]),
  cantidad: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1"),
  motivo: z.string().optional(),
  referencia: z.string().optional(),
  // Para TRANSFERENCIA
  almacenDestinoId: z.string().optional(),
});

const asignacionSchema = z.object({
  productoId: z.string().min(1),
  empleadoId: z.string().min(1),
  cantidad: z.coerce.number().int().min(1).default(1),
  notas: z.string().optional(),
});

// ─── Almacenes ────────────────────────────────────────────────────────────────

export async function getAlmacenes() {
  const { session, error } = await guardStock();
  if (!session) return { success: false as const, error: error! };

  const almacenes = await db.almacen.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    include: {
      encargado: { select: { nombre: true, apellido: true } },
      _count: { select: { stock: true } },
    },
  });
  return { success: true as const, data: almacenes };
}

export async function getAlmacenById(id: string) {
  const { session, error } = await guardStock();
  if (!session) return { success: false as const, error: error! };

  const almacen = await db.almacen.findUnique({
    where: { id },
    include: {
      encargado: { select: { nombre: true, apellido: true } },
      stock: {
        include: { producto: true },
        orderBy: { producto: { nombre: "asc" } },
      },
    },
  });
  if (!almacen) return { success: false as const, error: "Almacén no encontrado" };
  return { success: true as const, data: almacen };
}

export async function createAlmacen(rawData: unknown): Promise<ActionResult<{ id: string }>> {
  const { session, error } = await guardStock();
  if (!session) return { success: false, error: error! };

  const parsed = almacenSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const almacen = await db.almacen.create({
    data: {
      nombre: parsed.data.nombre,
      ubicacion: parsed.data.ubicacion || null,
      encargadoId: parsed.data.encargadoId || null,
    },
  });
  revalidatePath("/stock/almacenes");
  return { success: true, data: { id: almacen.id } };
}

export async function updateAlmacen(id: string, rawData: unknown): Promise<ActionResult> {
  const { session, error } = await guardStock();
  if (!session) return { success: false, error: error! };

  const parsed = almacenSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  await db.almacen.update({
    where: { id },
    data: {
      nombre: parsed.data.nombre,
      ubicacion: parsed.data.ubicacion || null,
      encargadoId: parsed.data.encargadoId || null,
    },
  });
  revalidatePath("/stock/almacenes");
  revalidatePath(`/stock/almacenes/${id}`);
  return { success: true, data: undefined };
}

// ─── Productos ────────────────────────────────────────────────────────────────

export async function getProductos() {
  const { session, error } = await guardStock();
  if (!session) return { success: false as const, error: error! };

  const productos = await db.producto.findMany({
    where: { activo: true },
    orderBy: [{ categoria: "asc" }, { nombre: "asc" }],
    include: {
      stock: { include: { almacen: { select: { nombre: true } } } },
    },
  });
  return { success: true as const, data: productos };
}

export async function getProductoById(id: string) {
  const { session, error } = await guardStock();
  if (!session) return { success: false as const, error: error! };

  const producto = await db.producto.findUnique({
    where: { id },
    include: {
      stock: { include: { almacen: true } },
      movimientos: {
        orderBy: { fecha: "desc" },
        take: 10,
        include: {
          almacen: { select: { nombre: true } },
          empleado: { select: { nombre: true, apellido: true } },
        },
      },
      asignaciones: {
        where: { fechaDevolucion: null },
        include: { empleado: { select: { nombre: true, apellido: true } } },
      },
    },
  });
  if (!producto) return { success: false as const, error: "Producto no encontrado" };
  return { success: true as const, data: producto };
}

export async function createProducto(rawData: unknown): Promise<ActionResult<{ id: string }>> {
  const { session, error } = await guardStock();
  if (!session) return { success: false, error: error! };

  const parsed = productoSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  if (parsed.data.codigo) {
    const existe = await db.producto.findUnique({ where: { codigo: parsed.data.codigo } });
    if (existe) return { success: false, error: "Ya existe un producto con ese código" };
  }

  const producto = await db.producto.create({
    data: {
      codigo: parsed.data.codigo || null,
      nombre: parsed.data.nombre,
      descripcion: parsed.data.descripcion || null,
      categoria: parsed.data.categoria as CategoriaProducto,
      unidad: parsed.data.unidad,
      stockMinimo: parsed.data.stockMinimo,
      esHerramienta: Boolean(parsed.data.esHerramienta),
    },
  });
  revalidatePath("/stock/productos");
  return { success: true, data: { id: producto.id } };
}

export async function updateProducto(id: string, rawData: unknown): Promise<ActionResult> {
  const { session, error } = await guardStock();
  if (!session) return { success: false, error: error! };

  const parsed = productoSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  await db.producto.update({
    where: { id },
    data: {
      codigo: parsed.data.codigo || null,
      nombre: parsed.data.nombre,
      descripcion: parsed.data.descripcion || null,
      categoria: parsed.data.categoria as CategoriaProducto,
      unidad: parsed.data.unidad,
      stockMinimo: parsed.data.stockMinimo,
      esHerramienta: Boolean(parsed.data.esHerramienta),
    },
  });
  revalidatePath("/stock/productos");
  revalidatePath(`/stock/productos/${id}`);
  return { success: true, data: undefined };
}

// ─── Movimientos ──────────────────────────────────────────────────────────────

export async function getMovimientos(productoId?: string, almacenId?: string) {
  const { session, error } = await guardStock();
  if (!session) return { success: false as const, error: error! };

  const movimientos = await db.movimientoStock.findMany({
    where: {
      ...(productoId ? { productoId } : {}),
      ...(almacenId ? { almacenId } : {}),
    },
    orderBy: { fecha: "desc" },
    take: 100,
    include: {
      producto: { select: { nombre: true, unidad: true } },
      almacen: { select: { nombre: true } },
      empleado: { select: { nombre: true, apellido: true } },
    },
  });
  return { success: true as const, data: movimientos };
}

export async function registrarMovimiento(rawData: unknown): Promise<ActionResult> {
  const { session, error } = await guardStock();
  if (!session) return { success: false, error: error! };

  const parsed = movimientoSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { almacenId, productoId, tipo, cantidad, motivo, referencia, almacenDestinoId } = parsed.data;

  // Para SALIDA y TRANSFERENCIA: verificar stock suficiente
  if (tipo === "SALIDA" || tipo === "TRANSFERENCIA") {
    const stockActual = await db.stockProducto.findUnique({
      where: { almacenId_productoId: { almacenId, productoId } },
    });
    if (!stockActual || stockActual.cantidad < cantidad) {
      return { success: false, error: `Stock insuficiente. Disponible: ${stockActual?.cantidad ?? 0}` };
    }
  }

  await db.$transaction(async (tx) => {
    // Registrar movimiento origen
    await tx.movimientoStock.create({
      data: {
        almacenId,
        productoId,
        empleadoId: session.user.id,
        tipo: tipo as TipoMovimiento,
        cantidad: tipo === "SALIDA" || tipo === "TRANSFERENCIA" ? -cantidad : cantidad,
        motivo: motivo || null,
        referencia: referencia || null,
        fecha: new Date(),
      },
    });

    // Actualizar stock origen
    const delta = tipo === "ENTRADA" || tipo === "AJUSTE" ? cantidad : -cantidad;
    await tx.stockProducto.upsert({
      where: { almacenId_productoId: { almacenId, productoId } },
      create: { almacenId, productoId, cantidad: delta },
      update: { cantidad: { increment: delta } },
    });

    // Para TRANSFERENCIA: movimiento y stock en destino
    if (tipo === "TRANSFERENCIA" && almacenDestinoId) {
      await tx.movimientoStock.create({
        data: {
          almacenId: almacenDestinoId,
          productoId,
          empleadoId: session.user.id,
          tipo: TipoMovimiento.ENTRADA,
          cantidad,
          motivo: `Transferencia desde ${almacenId}`,
          referencia: referencia || null,
          fecha: new Date(),
        },
      });
      await tx.stockProducto.upsert({
        where: { almacenId_productoId: { almacenId: almacenDestinoId, productoId } },
        create: { almacenId: almacenDestinoId, productoId, cantidad },
        update: { cantidad: { increment: cantidad } },
      });
    }
  });

  revalidatePath("/stock");
  revalidatePath(`/stock/productos/${productoId}`);
  revalidatePath(`/stock/almacenes/${almacenId}`);
  return { success: true, data: undefined };
}

// ─── Asignación de herramientas ───────────────────────────────────────────────

export async function getAsignacionesActivas() {
  const { session, error } = await guardStock();
  if (!session) return { success: false as const, error: error! };

  const asignaciones = await db.asignacionHerramienta.findMany({
    where: { fechaDevolucion: null },
    orderBy: { fechaAsignacion: "desc" },
    include: {
      producto: { select: { nombre: true, codigo: true, unidad: true } },
      empleado: { select: { nombre: true, apellido: true } },
    },
  });
  return { success: true as const, data: asignaciones };
}

export async function asignarHerramienta(rawData: unknown): Promise<ActionResult> {
  const { session, error } = await guardStock();
  if (!session) return { success: false, error: error! };

  const parsed = asignacionSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  await db.asignacionHerramienta.create({
    data: {
      productoId: parsed.data.productoId,
      empleadoId: parsed.data.empleadoId,
      cantidad: parsed.data.cantidad,
      notas: parsed.data.notas || null,
    },
  });
  revalidatePath("/stock/herramientas");
  return { success: true, data: undefined };
}

export async function devolverHerramienta(id: string): Promise<ActionResult> {
  const { session, error } = await guardStock();
  if (!session) return { success: false, error: error! };

  await db.asignacionHerramienta.update({
    where: { id },
    data: { fechaDevolucion: new Date() },
  });
  revalidatePath("/stock/herramientas");
  return { success: true, data: undefined };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getStockDashboard() {
  const { session, error } = await guardStock();
  if (!session) return { success: false as const, error: error! };

  const [productosConStock, almacenes, movimientosRecientes, herramientasAsignadas] = await Promise.all([
    db.producto.findMany({
      where: { activo: true },
      include: { stock: true },
      orderBy: { nombre: "asc" },
    }),
    db.almacen.count({ where: { activo: true } }),
    db.movimientoStock.findMany({
      orderBy: { fecha: "desc" },
      take: 5,
      include: {
        producto: { select: { nombre: true, unidad: true } },
        almacen: { select: { nombre: true } },
        empleado: { select: { nombre: true, apellido: true } },
      },
    }),
    db.asignacionHerramienta.count({ where: { fechaDevolucion: null } }),
  ]);

  const stockBajo = productosConStock.filter((p) => {
    const totalStock = p.stock.reduce((s, sp) => s + sp.cantidad, 0);
    return p.stockMinimo > 0 && totalStock <= p.stockMinimo;
  });

  return {
    success: true as const,
    data: { stockBajo, totalAlmacenes: almacenes, movimientosRecientes, herramientasAsignadas },
  };
}
