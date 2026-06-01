import { db } from "@/lib/db";

export type AuditAccion =
  // Auth
  | "LOGIN_EXITOSO" | "LOGIN_FALLIDO" | "LOGOUT"
  // Empleados
  | "CREAR_EMPLEADO" | "EDITAR_EMPLEADO" | "ACTIVAR_EMPLEADO" | "DESACTIVAR_EMPLEADO"
  // Flota
  | "CREAR_VEHICULO" | "EDITAR_VEHICULO"
  // Combustible
  | "REGISTRAR_COMBUSTIBLE"
  // Cuadrillas
  | "CREAR_CUADRILLA" | "EDITAR_CUADRILLA" | "ACTIVAR_CUADRILLA" | "DESACTIVAR_CUADRILLA"
  | "AGREGAR_MIEMBRO_CUADRILLA" | "REMOVER_MIEMBRO_CUADRILLA"
  // Presupuestos
  | "CREAR_PRESUPUESTO" | "EDITAR_PRESUPUESTO" | "CAMBIAR_ESTADO_PRESUPUESTO"
  // Clientes
  | "CREAR_CLIENTE" | "EDITAR_CLIENTE"
  // Items
  | "CREAR_ITEM" | "EDITAR_ITEM" | "ACTIVAR_ITEM" | "DESACTIVAR_ITEM"
  // Stock
  | "CREAR_ALMACEN" | "EDITAR_ALMACEN"
  | "CREAR_PRODUCTO" | "EDITAR_PRODUCTO"
  | "REGISTRAR_MOVIMIENTO_STOCK"
  | "ASIGNAR_HERRAMIENTA" | "DEVOLVER_HERRAMIENTA"
  // Admin
  | "CAMBIAR_PERMISO" | "ACTUALIZAR_EMPRESA";

export type AuditModulo =
  | "AUTH" | "EMPLEADOS" | "FLOTA" | "COMBUSTIBLE" | "CUADRILLAS"
  | "PRESUPUESTOS" | "CLIENTES" | "ITEMS" | "STOCK" | "ADMIN";

interface LogParams {
  empleadoId?: string;
  accion: AuditAccion;
  modulo: AuditModulo;
  entidadId?: string;
  entidadNombre?: string;
  detalles?: Record<string, unknown>;
}

export async function logAudit(params: LogParams): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        empleadoId: params.empleadoId ?? null,
        accion: params.accion,
        modulo: params.modulo,
        entidadId: params.entidadId ?? null,
        entidadNombre: params.entidadNombre ?? null,
        detalles: params.detalles ? (params.detalles as import("@/generated/prisma/client").Prisma.InputJsonValue) : undefined,
      },
    });
  } catch {
    // El log de auditoría nunca debe romper la operación principal
  }
}

export const ACCION_LABEL: Record<AuditAccion, string> = {
  LOGIN_EXITOSO:              "Inicio de sesión",
  LOGIN_FALLIDO:              "Intento de login fallido",
  LOGOUT:                     "Cierre de sesión",
  CREAR_EMPLEADO:             "Crear empleado",
  EDITAR_EMPLEADO:            "Editar empleado",
  ACTIVAR_EMPLEADO:           "Activar empleado",
  DESACTIVAR_EMPLEADO:        "Desactivar empleado",
  CREAR_VEHICULO:             "Crear vehículo",
  EDITAR_VEHICULO:            "Editar vehículo",
  REGISTRAR_COMBUSTIBLE:      "Registrar combustible",
  CREAR_CUADRILLA:            "Crear cuadrilla",
  EDITAR_CUADRILLA:           "Editar cuadrilla",
  ACTIVAR_CUADRILLA:          "Activar cuadrilla",
  DESACTIVAR_CUADRILLA:       "Desactivar cuadrilla",
  AGREGAR_MIEMBRO_CUADRILLA:  "Agregar miembro a cuadrilla",
  REMOVER_MIEMBRO_CUADRILLA:  "Remover miembro de cuadrilla",
  CREAR_PRESUPUESTO:          "Crear presupuesto",
  EDITAR_PRESUPUESTO:         "Editar presupuesto",
  CAMBIAR_ESTADO_PRESUPUESTO: "Cambiar estado de presupuesto",
  CREAR_CLIENTE:              "Crear cliente",
  EDITAR_CLIENTE:             "Editar cliente",
  CREAR_ITEM:                 "Crear item/servicio",
  EDITAR_ITEM:                "Editar item/servicio",
  ACTIVAR_ITEM:               "Activar item",
  DESACTIVAR_ITEM:            "Desactivar item",
  CREAR_ALMACEN:              "Crear almacén",
  EDITAR_ALMACEN:             "Editar almacén",
  CREAR_PRODUCTO:             "Crear producto",
  EDITAR_PRODUCTO:            "Editar producto",
  REGISTRAR_MOVIMIENTO_STOCK: "Movimiento de stock",
  ASIGNAR_HERRAMIENTA:        "Asignar herramienta",
  DEVOLVER_HERRAMIENTA:       "Devolver herramienta",
  CAMBIAR_PERMISO:            "Cambiar permiso de módulo",
  ACTUALIZAR_EMPRESA:         "Actualizar datos de empresa",
};

export const MODULO_AUDIT_COLOR: Record<AuditModulo, string> = {
  AUTH:         "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  EMPLEADOS:    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  FLOTA:        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  COMBUSTIBLE:  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  CUADRILLAS:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  PRESUPUESTOS: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  CLIENTES:     "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  ITEMS:        "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  STOCK:        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  ADMIN:        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};
