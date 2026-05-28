"use client"

import { useActionState, useState } from "react"
import { createCrew } from "@/modules/crews/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/ui/link-button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, X } from "lucide-react"

type Member = { name: string; role: string; phone: string }

export default function NewCrewPage() {
  const [state, action, pending] = useActionState(createCrew, null)
  const [members, setMembers] = useState<Member[]>([])
  const [newMember, setNewMember] = useState<Member>({ name: "", role: "", phone: "" })

  function addMember() {
    if (!newMember.name.trim()) return
    setMembers((prev) => [...prev, { ...newMember }])
    setNewMember({ name: "", role: "", phone: "" })
  }

  function removeMember(index: number) {
    setMembers((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <LinkButton href="/crews" variant="ghost" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </LinkButton>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nueva cuadrilla</h2>
          <p className="text-muted-foreground text-sm">Creá el equipo de trabajo</p>
        </div>
      </div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="members" value={JSON.stringify(members)} />

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {state.error}
          </p>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos de la cuadrilla</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" name="name" placeholder="Cuadrilla Norte" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Área de cobertura, tareas asignadas..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Miembros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {members.length > 0 && (
              <div className="space-y-2">
                {members.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2 text-sm"
                  >
                    <div>
                      <span className="font-medium">{m.name}</span>
                      {m.role && <span className="text-muted-foreground ml-2">· {m.role}</span>}
                      {m.phone && <span className="text-muted-foreground ml-2">· {m.phone}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMember(i)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-3 sm:col-span-1">
                <Input
                  placeholder="Nombre *"
                  value={newMember.name}
                  onChange={(e) => setNewMember((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <Input
                placeholder="Rol (chofer, ayudante...)"
                value={newMember.role}
                onChange={(e) => setNewMember((p) => ({ ...p, role: e.target.value }))}
              />
              <Input
                placeholder="Teléfono"
                value={newMember.phone}
                onChange={(e) => setNewMember((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addMember}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Agregar miembro
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando..." : "Crear cuadrilla"}
          </Button>
          <LinkButton href="/crews" variant="outline">Cancelar</LinkButton>
        </div>
      </form>
    </div>
  )
}
