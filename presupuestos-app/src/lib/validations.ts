import { z } from "zod";

export const ClienteSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  cuit: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
});
export type ClienteInput = z.infer<typeof ClienteSchema>;

export const ItemSchema = z.object({
  codigo: z.string().optional(),
  descripcion: z.string().min(1, "Descripción requerida"),
  precioUnitario: z.number().positive("Precio debe ser positivo"),
  unidad: z.string().default("unidad"),
  activo: z.boolean().default(true),
});
export type ItemInput = z.infer<typeof ItemSchema>;

export const CompanySchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  cuit: z.string().min(1, "CUIT requerido"),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});
export type CompanyInput = z.infer<typeof CompanySchema>;

export const PresupuestoItemSchema = z.object({
  itemId: z.string().optional(),
  descripcionCustom: z.string().optional(),
  cantidad: z.number().positive("Cantidad debe ser positiva"),
  precioUnitario: z.number().nonnegative("Precio debe ser >= 0"),
  orden: z.number().int().default(0),
});
export type PresupuestoItemInput = z.infer<typeof PresupuestoItemSchema>;

export const PresupuestoSchema = z.object({
  clienteId: z.string().min(1, "Cliente requerido"),
  validezDias: z.number().int().refine((v) => [10, 15, 30].includes(v), "Validez debe ser 10, 15 o 30 días"),
  ivaPorcentaje: z.number().nonnegative().default(21),
  notas: z.string().optional(),
  items: z.array(PresupuestoItemSchema).min(1, "Debe tener al menos un ítem"),
});
export type PresupuestoInput = z.infer<typeof PresupuestoSchema>;

export const ImpuestoSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  porcentaje: z.number().min(0, "Porcentaje debe ser >= 0").max(100, "Porcentaje debe ser <= 100"),
  activo: z.boolean().default(true),
  esDefault: z.boolean().default(false),
});
export type ImpuestoInput = z.infer<typeof ImpuestoSchema>;

export const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});
