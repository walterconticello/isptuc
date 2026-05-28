import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, plateNumber: true, brand: true, model: true, currentOdometer: true },
    orderBy: { plateNumber: "asc" },
  })
  return NextResponse.json(vehicles)
}
