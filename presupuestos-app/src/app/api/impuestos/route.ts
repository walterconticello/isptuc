import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ImpuestoSchema } from "@/lib/validations";

export async function GET() {
  const impuestos = await prisma.impuesto.findMany({
    where: { activo: true },
    orderBy: { porcentaje: "asc" },
  });
  return NextResponse.json(impuestos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = ImpuestoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.esDefault) {
    await prisma.impuesto.updateMany({ data: { esDefault: false } });
  }

  const impuesto = await prisma.impuesto.create({ data: parsed.data });
  return NextResponse.json(impuesto, { status: 201 });
}
