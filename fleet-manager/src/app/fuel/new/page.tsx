"use client"

import { useActionState, useEffect, useState, Suspense } from "react"
import { createFuelLog } from "@/modules/fuel/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/ui/link-button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import { useSearchParams } from "next/navigation"

type Vehicle = {
  id: string
  plateNumber: string
  brand: string
  model: string
  currentOdometer: number
}

function FuelLogForm() {
  const searchParams = useSearchParams()
  const preselectedVehicleId = searchParams.get("vehicleId") ?? ""

  const [state, action, pending] = useActionState(createFuelLog, null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [liters, setLiters] = useState("")
  const [totalCost, setTotalCost] = useState("")

  const litersNum = parseFloat(liters)
  const totalNum = parseFloat(totalCost)
  const pricePerLiter = litersNum > 0 && totalNum > 0 ? totalNum / litersNum : null

  useEffect(() => {
    fetch("/api/vehicles")
      .then((r) => r.json())
      .then(setVehicles)
  }, [])

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <LinkButton href="/fuel" variant="ghost" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </LinkButton>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Registrar carga de combustible</h2>
          <p className="text-muted-foreground text-sm">Ingresá los datos de la carga</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos de la carga</CardTitle>
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
                <Label htmlFor="vehicleId">Vehículo *</Label>
                <select
                  id="vehicleId"
                  name="vehicleId"
                  required
                  defaultValue={preselectedVehicleId}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Seleccionar vehículo...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} — {v.brand} {v.model} ({v.currentOdometer.toLocaleString("es-AR")} km)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="odometerReading">Kilometraje al cargar *</Label>
                <Input
                  id="odometerReading"
                  name="odometerReading"
                  type="number"
                  placeholder="85000"
                  min={0}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="liters">Litros cargados *</Label>
                <Input
                  id="liters"
                  name="liters"
                  type="number"
                  step="any"
                  placeholder="13.851"
                  min={0.001}
                  required
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="totalCost">Total del ticket *</Label>
                <Input
                  id="totalCost"
                  name="totalCost"
                  type="number"
                  step="any"
                  placeholder="30001.27"
                  min={0.01}
                  required
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                />
              </div>

              {pricePerLiter && (
                <div className="col-span-2 bg-muted/50 rounded-md px-3 py-2 text-sm flex items-center justify-between">
                  <span className="text-muted-foreground">Precio por litro calculado:</span>
                  <span className="font-bold text-foreground">
                    ${pricePerLiter.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / L
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="fuelType">Tipo de combustible *</Label>
                <select
                  id="fuelType"
                  name="fuelType"
                  required
                  defaultValue="GASOLINE"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="GASOLINE">Nafta</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="CNG">GNC</option>
                  <option value="PREMIUM">Super/Premium</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="loadedBy">Cargado por *</Label>
                <Input
                  id="loadedBy"
                  name="loadedBy"
                  placeholder="Nombre del responsable"
                  required
                />
              </div>

              <div className="col-span-2 space-y-1">
                <Label htmlFor="stationName">Estación / Lugar</Label>
                <Input id="stationName" name="stationName" placeholder="YPF Av. Corrientes" />
              </div>

              <div className="col-span-2 space-y-1">
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" name="notes" placeholder="Observaciones opcionales..." rows={2} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando..." : "Guardar carga"}
              </Button>
              <LinkButton href="/fuel" variant="outline">Cancelar</LinkButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function NewFuelLogPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground text-sm p-4">Cargando...</div>}>
      <FuelLogForm />
    </Suspense>
  )
}
