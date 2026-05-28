import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ImpuestoSchema } from "@/lib/validations";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const parsed = ImpuestoSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.esDefault) {
    await prisma.impuesto.updateMany({ where: { id: { not: id } }, data: { esDefault: false } });
  }

  const impuesto = await prisma.impuesto.update({ where: { id }, data: parsed.data });
  return NextResponse.json(impuesto);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.impuesto.update({ where: { id }, data: { activo: false } });
  return new NextResponse(null, { status: 204 });
}
