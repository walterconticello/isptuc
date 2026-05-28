import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ItemSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const items = await prisma.item.findMany({
    where: {
      activo: true,
      ...(q ? { descripcion: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { descripcion: "asc" },
    take: 20,
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = ItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const item = await prisma.item.create({ data: parsed.data });
  return NextResponse.json(item, { status: 201 });
}
