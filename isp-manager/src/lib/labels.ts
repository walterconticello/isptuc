import { Rol, TipoVehiculo, EstadoVehiculo, TipoCombustible, EstadoCuadrilla, CategoriaProducto, TipoMovimiento } from "@/generated/prisma/enums";

export const CATEGORIA_LABEL: Record<CategoriaProducto, string> = {
  RED:               "Red / Networking",
  FIBRA_OPTICA:      "Fibra óptica",
  HERRAJE:           "Herrajes",
  HERRAMIENTA:       "Herramientas",
  MATERIAL_ELECTRICO:"Material eléctrico",
  CONSUMIBLE:        "Consumibles",
  OTRO:              "Otro",
};

export const TIPO_MOVIMIENTO_LABEL: Record<TipoMovimiento, string> = {
  ENTRADA:      "Entrada",
  SALIDA:       "Salida",
  AJUSTE:       "Ajuste",
  TRANSFERENCIA:"Transferencia",
};

export const TIPO_MOVIMIENTO_COLOR: Record<TipoMovimiento, string> = {
  ENTRADA:      "text-green-600 dark:text-green-400",
  SALIDA:       "text-red-600 dark:text-red-400",
  AJUSTE:       "text-yellow-600 dark:text-yellow-400",
  TRANSFERENCIA:"text-blue-600 dark:text-blue-400",
};

export const ROL_LABEL: Record<Rol, string> = {
  DUENO: "Dueño",
  GERENTE: "Gerente",
  ADMIN: "Admin",
  ADMINISTRATIVO: "Administrativo",
  TECNICO: "Técnico",
};

export const TIPO_VEHICULO_LABEL: Record<TipoVehiculo, string> = {
  AUTO: "Auto", CAMIONETA: "Camioneta", MOTO: "Moto", FURGON: "Furgón",
};

export const ESTADO_VEHICULO_LABEL: Record<EstadoVehiculo, string> = {
  ACTIVO: "Activo", MANTENIMIENTO: "En mantenimiento", INACTIVO: "Inactivo",
};

export const ESTADO_VEHICULO_COLOR: Record<EstadoVehiculo, string> = {
  ACTIVO:       "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  MANTENIMIENTO:"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  INACTIVO:     "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export const TIPO_COMBUSTIBLE_LABEL: Record<TipoCombustible, string> = {
  NAFTA: "Nafta", DIESEL: "Diésel", GNC: "GNC", PREMIUM: "Premium",
};

export const ESTADO_CUADRILLA_LABEL: Record<EstadoCuadrilla, string> = {
  ACTIVA: "Activa", INACTIVA: "Inactiva",
};

export const ROL_COLOR: Record<Rol, string> = {
  DUENO:         "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  GERENTE:       "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  ADMIN:         "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  ADMINISTRATIVO:"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  TECNICO:       "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};
