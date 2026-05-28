import { getCrews } from "@/modules/crews/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LinkButton } from "@/components/ui/link-button"
import { crewStatusLabels, crewStatusColors } from "@/lib/labels"
import Link from "next/link"
import { Plus, Users, Car } from "lucide-react"

export default async function CrewsPage() {
  const crews = await getCrews()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cuadrillas</h2>
          <p className="text-muted-foreground text-sm">{crews.length} cuadrillas registradas</p>
        </div>
        <LinkButton href="/crews/new">
          <Plus className="h-4 w-4 mr-2" />
          Nueva cuadrilla
        </LinkButton>
      </div>

      {crews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground mb-4">No hay cuadrillas registradas.</p>
            <LinkButton href="/crews/new">Crear la primera</LinkButton>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {crews.map((crew) => (
            <Link key={crew.id} href={`/crews/${crew.id}`} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold">{crew.name}</CardTitle>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${crewStatusColors[crew.status]}`}
                    >
                      {crewStatusLabels[crew.status]}
                    </span>
                  </div>
                  {crew.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {crew.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>{crew._count.members} miembros</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Car className="h-3.5 w-3.5" />
                    <span>{crew._count.vehicles} vehículos asignados</span>
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
