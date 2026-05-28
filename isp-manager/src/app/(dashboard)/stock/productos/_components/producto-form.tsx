"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProducto, updateProducto } from "@/modules/stock/actions";
import { CATEGORIA_LABEL } from "@/lib/labels";
import { CategoriaProducto } from "@/generated/prisma/client";
import { ChevronLeft } from "lucide-react";

interface ProductoData { id?: string; codigo?: string | null; nombre?: string; descripcion?: string | null; categoria?: string; unidad?: string; stockMinimo?: number; esHerramienta?: boolean; }

export default function ProductoForm({ producto }: { producto?: ProductoData }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!producto?.id;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null); setLoading(true);
    const form = new FormData(e.currentTarget);
    // Checkbox booleano
    if (!form.has("esHerramienta")) form.set("esHerramienta", "false");
    const data = Object.fromEntries(form.entries());
    const result = isEdit ? await updateProducto(producto!.id!, data) : await createProducto(data);
    if (!result.success) { setError(result.error); setLoading(false); return; }
    router.push(isEdit ? `/stock/productos/${producto!.id}` : "/stock/productos");
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/stock/productos" className="text-muted-foreground hover:text-foreground"><ChevronLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-semibold">{isEdit ? "Editar producto" : "Nuevo producto"}</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Código" name="codigo" defaultValue={producto?.codigo ?? ""} placeholder="Opcional" />
          <F label="Unidad" name="unidad" required defaultValue={producto?.unidad} placeholder="Ej: u, m, rollo" />
        </div>
        <F label="Nombre" name="nombre" required defaultValue={producto?.nombre} />
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Descripción</label>
          <textarea name="descripcion" rows={2} defaultValue={producto?.descripcion ?? ""}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Categoría <span className="text-destructive">*</span></label>
            <select name="categoria" required defaultValue={producto?.categoria ?? ""}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
              <option value="">Seleccioná...</option>
              {Object.values(CategoriaProducto).map((c) => (
                <option key={c} value={c}>{CATEGORIA_LABEL[c]}</option>
              ))}
            </select>
          </div>
          <F label="Stock mínimo" name="stockMinimo" type="number" defaultValue={String(producto?.stockMinimo ?? 0)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input name="esHerramienta" type="checkbox" defaultChecked={producto?.esHerramienta ?? false}
            value="true" className="rounded" />
          Es herramienta (se puede asignar a empleados)
        </label>
        {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
          </button>
          <Link href="/stock/productos" className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}

function F({ label, name, type = "text", required = false, defaultValue = "", placeholder = "" }:
  { label: string; name: string; type?: string; required?: boolean; defaultValue?: string; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}{required && <span className="text-destructive ml-1">*</span>}</label>
      <input name={name} type={type} required={required} defaultValue={defaultValue} placeholder={placeholder}
        className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}
