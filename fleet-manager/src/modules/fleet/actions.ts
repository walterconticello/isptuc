"use server"

import { prisma } from "@/lib/prisma"
import { VehicleStatus, VehicleType } from "@/generated/prisma/enums"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getVehicles(status?: VehicleStatus) {
  return prisma.vehicle.findMany({
    where: status ? { status } : undefined,
    include: { _count: { select: { fuelLogs: true } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function getVehicle(id: string) {
  return prisma.vehicle.findUnique({
    where: { id },
    include: {
      fuelLogs: {
        orderBy: { odometerReading: "desc" },
        take: 20,
      },
    },
  })
}

export async function createVehicle(_: unknown, formData: FormData) {
  const plateNumber = (formData.get("plateNumber") as string).trim().toUpperCase()

  const existing = await prisma.vehicle.findUnique({ where: { plateNumber } })
  if (existing) return { error: "Ya existe un vehículo con esa patente." }

  await prisma.vehicle.create({
    data: {
      plateNumber,
      brand: formData.get("brand") as string,
      model: formData.get("model") as string,
      year: parseInt(formData.get("year") as string),
      type: formData.get("type") as VehicleType,
      status: (formData.get("status") as VehicleStatus) ?? VehicleStatus.ACTIVE,
      currentOdometer: parseFloat(formData.get("currentOdometer") as string) || 0,
      notes: (formData.get("notes") as string) || null,
    },
  })

  revalidatePath("/vehicles")
  redirect("/vehicles")
}

export async function updateVehicle(id: string, _: unknown, formData: FormData) {
  const plateNumber = (formData.get("plateNumber") as string).trim().toUpperCase()

  const existing = await prisma.vehicle.findFirst({
    where: { plateNumber, NOT: { id } },
  })
  if (existing) return { error: "Ya existe otro vehículo con esa patente." }

  const crewId = (formData.get("crewId") as string) || null

  await prisma.vehicle.update({
    where: { id },
    data: {
      plateNumber,
      brand: formData.get("brand") as string,
      model: formData.get("model") as string,
      year: parseInt(formData.get("year") as string),
      type: formData.get("type") as VehicleType,
      status: formData.get("status") as VehicleStatus,
      currentOdometer: parseFloat(formData.get("currentOdometer") as string) || 0,
      notes: (formData.get("notes") as string) || null,
      crewId,
    },
  })

  revalidatePath("/vehicles")
  revalidatePath(`/vehicles/${id}`)
  redirect(`/vehicles/${id}`)
}

export async function deleteVehicle(id: string) {
  await prisma.vehicle.delete({ where: { id } })
  revalidatePath("/vehicles")
  redirect("/vehicles")
}
