"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registrarMovimiento } from "@/modules/stock/actions";
import { TIPO_MOVIMIENTO_LABEL } from "@/lib/labels";
import { TipoMovimiento } from "@/generated/prisma/client";
import { ChevronLeft, Package } from "lucide-react";

interface Producto {
  id: string;
  nombre: string;
  unidad: string;
  presentacion?: string | null;
  contenidoPorUnidad?: number | null;
}

interface Props {
  almacenes: { id: string; nombre: string }[];
  productos: Producto[];
  productoIdPreseleccionado?: string;
  almacenIdPreseleccionado?: string;
}

const TIPOS = [
  TipoMovimiento.ENTRADA,
  TipoMovimiento.SALIDA,
  TipoMovimiento.AJUSTE,
  TipoMovimiento.TRANSFERENCIA,
] as const;

export default function NuevoMovimientoForm({ almacenes, productos, productoIdPreseleccionado, almacenIdPreseleccionado }: Props) {
  const router = useRouter();
  const [tipo, setTipo] = useState<TipoMovimiento>(TipoMovimiento.ENTRADA);
  const [productoId, setProductoId] = useState(productoIdPreseleccionado ?? "");
  const [cantidadDirecta, setCantidadDirecta] = useState("");
  const [cantPresentaciones, setCantPresentaciones] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const producto = productos.find((p) => p.id === productoId);
  const tienePresentacion = !!(producto?.presentacion && producto?.contenidoPorUnidad);
  const mostrarHelper = tienePresentacion && tipo === TipoMovimiento.ENTRADA;

  const cantidadCalculada =
    tienePresentacion && cantPresentaciones
      ? (Number(cantPresentaciones) * producto!.contenidoPorUnidad!).toString()
      : cantidadDirecta;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null); setLoading(true);
    const form = new FormData(e.currentTarget);
    if (mostrarHelper && cantPresentaciones) form.set("cantidad", cantidadCalculada);
    const data = Object.fromEntries(form.entries());
    const result = await registrarMovimiento(data);
    if (!result.success) { setError(result.error); setLoading(false); return; }
    router.push("/stock/movimientos");
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/stock/movimientos" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold">Nuevo movimiento</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        {/* Tipo */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Tipo <span className="text-destructive">*</span></label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TIPOS.map((t) => (
              <button key={t} type="button" onClick={() => setTipo(t)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  tipo === t ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"
                }`}>
                {TIPO_MOVIMIENTO_LABEL[t]}
              </button>
            ))}
          </div>
          <input type="hidden" name="tipo" value={tipo} />
        </div>

        {/* Producto */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Producto <span className="text-destructive">*</span></label>
          <select name="productoId" required value={productoId}
            onChange={(e) => { setProductoId(e.target.value); setCantPresentaciones(""); setCantidadDirecta(""); }}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="">Seleccioná un producto</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} ({p.unidad})
                {p.presentacion ? ` — ${p.presentacion} ${p.contenidoPorUnidad}${p.unidad}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Helper de presentaciones — solo en ENTRADA */}
        {mostrarHelper && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
            <p className="text-xs font-medium text-primary flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              Entrada rápida por {producto!.presentacion!.toLowerCase()}
            </p>
            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">
                  Cantidad de {producto!.presentacion!.toLowerCase()}s
                </label>
                <input type="number" min="1" step="1" value={cantPresentaciones}
                  onChange={(e) => { setCantPresentaciones(e.target.value); setCantidadDirecta(""); }}
                  placeholder="Ej: 2"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Total en {producto!.unidad}</label>
                <div className="rounded-lg border bg-muted/50 px-3 py-2 text-sm font-semibold">
                  {cantPresentaciones
                    ? `${Number(cantPresentaciones) * producto!.contenidoPorUnidad!} ${producto!.unidad}`
                    : `— ${producto!.unidad}`}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              O ingresá los {producto!.unidad} directamente en el campo de abajo ↓
            </p>
          </div>
        )}

        {/* Almacén */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            {tipo === TipoMovimiento.TRANSFERENCIA ? "Almacén origen" : "Almacén"}{" "}
            <span className="text-destructive">*</span>
          </label>
          <select name="almacenId" required defaultValue={almacenIdPreseleccionado ?? ""}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="">Seleccioná un almacén</option>
            {almacenes.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </div>

        {tipo === TipoMovimiento.TRANSFERENCIA && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Almacén destino <span className="text-destructive">*</span></label>
            <select name="almacenDestinoId" required
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
              <option value="">Seleccioná el almacén destino</option>
              {almacenes.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
        )}

        {/* Cantidad en unidad base */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Cantidad{producto?.unidad ? ` (${producto.unidad})` : ""} <span className="text-destructive">*</span>
          </label>
          <input name="cantidad" type="number" step="0.01" min="0.01" required
            value={mostrarHelper && cantPresentaciones ? cantidadCalculada : cantidadDirecta}
            onChange={(e) => { setCantidadDirecta(e.target.value); setCantPresentaciones(""); }}
            placeholder={producto?.unidad ? `0 ${producto.unidad}` : "0"}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          {tienePresentacion && (
            <p className="text-xs text-muted-foreground">
              1 {producto!.presentacion!.toLowerCase()} = {producto!.contenidoPorUnidad} {producto!.unidad}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Motivo / referencia</label>
          <input name="motivo" type="text" placeholder="Opcional"
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? "Registrando..." : "Registrar movimiento"}
          </button>
          <Link href="/stock/movimientos" className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
