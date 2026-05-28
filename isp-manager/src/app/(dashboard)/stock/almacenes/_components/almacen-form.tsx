"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createAlmacen, updateAlmacen } from "@/modules/stock/actions";
import { ChevronLeft } from "lucide-react";

interface AlmacenData { id?: string; nombre?: string; ubicacion?: string | null; encargadoId?: string | null; }
interface Empleado { id: string; nombre: string; apellido: string; }

export default function AlmacenForm({ almacen, empleados }: { almacen?: AlmacenData; empleados: Empleado[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!almacen?.id;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null); setLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const result = isEdit ? await updateAlmacen(almacen!.id!, data) : await createAlmacen(data);
    if (!result.success) { setError(result.error); setLoading(false); return; }
    router.push(isEdit ? `/stock/almacenes/${almacen!.id}` : "/stock/almacenes");
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/stock/almacenes" className="text-muted-foreground hover:text-foreground"><ChevronLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-semibold">{isEdit ? "Editar almacén" : "Nuevo almacén"}</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Nombre <span className="text-destructive">*</span></label>
          <input name="nombre" required defaultValue={almacen?.nombre}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Ubicación</label>
          <input name="ubicacion" defaultValue={almacen?.ubicacion ?? ""} placeholder="Dirección o descripción"
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Encargado</label>
          <select name="encargadoId" defaultValue={almacen?.encargadoId ?? ""}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="">Sin encargado asignado</option>
            {empleados.map((e) => (
              <option key={e.id} value={e.id}>{e.apellido} {e.nombre}</option>
            ))}
          </select>
        </div>
        {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear almacén"}
          </button>
          <Link href="/stock/almacenes" className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
