"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkPermission } from "@/lib/permissions";
import { Modulo } from "@/generated/prisma/enums";

export async function getAuditLogs({
  modulo,
  empleadoId,
  fechaDesde,
  fechaHasta,
  page = 1,
  pageSize = 50,
}: {
  modulo?: string;
  empleadoId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  pageSize?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "No autenticado" };
  const ok = await checkPermission(session.user.id, Modulo.ADMIN);
  if (!ok) return { success: false as const, error: "Sin permisos" };

  const where = {
    ...(modulo ? { modulo } : {}),
    ...(empleadoId ? { empleadoId } : {}),
    ...(fechaDesde || fechaHasta ? {
      createdAt: {
        ...(fechaDesde ? { gte: new Date(fechaDesde) } : {}),
        ...(fechaHasta ? { lte: new Date(fechaHasta + "T23:59:59") } : {}),
      },
    } : {}),
  };

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        empleado: { select: { nombre: true, apellido: true, rol: true } },
      },
    }),
    db.auditLog.count({ where }),
  ]);

  return { success: true as const, data: { logs, total, page, pageSize } };
}
