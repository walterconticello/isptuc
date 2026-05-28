import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const crew = await prisma.crew.findUnique({ where: { id } })
  if (!crew) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(crew)
}
