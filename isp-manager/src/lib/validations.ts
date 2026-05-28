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

export type CrearEmpleadoInput = z.infer<typeof crearEmpleadoSchema>;
export type EditarEmpleadoInput = z.infer<typeof editarEmpleadoSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
