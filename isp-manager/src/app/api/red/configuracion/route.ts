import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import type { Prisma } from "@/generated/prisma/client";

// Endpoint para que la herramienta de escritorio `vsol-config` (sin sesión de
// browser) reporte una configuración de equipo. Es la ÚNICA excepción a "API
// routes solo para NextAuth": el cliente es externo y se autentica con un bearer
// token de servicio (VSOL_REPORT_TOKEN). Registra quién configuró qué (auditoría).

export const runtime = "nodejs";

const schema = z.object({
  tecnicoEmail: z.string().email().optional(),
  tecnicoNombre: z.string().min(1).optional(),
  publicIdWispro: z.number().int().positive().optional(),
  serialOnu: z.string().min(1).optional(),
  marca: z.string().min(1).optional(),
  accion: z.string().min(1, "La acción es requerida"),
  parametros: z.record(z.unknown()).optional(),
  resultado: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // Auth por bearer token de servicio.
  const esperado = process.env.VSOL_REPORT_TOKEN;
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!esperado || !token || token !== esperado) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "JSON inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
  }
  const d = parsed.data;

  // Si el técnico envió su email y coincide con un empleado, lo enlazamos.
  let empleadoId: string | null = null;
  if (d.tecnicoEmail) {
    const emp = await db.empleado.findUnique({ where: { email: d.tecnicoEmail }, select: { id: true } });
    empleadoId = emp?.id ?? null;
  }

  const reg = await db.registroConfiguracion.create({
    data: {
      empleadoId,
      tecnicoNombre: d.tecnicoNombre ?? null,
      publicIdWispro: d.publicIdWispro ?? null,
      serialOnu: d.serialOnu ?? null,
      marca: d.marca ?? null,
      accion: d.accion,
      parametros: d.parametros ? (d.parametros as Prisma.InputJsonValue) : undefined,
      resultado: d.resultado ?? null,
      origen: "vsol-config",
    },
  });

  void logAudit({
    empleadoId: empleadoId ?? undefined,
    accion: "CONFIGURAR_ONU",
    modulo: "RED",
    entidadId: reg.id,
    entidadNombre: d.tecnicoNombre ?? d.serialOnu ?? d.accion,
    detalles: {
      publicIdWispro: d.publicIdWispro,
      serialOnu: d.serialOnu,
      marca: d.marca,
      resultado: d.resultado,
    },
  });

  return NextResponse.json({ success: true, data: { id: reg.id } }, { status: 201 });
}
