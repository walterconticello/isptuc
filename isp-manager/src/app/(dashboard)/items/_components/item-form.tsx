"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createItem, updateItem } from "@/modules/items/actions";
import { ChevronLeft } from "lucide-react";

interface ItemData { id?: string; codigo?: string | null; descripcion?: string; precioUnitario?: number | string; unidad?: string; }

export default function ItemForm({ item }: { item?: ItemData }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!item?.id;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null); setLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const result = isEdit ? await updateItem(item!.id!, data) : await createItem(data);
    if (!result.success) { setError(result.error); setLoading(false); return; }
    router.push("/items");
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/items" className="text-muted-foreground hover:text-foreground"><ChevronLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-semibold">{isEdit ? "Editar item" : "Nuevo item"}</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Código" name="codigo" defaultValue={item?.codigo ?? ""} placeholder="Opcional" />
          <F label="Unidad" name="unidad" required defaultValue={item?.unidad} placeholder="Ej: hs, u, m" />
        </div>
        <F label="Descripción" name="descripcion" required defaultValue={item?.descripcion} />
        <F label="Precio unitario ($)" name="precioUnitario" type="number" step="0.01" required
          defaultValue={item?.precioUnitario ? String(item.precioUnitario) : ""} />
        {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear item"}
          </button>
          <Link href="/items" className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}

function F({ label, name, type = "text", step, required = false, defaultValue = "", placeholder = "" }:
  { label: string; name: string; type?: string; step?: string; required?: boolean; defaultValue?: string; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}{required && <span className="text-destructive ml-1">*</span>}</label>
      <input name={name} type={type} step={step} required={required} defaultValue={defaultValue} placeholder={placeholder}
        className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}
