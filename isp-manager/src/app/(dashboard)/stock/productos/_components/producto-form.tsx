"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProducto, updateProducto } from "@/modules/stock/actions";
import { CATEGORIA_LABEL } from "@/lib/labels";
import { CategoriaProducto } from "@/generated/prisma/client";
import { ChevronLeft } from "lucide-react";

interface ProductoData {
  id?: string;
  codigo?: string | null;
  nombre?: string;
  descripcion?: string | null;
  categoria?: string;
  unidad?: string;
  stockMinimo?: number;
  esHerramienta?: boolean;
  presentacion?: string | null;
  contenidoPorUnidad?: number | null;
}

export default function ProductoForm({ producto }: { producto?: ProductoData }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tienePresentacion, setTienePresentacion] = useState(
    !!producto?.presentacion || !!producto?.contenidoPorUnidad
  );
  const isEdit = !!producto?.id;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null); setLoading(true);
    const form = new FormData(e.currentTarget);
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
          <F label="Unidad de stock" name="unidad" required defaultValue={producto?.unidad}
            placeholder="Ej: u, m, kg, rollo" />
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
          <F label={`Stock mínimo (${producto?.unidad || "unidades"})`} name="stockMinimo"
            type="number" step="0.01" defaultValue={String(producto?.stockMinimo ?? 0)} />
        </div>

        {/* Presentación / empaque */}
        <div className="space-y-3 rounded-lg border border-dashed p-4">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input type="checkbox" checked={tienePresentacion}
              onChange={(e) => setTienePresentacion(e.target.checked)} className="rounded" />
            Viene en presentaciones (bobinas, rollos, cajas, etc.)
          </label>

          {tienePresentacion && (
            <div className="grid gap-4 sm:grid-cols-2">
              <F label="Nombre de la presentación" name="presentacion"
                defaultValue={producto?.presentacion ?? ""} placeholder="Ej: Bobina, Rollo, Caja" />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Contenido por presentación ({producto?.unidad || "unidades"})
                </label>
                <input name="contenidoPorUnidad" type="number" step="0.01" min="0.01"
                  defaultValue={producto?.contenidoPorUnidad ? String(producto.contenidoPorUnidad) : ""}
                  placeholder="Ej: 1000"
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
          )}

          {!tienePresentacion && (
            <>
              <input type="hidden" name="presentacion" value="" />
              <input type="hidden" name="contenidoPorUnidad" value="" />
            </>
          )}

          {tienePresentacion && producto?.presentacion && producto?.contenidoPorUnidad && (
            <p className="text-xs text-muted-foreground">
              Ejemplo: al cargar 3 {producto.presentacion.toLowerCase()}s de {producto.contenidoPorUnidad} {producto.unidad} → se suman {3 * producto.contenidoPorUnidad} {producto.unidad} al stock
            </p>
          )}
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
