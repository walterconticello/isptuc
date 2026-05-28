"use server"

import { prisma } from "@/lib/prisma"
import { FuelType } from "@/generated/prisma/enums"
import { parseDateInput } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getFuelLogs(vehicleId?: string) {
  return prisma.fuelLog.findMany({
    where: vehicleId ? { vehicleId } : undefined,
    include: { vehicle: { select: { plateNumber: true, brand: true, model: true } } },
    orderBy: { date: "desc" },
    take: 100,
  })
}

export async function createFuelLog(_: unknown, formData: FormData) {
  const vehicleId = formData.get("vehicleId") as string
  const odometerReading = parseFloat(formData.get("odometerReading") as string)
  const liters = parseFloat(formData.get("liters") as string)
  const totalCost = parseFloat(formData.get("totalCost") as string)

  if (!vehicleId || isNaN(odometerReading) || isNaN(liters) || isNaN(totalCost)) {
    return { error: "Todos los campos numéricos son requeridos." }
  }

  if (liters <= 0) {
    return { error: "La cantidad de litros debe ser mayor a cero." }
  }

  const pricePerLiter = totalCost / liters

  // Find surrounding logs by odometer (supports backdated entries)
  const [prevLog, nextLog, duplicateLog] = await Promise.all([
    prisma.fuelLog.findFirst({
      where: { vehicleId, odometerReading: { lt: odometerReading } },
      orderBy: { odometerReading: "desc" },
    }),
    prisma.fuelLog.findFirst({
      where: { vehicleId, odometerReading: { gt: odometerReading } },
      orderBy: { odometerReading: "asc" },
    }),
    prisma.fuelLog.findFirst({
      where: { vehicleId, odometerReading },
    }),
  ])

  if (duplicateLog) {
    return { error: `Ya existe una carga con el kilometraje ${odometerReading} km.` }
  }

  const kmSinceLast = prevLog ? odometerReading - prevLog.odometerReading : null
  const consumptionRate = kmSinceLast && liters > 0 ? kmSinceLast / liters : null

  await prisma.$transaction(async (tx) => {
    await tx.fuelLog.create({
      data: {
        vehicleId,
        date: parseDateInput(formData.get("date") as string),
        liters,
        pricePerLiter,
        totalCost,
        odometerReading,
        kmSinceLast,
        consumptionRate,
        fuelType: formData.get("fuelType") as FuelType,
        stationName: (formData.get("stationName") as string) || null,
        loadedBy: formData.get("loadedBy") as string,
        notes: (formData.get("notes") as string) || null,
      },
    })

    // Recalculate the next entry's km/consumption since it now has a new predecessor
    if (nextLog) {
      const newKmSinceLast = nextLog.odometerReading - odometerReading
      await tx.fuelLog.update({
        where: { id: nextLog.id },
        data: {
          kmSinceLast: newKmSinceLast,
          consumptionRate: nextLog.liters > 0 ? newKmSinceLast / nextLog.liters : null,
        },
      })
    }

    // Only update currentOdometer if this is the latest entry
    if (!nextLog) {
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { currentOdometer: odometerReading },
      })
    }
  })

  revalidatePath("/fuel")
  revalidatePath("/vehicles")
  revalidatePath("/")
  redirect("/fuel")
}

export async function deleteFuelLog(id: string) {
  await prisma.fuelLog.delete({ where: { id } })
  revalidatePath("/fuel")
  revalidatePath("/")
}
