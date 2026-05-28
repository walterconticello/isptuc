import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Fuel, TrendingUp, DollarSign } from "lucide-react"
import { vehicleStatusLabels, vehicleStatusColors, fuelTypeLabels } from "@/lib/labels"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

async function getDashboardData() {
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [vehicles, monthlyFuelLogs, recentFuelLogs] = await Promise.all([
    prisma.vehicle.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.fuelLog.aggregate({
      where: { date: { gte: firstOfMonth } },
      _sum: { totalCost: true, liters: true },
    }),
    prisma.fuelLog.findMany({
      take: 8,
      orderBy: { date: "desc" },
      include: { vehicle: { select: { plateNumber: true, brand: true, model: true } } },
    }),
  ])

  return { vehicles, monthlyFuelLogs, recentFuelLogs }
}

export default async function DashboardPage() {
  const { vehicles, monthlyFuelLogs, recentFuelLogs } = await getDashboardData()

  const totalVehicles = vehicles.reduce((sum, v) => sum + v._count.id, 0)
  const activeVehicles = vehicles.find((v) => v.status === "ACTIVE")?._count.id ?? 0
  const monthlyCost = monthlyFuelLogs._sum.totalCost ?? 0
  const monthlyLiters = monthlyFuelLogs._sum.liters ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground text-sm">Resumen general de la flota</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total vehículos
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalVehicles}</p>
            <p className="text-xs text-muted-foreground mt-1">{activeVehicles} activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Costo este mes
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${monthlyCost.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">combustible</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Litros este mes
            </CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {monthlyLiters.toLocaleString("es-AR", { maximumFractionDigits: 0 })} L
            </p>
            <p className="text-xs text-muted-foreground mt-1">total cargado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estado flota
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1 mt-1">
              {vehicles.map((v) => (
                <div key={v.status} className="flex justify-between text-xs">
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs font-medium ${vehicleStatusColors[v.status]}`}
                  >
                    {vehicleStatusLabels[v.status]}
                  </span>
                  <span className="font-semibold">{v._count.id}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Últimas cargas de combustible</CardTitle>
          <Link href="/fuel/new" className="text-sm text-primary hover:underline font-medium">
            + Registrar carga
          </Link>
        </CardHeader>
        <CardContent>
          {recentFuelLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay cargas registradas aún.{" "}
              <Link href="/fuel/new" className="text-primary hover:underline">
                Registrar la primera
              </Link>
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 pr-4 font-medium">Vehículo</th>
                    <th className="text-left py-2 pr-4 font-medium">Fecha</th>
                    <th className="text-right py-2 px-4 font-medium">Litros</th>
                    <th className="text-right py-2 px-4 font-medium">Costo</th>
                    <th className="text-right py-2 px-4 font-medium">Km/L</th>
                    <th className="text-left py-2 pl-4 font-medium">Cargó</th>
                  </tr>
                </thead>
                <tbody>
                  {recentFuelLogs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2 font-medium">
                        <Link
                          href={`/vehicles/${log.vehicleId}`}
                          className="hover:underline text-primary"
                        >
                          {log.vehicle.plateNumber}
                        </Link>
                        <span className="text-muted-foreground ml-1 text-xs">
                          {log.vehicle.brand} {log.vehicle.model}
                        </span>
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {formatDate(log.date, "dd MMM")}
                      </td>
                      <td className="py-2 px-4 text-right">{log.liters.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 3 })} L</td>
                      <td className="py-2 px-4 text-right">
                        ${log.totalCost.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-2 px-4 text-right">
                        {log.consumptionRate ? (
                          <span
                            className={
                              log.consumptionRate >= 10
                                ? "text-green-600 font-medium"
                                : log.consumptionRate >= 7
                                ? "text-yellow-600 font-medium"
                                : "text-red-600 font-medium"
                            }
                          >
                            {log.consumptionRate.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2 pl-4 text-muted-foreground">{log.loadedBy}</td>
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
