"use client"

import { useActionState } from "react"
import { createVehicle } from "@/modules/fleet/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/ui/link-button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"

export default function NewVehiclePage() {
  const [state, action, pending] = useActionState(createVehicle, null)

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <LinkButton href="/vehicles" variant="ghost" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </LinkButton>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nuevo vehículo</h2>
          <p className="text-muted-foreground text-sm">Completá los datos del vehículo</p>
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
                  placeholder="ABC123"
                  required
                  className="uppercase"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="brand">Marca *</Label>
                <Input id="brand" name="brand" placeholder="Toyota" required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="model">Modelo *</Label>
                <Input id="model" name="model" placeholder="Hilux" required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="year">Año *</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  placeholder="2022"
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
                  placeholder="50000"
                  min={0}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="type">Tipo *</Label>
                <select
                  id="type"
                  name="type"
                  required
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Seleccionar...</option>
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
                  defaultValue="ACTIVE"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="MAINTENANCE">Mantenimiento</option>
                  <option value="INACTIVE">Inactivo</option>
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" name="notes" placeholder="Observaciones opcionales..." rows={3} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando..." : "Guardar vehículo"}
              </Button>
              <LinkButton href="/vehicles" variant="outline">Cancelar</LinkButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
