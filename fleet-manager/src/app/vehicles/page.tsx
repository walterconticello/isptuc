import { getVehicles } from "@/modules/fleet/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { vehicleTypeLabels, vehicleStatusLabels, vehicleStatusColors } from "@/lib/labels"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function VehiclesPage() {
  const vehicles = await getVehicles()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Vehículos</h2>
          <p className="text-muted-foreground text-sm">{vehicles.length} vehículos registrados</p>
        </div>
        <Link href="/vehicles/new" className={buttonVariants()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo vehículo
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground mb-4">No hay vehículos registrados.</p>
            <Link href="/vehicles/new" className={buttonVariants()}>Agregar el primero</Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((v) => (
            <Link key={v.id} href={`/vehicles/${v.id}`} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-bold">{v.plateNumber}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {v.brand} {v.model} · {v.year}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${vehicleStatusColors[v.status]}`}
                    >
                      {vehicleStatusLabels[v.status]}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tipo</span>
                    <span className="text-foreground font-medium">
                      {vehicleTypeLabels[v.type]}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Kilometraje</span>
                    <span className="text-foreground font-medium">
                      {v.currentOdometer.toLocaleString("es-AR")} km
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Cargas registradas</span>
                    <span className="text-foreground font-medium">{v._count.fuelLogs}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
