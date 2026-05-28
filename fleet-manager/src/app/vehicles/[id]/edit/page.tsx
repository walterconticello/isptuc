"use client"

import { useActionState, use, useEffect, useState } from "react"
import { updateVehicle } from "@/modules/fleet/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/ui/link-button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"

type Vehicle = {
  id: string
  plateNumber: string
  brand: string
  model: string
  year: number
  type: string
  status: string
  currentOdometer: number
  notes: string | null
  crewId: string | null
}

type Crew = { id: string; name: string }

export default function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [crews, setCrews] = useState<Crew[]>([])

  const boundAction = updateVehicle.bind(null, id)
  const [state, action, pending] = useActionState(boundAction, null)

  useEffect(() => {
    fetch(`/api/vehicles/${id}`).then((r) => r.json()).then(setVehicle)
    fetch("/api/crews").then((r) => r.json()).then(setCrews)
  }, [id])

  if (!vehicle) {
    return <div className="text-muted-foreground text-sm p-4">Cargando...</div>
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <LinkButton href={`/vehicles/${id}`} variant="ghost" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </LinkButton>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Editar {vehicle.plateNumber}</h2>
          <p className="text-muted-foreground text-sm">Modificá los datos del vehículo</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del vehículo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {state.error}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Label htmlFor="plateNumber">Patente *</Label>
                <Input
                  id="plateNumber"
                  name="plateNumber"
                  defaultValue={vehicle.plateNumber}
                  required
                  className="uppercase"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="brand">Marca *</Label>
                <Input id="brand" name="brand" defaultValue={vehicle.brand} required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="model">Modelo *</Label>
                <Input id="model" name="model" defaultValue={vehicle.model} required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="year">Año *</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  defaultValue={vehicle.year}
                  min={1990}
                  max={2030}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="currentOdometer">Kilometraje actual</Label>
                <Input
                  id="currentOdometer"
                  name="currentOdometer"
                  type="number"
                  defaultValue={vehicle.currentOdometer}
                  min={0}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="type">Tipo *</Label>
                <select
                  id="type"
                  name="type"
                  required
                  defaultValue={vehicle.type}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="CAR">Auto</option>
                  <option value="TRUCK">Camión</option>
                  <option value="VAN">Utilitario</option>
                  <option value="MOTORCYCLE">Moto</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="status">Estado *</Label>
                <select
                  id="status"
                  name="status"
                  required
                  defaultValue={vehicle.status}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="MAINTENANCE">Mantenimiento</option>
                  <option value="INACTIVE">Inactivo</option>
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <Label htmlFor="crewId">Cuadrilla asignada</Label>
                <select
                  id="crewId"
                  name="crewId"
                  defaultValue={vehicle.crewId ?? ""}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Sin asignar</option>
                  {crews.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={vehicle.notes ?? ""}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando..." : "Guardar cambios"}
              </Button>
              <LinkButton href={`/vehicles/${id}`} variant="outline">Cancelar</LinkButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
