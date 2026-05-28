"use client"

import { useActionState, use, useEffect, useState } from "react"
import { updateCrew } from "@/modules/crews/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/ui/link-button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"

type Crew = { id: string; name: string; description: string | null; status: string }

export default function EditCrewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [crew, setCrew] = useState<Crew | null>(null)
  const boundAction = updateCrew.bind(null, id)
  const [state, action, pending] = useActionState(boundAction, null)

  useEffect(() => {
    fetch(`/api/crews/${id}`).then((r) => r.json()).then(setCrew)
  }, [id])

  if (!crew) return <div className="text-muted-foreground text-sm p-4">Cargando...</div>

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <LinkButton href={`/crews/${id}`} variant="ghost" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </LinkButton>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Editar cuadrilla</h2>
          <p className="text-muted-foreground text-sm">{crew.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos de la cuadrilla</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {state.error}
              </p>
            )}
            <div className="space-y-1">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" name="name" defaultValue={crew.name} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" name="description" defaultValue={crew.description ?? ""} rows={2} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                name="status"
                defaultValue={crew.status}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ACTIVE">Activa</option>
                <option value="INACTIVE">Inactiva</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando..." : "Guardar cambios"}
              </Button>
              <LinkButton href={`/crews/${id}`} variant="outline">Cancelar</LinkButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
