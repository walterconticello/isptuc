"use client";

import { useState } from "react";
import { agregarMiembro } from "@/modules/cuadrillas/actions";
import { UserPlus } from "lucide-react";

interface Props {
  cuadrillaId: string;
  empleados: { id: string; nombre: string; apellido: string }[];
}

export default function AgregarMiembroForm({ cuadrillaId, empleados }: Props) {
  const [empleadoId, setEmpleadoId] = useState("");
  const [esJefe, setEsJefe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!empleadoId) return;
    setLoading(true);
    setError(null);

    const result = await agregarMiembro(cuadrillaId, empleadoId, esJefe);
    if (!result.success) {
      setError(result.error);
    } else {
      setEmpleadoId("");
      setEsJefe(false);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end">
      <div className="flex-1 min-w-36">
        <select
          value={empleadoId}
          onChange={(e) => setEmpleadoId(e.target.value)}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Agregar miembro...</option>
          {empleados.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.apellido} {emp.nombre}</option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-1.5 text-sm whitespace-nowrap">
        <input type="checkbox" checked={esJefe} onChange={(e) => setEsJefe(e.target.checked)} className="rounded" />
        Jefe de cuadrilla
      </label>
      <button
        type="submit"
        disabled={!empleadoId || loading}
        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        <UserPlus className="h-4 w-4" />
        Agregar
      </button>
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
    </form>
  );
}
