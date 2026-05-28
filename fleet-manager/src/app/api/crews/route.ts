import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const crews = await prisma.crew.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(crews)
}
