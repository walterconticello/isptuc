import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CompanySchema } from "@/lib/validations";

export async function GET() {
  const company = await prisma.company.findFirst();
  return NextResponse.json(company);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const parsed = CompanySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const existing = await prisma.company.findFirst();
  const company = existing
    ? await prisma.company.update({ where: { id: existing.id }, data: parsed.data })
    : await prisma.company.create({ data: parsed.data });
  return NextResponse.json(company);
}
