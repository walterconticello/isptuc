"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { checkPermission } from "@/lib/permissions";
import { z } from "zod";
import { Modulo } from "@/generated/prisma/client";

const empresaSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  cuit: z.string().min(1, "El CUIT es requerido"),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

export async function getEmpresa() {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "No autenticado" };
  const empresa = await db.empresa.findFirst();
  return { success: true as const, data: empresa };
}

export async function updateEmpresa(rawData: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "No autenticado" };
  const ok = await checkPermission(session.user.id, Modulo.ADMIN);
  if (!ok) return { success: false as const, error: "Sin permisos" };

  const parsed = empresaSchema.safeParse(rawData);
  if (!parsed.success) return { success: false as const, error: parsed.error.errors[0].message };

  const data = {
    nombre: parsed.data.nombre,
    cuit: parsed.data.cuit,
    direccion: parsed.data.direccion || null,
    telefono: parsed.data.telefono || null,
    email: parsed.data.email || null,
    logoUrl: parsed.data.logoUrl || null,
  };

  const empresa = await db.empresa.findFirst();
  if (empresa) {
    await db.empresa.update({ where: { id: empresa.id }, data });
  } else {
    await db.empresa.create({ data: { ...data, id: "empresa-principal" } });
  }

  void logAudit({ empleadoId: session.user.id, accion: "ACTUALIZAR_EMPRESA", modulo: "ADMIN", entidadNombre: parsed.data.nombre });
  revalidatePath("/admin/empresa");
  revalidatePath("/dashboard");
  return { success: true as const, data: undefined };
}
