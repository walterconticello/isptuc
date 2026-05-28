import { getFuelLogs } from "@/modules/fuel/actions"
import { getVehicles } from "@/modules/fleet/actions"
import { Card, CardContent } from "@/components/ui/card"
import { LinkButton } from "@/components/ui/link-button"
import { fuelTypeLabels } from "@/lib/labels"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function FuelPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicleId?: string }>
}) {
  const { vehicleId } = await searchParams
  const [logs, vehicles] = await Promise.all([getFuelLogs(vehicleId), getVehicles()])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Combustible</h2>
          <p className="text-muted-foreground text-sm">{logs.length} registros</p>
        </div>
        <LinkButton href="/fuel/new">
          <Plus className="h-4 w-4 mr-2" />
          Registrar carga
        </LinkButton>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Link
          href="/fuel"
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !vehicleId
              ? "bg-primary text-primary-foreground border-primary"
              : "hover:bg-muted border-border"
          }`}
        >
          Todos
        </Link>
        {vehicles.map((v) => (
          <Link
            key={v.id}
            href={`/fuel?vehicleId=${v.id}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              vehicleId === v.id
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted border-border"
            }`}
          >
            {v.plateNumber}
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground mb-4">No hay cargas registradas.</p>
              <LinkButton href="/fuel/new">Registrar la primera</LinkButton>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left px-4 py-3 font-medium">Vehículo</th>
                    <th className="text-left px-4 py-3 font-medium">Fecha</th>
                    <th className="text-right px-4 py-3 font-medium">Km</th>
                    <th className="text-right px-4 py-3 font-medium">Km recorridos</th>
                    <th className="text-right px-4 py-3 font-medium">Litros</th>
                    <th className="text-right px-4 py-3 font-medium">$/L</th>
                    <th className="text-right px-4 py-3 font-medium">Total</th>
                    <th className="text-right px-4 py-3 font-medium">Km/L</th>
                    <th className="text-left px-4 py-3 font-medium">Tipo</th>
                    <th className="text-left px-4 py-3 font-medium">Cargó</th>
                    <th className="text-left px-4 py-3 font-medium">Estación</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-2.5">
                        <Link href={`/vehicles/${log.vehicleId}`} className="font-medium text-primary hover:underline">
                          {log.vehicle.plateNumber}
                        </Link>
                        <span className="text-muted-foreground ml-1 text-xs">
                          {log.vehicle.brand} {log.vehicle.model}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {formatDate(log.date)}
                      </td>
                      <td className="px-4 py-2.5 text-right">{log.odometerReading.toLocaleString("es-AR")}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">
                        {log.kmSinceLast ? `+${log.kmSinceLast.toLocaleString("es-AR")}` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right">{log.liters.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">${log.pricePerLiter.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2.5 text-right font-medium">
                        ${log.totalCost.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {log.consumptionRate ? (
                          <span className={
                            log.consumptionRate >= 10 ? "text-green-600 font-semibold" :
                            log.consumptionRate >= 7 ? "text-yellow-600 font-semibold" :
                            "text-red-600 font-semibold"
                          }>
                            {log.consumptionRate.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{fuelTypeLabels[log.fuelType]}</td>
                      <td className="px-4 py-2.5">{log.loadedBy}</td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{log.stationName ?? "—"}</td>
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
