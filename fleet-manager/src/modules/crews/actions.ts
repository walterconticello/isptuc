"use server"

import { prisma } from "@/lib/prisma"
import { CrewStatus } from "@/generated/prisma/enums"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getCrews() {
  return prisma.crew.findMany({
    include: {
      _count: { select: { members: true, vehicles: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getCrew(id: string) {
  return prisma.crew.findUnique({
    where: { id },
    include: {
      members: { orderBy: { name: "asc" } },
      vehicles: {
        select: { id: true, plateNumber: true, brand: true, model: true, status: true },
      },
    },
  })
}

export async function createCrew(_: unknown, formData: FormData) {
  const name = (formData.get("name") as string).trim()
  if (!name) return { error: "El nombre de la cuadrilla es requerido." }

  const crew = await prisma.crew.create({
    data: {
      name,
      description: (formData.get("description") as string) || null,
      status: CrewStatus.ACTIVE,
    },
  })

  // Add members if provided
  const membersRaw = formData.get("members") as string
  if (membersRaw) {
    const members = JSON.parse(membersRaw) as Array<{ name: string; role?: string; phone?: string }>
    if (members.length > 0) {
      await prisma.crewMember.createMany({
        data: members.map((m) => ({ ...m, crewId: crew.id })),
      })
    }
  }

  revalidatePath("/crews")
  redirect("/crews")
}

export async function updateCrew(id: string, _: unknown, formData: FormData) {
  const name = (formData.get("name") as string).trim()
  if (!name) return { error: "El nombre de la cuadrilla es requerido." }

  await prisma.crew.update({
    where: { id },
    data: {
      name,
      description: (formData.get("description") as string) || null,
      status: formData.get("status") as CrewStatus,
    },
  })

  revalidatePath("/crews")
  revalidatePath(`/crews/${id}`)
  redirect(`/crews/${id}`)
}

export async function deleteCrew(id: string) {
  // Unassign all vehicles from this crew first
  await prisma.vehicle.updateMany({ where: { crewId: id }, data: { crewId: null } })
  await prisma.crew.delete({ where: { id } })
  revalidatePath("/crews")
  redirect("/crews")
}

export async function addCrewMember(_: unknown, formData: FormData) {
  const crewId = formData.get("crewId") as string
  const name = (formData.get("name") as string).trim()
  if (!name) return { error: "El nombre es requerido." }

  await prisma.crewMember.create({
    data: {
      crewId,
      name,
      role: (formData.get("role") as string) || null,
      phone: (formData.get("phone") as string) || null,
    },
  })

  revalidatePath(`/crews/${crewId}`)
  return { success: true }
}

export async function removeCrewMember(memberId: string, crewId: string) {
  await prisma.crewMember.delete({ where: { id: memberId } })
  revalidatePath(`/crews/${crewId}`)
}

export async function assignVehicleToCrew(vehicleId: string, crewId: string | null) {
  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { crewId },
  })
  revalidatePath("/crews")
  revalidatePath("/vehicles")
  revalidatePath(`/vehicles/${vehicleId}`)
  if (crewId) revalidatePath(`/crews/${crewId}`)
}
