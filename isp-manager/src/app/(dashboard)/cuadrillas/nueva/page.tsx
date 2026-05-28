"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createCuadrilla } from "@/modules/cuadrillas/actions";
import { cuadrillaSchema } from "@/lib/validations";
import { ChevronLeft } from "lucide-react";

export default function NuevaCuadrillaPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    const parsed = cuadrillaSchema.safeParse(data);
    if (!parsed.success) { setError(parsed.error.errors[0].message); setLoading(false); return; }

    const result = await createCuadrilla(data);
    if (!result.success) { setError(result.error); setLoading(false); return; }

    router.push(`/cuadrillas/${result.data.id}`);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/cuadrillas" className="text-muted-foreground hover:text-foreground"><ChevronLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-semibold">Nueva cuadrilla</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Nombre <span className="text-destructive">*</span></label>
          <input name="nombre" required className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Descripción</label>
          <input name="descripcion" placeholder="Opcional" className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
        {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? "Guardando..." : "Crear cuadrilla"}
          </button>
          <Link href="/cuadrillas" className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
