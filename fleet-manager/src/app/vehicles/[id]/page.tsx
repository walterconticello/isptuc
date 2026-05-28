import { getVehicle, deleteVehicle } from "@/modules/fleet/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/ui/link-button"
import { vehicleTypeLabels, vehicleStatusLabels, vehicleStatusColors, fuelTypeLabels } from "@/lib/labels"
import { ArrowLeft, Pencil, Trash2, Plus } from "lucide-react"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/utils"

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vehicle = await getVehicle(id)
  if (!vehicle) notFound()

  const logsWithConsumption = vehicle.fuelLogs.filter((l) => l.consumptionRate !== null)
  const avgConsumption =
    logsWithConsumption.length > 0
      ? logsWithConsumption.reduce((sum, l) => sum + l.consumptionRate!, 0) / logsWithConsumption.length
      : null

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LinkButton href="/vehicles" variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </LinkButton>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{vehicle.plateNumber}</h2>
            <p className="text-muted-foreground text-sm">
              {vehicle.brand} {vehicle.model} · {vehicle.year}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/vehicles/${id}/edit`} variant="outline" size="sm">
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Editar
          </LinkButton>
          <form
            action={async () => {
              "use server"
              await deleteVehicle(id)
            }}
          >
            <Button variant="destructive" size="sm" type="submit">
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Eliminar
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">
              Información general
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Estado</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${vehicleStatusColors[vehicle.status]}`}>
                {vehicleStatusLabels[vehicle.status]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo</span>
              <span className="font-medium">{vehicleTypeLabels[vehicle.type]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kilometraje actual</span>
              <span className="font-medium">{vehicle.currentOdometer.toLocaleString("es-AR")} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registrado</span>
              <span className="font-medium">{formatDate(vehicle.createdAt, "dd/MM/yyyy")}</span>
            </div>
            {vehicle.notes && (
              <p className="text-muted-foreground text-xs border-t pt-2 mt-2">{vehicle.notes}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">
              Estadísticas de combustible
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total de cargas</span>
              <span className="font-medium">{vehicle.fuelLogs.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Consumo promedio</span>
              <span className="font-medium">
                {avgConsumption ? `${avgConsumption.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} km/L` : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Último costo</span>
              <span className="font-medium">
                {vehicle.fuelLogs[0]
                  ? `$${vehicle.fuelLogs[0].totalCost.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`
                  : "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Historial de combustible</CardTitle>
          <LinkButton href={`/fuel/new?vehicleId=${id}`} size="sm">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Registrar carga
          </LinkButton>
        </CardHeader>
        <CardContent>
          {vehicle.fuelLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay cargas registradas para este vehículo.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left px-3 py-2 font-medium">Fecha</th>
                    <th className="text-right px-3 py-2 font-medium">Km</th>
                    <th className="text-right px-3 py-2 font-medium">Km recorridos</th>
                    <th className="text-right px-3 py-2 font-medium">Litros</th>
                    <th className="text-right px-3 py-2 font-medium">Costo</th>
                    <th className="text-right px-3 py-2 font-medium">Km/L</th>
                    <th className="text-left px-3 py-2 font-medium">Tipo</th>
                    <th className="text-left px-3 py-2 font-medium">Cargó</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicle.fuelLogs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-3 py-2">{formatDate(log.date)}</td>
                      <td className="px-3 py-2 text-right">{log.odometerReading.toLocaleString("es-AR")}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">
                        {log.kmSinceLast ? `+${log.kmSinceLast.toLocaleString("es-AR")}` : "—"}
                      </td>
                      <td className="px-3 py-2 text-right">{log.liters.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</td>
                      <td className="px-3 py-2 text-right">
                        ${log.totalCost.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {log.consumptionRate ? (
                          <span className={
                            log.consumptionRate >= 10 ? "text-green-600 font-medium" :
                            log.consumptionRate >= 7 ? "text-yellow-600 font-medium" :
                            "text-red-600 font-medium"
                          }>
                            {log.consumptionRate.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{fuelTypeLabels[log.fuelType]}</td>
                      <td className="px-3 py-2 text-muted-foreground">{log.loadedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
