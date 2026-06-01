import { z } from "zod";

const rolesValidos = ["DUENO", "GERENTE", "ADMIN", "ADMINISTRATIVO", "TECNICO"] as const;

export const crearEmpleadoSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  dni: z.string().optional(),
  telefono: z.string().optional(),
  rol: z.enum(rolesValidos, { message: "Rol inválido" }),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const editarEmpleadoSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  dni: z.string().optional(),
  telefono: z.string().optional(),
  rol: z.enum(rolesValidos, { message: "Rol inválido" }),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .optional()
    .or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

const tiposVehiculo = ["AUTO", "CAMIONETA", "MOTO", "FURGON", "EQUIPO", "OTRO"] as const;
const estadosVehiculo = ["ACTIVO", "MANTENIMIENTO", "INACTIVO"] as const;
const tiposCombustible = ["NAFTA", "DIESEL", "GNC", "PREMIUM"] as const;

export const vehiculoSchema = z.object({
  patente: z.string().min(1, "La patente es requerida").toUpperCase(),
  marca: z.string().min(1, "La marca es requerida"),
  modelo: z.string().min(1, "El modelo es requerido"),
  anio: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  tipo: z.enum(tiposVehiculo, { message: "Tipo inválido" }),
  estado: z.enum(estadosVehiculo, { message: "Estado inválido" }),
  odometroActual: z.coerce.number().min(0).default(0),
  cuadrillaId: z.string().optional().or(z.literal("")),
  notas: z.string().optional(),
});

export const combustibleSchema = z.object({
  vehiculoId: z.string().min(1, "Seleccioná un vehículo"),
  empleadoId: z.string().min(1, "Seleccioná un empleado"),
  fecha: z.string().min(1, "La fecha es requerida"),
  litros: z.coerce.number().positive("Los litros deben ser positivos"),
  costoTotal: z.coerce.number().positive("El total del ticket debe ser positivo"),
  odometro: z.coerce.number().min(0, "El odómetro no puede ser negativo"),
  tipoCombustible: z.enum(tiposCombustible, { message: "Tipo de combustible inválido" }),
  estacion: z.string().optional(),
  notas: z.string().optional(),
});

export const cuadrillaSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
});

export const agregarMiembroSchema = z.object({
  cuadrillaId: z.string().min(1, "Cuadrilla inválida"),
  empleadoId: z.string().min(1, "Empleado inválido"),
  esJefe: z.boolean().default(false),
});

export const removerMiembroSchema = z.object({
  cuadrillaId: z.string().min(1, "Cuadrilla inválida"),
  empleadoId: z.string().min(1, "Empleado inválido"),
});

export type CrearEmpleadoInput = z.infer<typeof crearEmpleadoSchema>;
export type EditarEmpleadoInput = z.infer<typeof editarEmpleadoSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VehiculoInput = z.infer<typeof vehiculoSchema>;
export type CombustibleInput = z.infer<typeof combustibleSchema>;
export type CuadrillaInput = z.infer<typeof cuadrillaSchema>;
