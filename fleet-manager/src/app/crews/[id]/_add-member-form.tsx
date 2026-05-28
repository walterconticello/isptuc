"use client"

import { useActionState } from "react"
import { addCrewMember } from "@/modules/crews/actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function AddMemberForm({ crewId }: { crewId: string }) {
  const [state, action, pending] = useActionState(addCrewMember, null)
  return (
    <form action={action} className="space-y-2 border-t pt-3 mt-2">
      <input type="hidden" name="crewId" value={crewId} />
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <Input name="name" placeholder="Nombre *" className="h-7 text-xs" required />
        <Input name="role" placeholder="Rol" className="h-7 text-xs" />
      </div>
      <div className="flex gap-2">
        <Input name="phone" placeholder="Teléfono" className="h-7 text-xs" />
        <Button type="submit" size="sm" disabled={pending} className="h-7 text-xs shrink-0">
          <Plus className="h-3 w-3 mr-1" />
          Agregar
        </Button>
      </div>
    </form>
  )
}
