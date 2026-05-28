import { getCrew, deleteCrew, removeCrewMember, assignVehicleToCrew } from "@/modules/crews/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/ui/link-button"
import { crewStatusLabels, crewStatusColors, vehicleStatusLabels } from "@/lib/labels"
import { ArrowLeft, Pencil, Trash2, X, Car, Users } from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { AddMemberForm } from "./_add-member-form"

export default async function CrewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const crew = await getCrew(id)
  if (!crew) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LinkButton href="/crews" variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </LinkButton>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{crew.name}</h2>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${crewStatusColors[crew.status]}`}>
              {crewStatusLabels[crew.status]}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/crews/${id}/edit`} variant="outline" size="sm">
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Editar
          </LinkButton>
          <form action={async () => { "use server"; await deleteCrew(id) }}>
            <Button variant="destructive" size="sm" type="submit">
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Eliminar
            </Button>
          </form>
        </div>
      </div>

      {crew.description && (
        <p className="text-sm text-muted-foreground">{crew.description}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Miembros ({crew.members.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {crew.members.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin miembros aún.</p>
            ) : (
              crew.members.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{m.name}</span>
                    {m.role && <span className="text-muted-foreground ml-1.5 text-xs">· {m.role}</span>}
                    {m.phone && <span className="text-muted-foreground ml-1.5 text-xs">· {m.phone}</span>}
                  </div>
                  <form action={async () => { "use server"; await removeCrewMember(m.id, id) }}>
                    <button type="submit" className="text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              ))
            )}
            <AddMemberForm crewId={id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="h-4 w-4" /> Vehículos asignados ({crew.vehicles.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {crew.vehicles.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin vehículos asignados.</p>
            ) : (
              crew.vehicles.map((v) => (
                <div key={v.id} className="flex items-center justify-between text-sm">
                  <Link href={`/vehicles/${v.id}`} className="hover:underline text-primary font-medium">
                    {v.plateNumber}
                  </Link>
                  <span className="text-muted-foreground text-xs">{v.brand} {v.model}</span>
                  <form action={async () => { "use server"; await assignVehicleToCrew(v.id, null) }}>
                    <button type="submit" className="text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
