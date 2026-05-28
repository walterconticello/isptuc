"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPresupuesto } from "@/modules/presupuestos/actions";
import { Plus, Trash2, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Cliente { id: string; nombre: string; cuit?: string | null; email?: string | null; telefono?: string | null; direccion?: string | null; }
interface Item { id: string; descripcion: string; precioUnitario: number | string; unidad: string; codigo?: string | null; }
interface Linea { id: string; itemServicioId?: string; descripcion: string; cantidad: number; precioUnitario: number; }

interface Props {
  clientes: Cliente[];
  items: Item[];
  ivaPorcentajeDefault: number;
}

let nextId = 1;
function uid() { return String(nextId++); }

export default function PresupuestoEditor({ clientes, items, ivaPorcentajeDefault }: Props) {
  const router = useRouter();
  const [clienteId, setClienteId] = useState("");
  const [validezDias, setValidezDias] = useState(15);
  const [ivaPorcentaje, setIvaPorcentaje] = useState(ivaPorcentajeDefault);
  const [notas, setNotas] = useState("");
  const [lineas, setLineas] = useState<Linea[]>([{ id: uid(), descripcion: "", cantidad: 1, precioUnitario: 0 }]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const subtotal = lineas.reduce((s, l) => s + l.cantidad * l.precioUnitario, 0);
  const ivaImporte = subtotal * (ivaPorcentaje / 100);
  const total = subtotal + ivaImporte;

  function addLinea() {
    setLineas((prev) => [...prev, { id: uid(), descripcion: "", cantidad: 1, precioUnitario: 0 }]);
  }

  function removeLinea(id: string) {
    setLineas((prev) => prev.filter((l) => l.id !== id));
  }

  function updateLinea(id: string, field: keyof Omit<Linea, "id">, value: string | number) {
    setLineas((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        if (field === "itemServicioId") {
          const item = items.find((i) => i.id === value);
          return item
            ? { ...l, itemServicioId: item.id, descripcion: item.descripcion, precioUnitario: Number(item.precioUnitario) }
            : { ...l, itemServicioId: undefined, descripcion: "", precioUnitario: 0 };
        }
        return { ...l, [field]: value };
      })
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!clienteId) { setError("Seleccioná un cliente"); return; }
    if (lineas.some((l) => !l.descripcion)) { setError("Completá la descripción de todos los ítems"); return; }
    setLoading(true);

    const data = {
      clienteId,
      validezDias,
      notas,
      ivaPorcentaje,
      lineas: lineas.map((l, i) => ({
        itemServicioId: l.itemServicioId,
        descripcionCustom: l.itemServicioId ? undefined : l.descripcion,
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario,
        orden: i + 1,
      })),
    };

    const result = await createPresupuesto(data);
    if (!result.success) { setError(result.error); setLoading(false); return; }
    router.push(`/presupuestos/${result.data.id}`);
  }

  const fmt = (n: number) => n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/presupuestos" className="text-muted-foreground hover:text-foreground"><ChevronLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-semibold">Nuevo presupuesto</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Encabezado */}
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Datos generales</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Cliente <span className="text-destructive">*</span></label>
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
                <option value="">Seleccioná un cliente</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Validez</label>
              <select value={validezDias} onChange={(e) => setValidezDias(Number(e.target.value))}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
                <option value={10}>10 días</option>
                <option value={15}>15 días</option>
                <option value={30}>30 días</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Notas / observaciones</label>
            <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2}
              placeholder="Condiciones de pago, notas adicionales..."
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
        </div>

        {/* Líneas */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b bg-muted/30 flex items-center justify-between">
            <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Ítems</h2>
            <button type="button" onClick={addLinea}
              className="flex items-center gap-1 text-xs text-primary hover:underline">
              <Plus className="h-3.5 w-3.5" /> Agregar ítem
            </button>
          </div>

          {/* Header tabla desktop */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 px-5 py-2 text-xs text-muted-foreground font-medium border-b bg-muted/20">
            <span>Descripción</span><span className="text-center">Cant.</span>
            <span className="text-right">Precio unit.</span><span className="text-right">Subtotal</span><span />
          </div>

          <div className="divide-y">
            {lineas.map((linea, idx) => (
              <div key={linea.id} className="p-4 md:px-5 md:py-3 space-y-3 md:space-y-0 md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:gap-3 md:items-center">
                {/* Descripción: select de item o texto libre */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground md:hidden">Ítem {idx + 1}</label>
                  <select
                    value={linea.itemServicioId ?? ""}
                    onChange={(e) => updateLinea(linea.id, "itemServicioId", e.target.value)}
                    className="w-full rounded-lg border bg-background px-2.5 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">— Descripción libre —</option>
                    {items.map((i) => <option key={i.id} value={i.id}>{i.descripcion}</option>)}
                  </select>
                  {!linea.itemServicioId && (
                    <input
                      value={linea.descripcion}
                      onChange={(e) => updateLinea(linea.id, "descripcion", e.target.value)}
                      placeholder="Descripción del ítem"
                      className="w-full rounded-lg border bg-background px-2.5 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                </div>

                {/* Cantidad */}
                <div className="grid grid-cols-3 gap-2 md:block">
                  <div>
                    <label className="text-xs text-muted-foreground md:hidden">Cantidad</label>
                    <input type="number" min="0.01" step="0.01" value={linea.cantidad}
                      onChange={(e) => updateLinea(linea.id, "cantidad", Number(e.target.value))}
                      className="w-full rounded-lg border bg-background px-2.5 py-2 text-sm text-center outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  {/* Precio */}
                  <div>
                    <label className="text-xs text-muted-foreground md:hidden">Precio</label>
                    <input type="number" min="0" step="0.01" value={linea.precioUnitario}
                      onChange={(e) => updateLinea(linea.id, "precioUnitario", Number(e.target.value))}
                      className="w-full rounded-lg border bg-background px-2.5 py-2 text-sm text-right outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  {/* Subtotal mobile */}
                  <div className="flex items-end justify-end md:hidden">
                    <span className="text-sm font-semibold">${fmt(linea.cantidad * linea.precioUnitario)}</span>
                  </div>
                </div>

                {/* Precio desktop */}
                <div className="hidden md:block">
                  <input type="number" min="0" step="0.01" value={linea.precioUnitario}
                    onChange={(e) => updateLinea(linea.id, "precioUnitario", Number(e.target.value))}
                    className="w-full rounded-lg border bg-background px-2.5 py-2 text-sm text-right outline-none focus:ring-2 focus:ring-ring" />
                </div>

                {/* Subtotal desktop */}
                <div className="hidden md:flex items-center justify-end">
                  <span className="text-sm font-semibold">${fmt(linea.cantidad * linea.precioUnitario)}</span>
                </div>

                {/* Eliminar */}
                <button type="button" onClick={() => removeLinea(linea.id)}
                  disabled={lineas.length === 1}
                  className="hidden md:flex items-center justify-center text-muted-foreground hover:text-destructive disabled:opacity-30">
                  <Trash2 className="h-4 w-4" />
                </button>
                {lineas.length > 1 && (
                  <button type="button" onClick={() => removeLinea(linea.id)}
                    className="md:hidden text-xs text-destructive hover:underline">
                    Eliminar ítem
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Totales */}
        <div className="rounded-lg border bg-card p-5 space-y-3">
          <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Totales</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${fmt(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">IVA</span>
                <select value={ivaPorcentaje} onChange={(e) => setIvaPorcentaje(Number(e.target.value))}
                  className="rounded border bg-background px-2 py-0.5 text-xs outline-none focus:ring-1 focus:ring-ring">
                  <option value={0}>0%</option>
                  <option value={10.5}>10.5%</option>
                  <option value={21}>21%</option>
                  <option value={27}>27%</option>
                </select>
              </div>
              <span className="font-medium">${fmt(ivaImporte)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
              <span>Total</span>
              <span>${fmt(total)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="flex-1 rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? "Guardando..." : "Crear presupuesto"}
          </button>
          <Link href="/presupuestos" className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-accent">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
