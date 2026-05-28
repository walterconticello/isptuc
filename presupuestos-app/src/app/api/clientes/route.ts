import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ClienteSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const clientes = await prisma.cliente.findMany({
    where: q ? { nombre: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { nombre: "asc" },
    take: 20,
  });
  return NextResponse.json(clientes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = ClienteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const cliente = await prisma.cliente.create({ data: parsed.data });
  return NextResponse.json(cliente, { status: 201 });
}
