"use client";

import { useState } from "react";
import { asignarHerramienta } from "@/modules/stock/actions";

interface Props {
  herramientas: { id: string; nombre: string; unidad: string }[];
  empleados: { id: string; nombre: string; apellido: string }[];
}

export default function AsignarHerramientaForm({ herramientas, empleados }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null); setSuccess(false); setLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const result = await asignarHerramienta(data);
    if (!result.success) { setError(result.error); } else { setSuccess(true); (e.target as HTMLFormElement).reset(); }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-40">
        <label className="text-xs text-muted-foreground mb-1 block">Herramienta</label>
        <select name="productoId" required
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
          <option value="">Seleccioná...</option>
          {herramientas.map((h) => <option key={h.id} value={h.id}>{h.nombre}</option>)}
        </select>
      </div>
      <div className="flex-1 min-w-40">
        <label className="text-xs text-muted-foreground mb-1 block">Empleado</label>
        <select name="empleadoId" required
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
          <option value="">Seleccioná...</option>
          {empleados.map((e) => <option key={e.id} value={e.id}>{e.apellido} {e.nombre}</option>)}
        </select>
      </div>
      <div className="w-20">
        <label className="text-xs text-muted-foreground mb-1 block">Cant.</label>
        <input name="cantidad" type="number" min="1" defaultValue="1"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <button type="submit" disabled={loading}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 whitespace-nowrap">
        {loading ? "..." : "Asignar"}
      </button>
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
      {success && <p className="w-full text-sm text-green-600">✓ Herramienta asignada correctamente</p>}
    </form>
  );
}
