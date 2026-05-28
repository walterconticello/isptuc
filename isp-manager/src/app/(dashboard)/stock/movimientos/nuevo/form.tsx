"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registrarMovimiento } from "@/modules/stock/actions";
import { TIPO_MOVIMIENTO_LABEL } from "@/lib/labels";
import { TipoMovimiento } from "@/generated/prisma/client";
import { ChevronLeft } from "lucide-react";

interface Props {
  almacenes: { id: string; nombre: string }[];
  productos: { id: string; nombre: string; unidad: string }[];
  productoIdPreseleccionado?: string;
  almacenIdPreseleccionado?: string;
}

const TIPOS_DISPONIBLES = [
  TipoMovimiento.ENTRADA,
  TipoMovimiento.SALIDA,
  TipoMovimiento.AJUSTE,
  TipoMovimiento.TRANSFERENCIA,
] as const;

export default function NuevoMovimientoForm({ almacenes, productos, productoIdPreseleccionado, almacenIdPreseleccionado }: Props) {
  const router = useRouter();
  const [tipo, setTipo] = useState<TipoMovimiento>(TipoMovimiento.ENTRADA);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null); setLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const result = await registrarMovimiento(data);
    if (!result.success) { setError(result.error); setLoading(false); return; }
    router.push("/stock/movimientos");
  }

  const esTransferencia = tipo === TipoMovimiento.TRANSFERENCIA;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/stock/movimientos" className="text-muted-foreground hover:text-foreground"><ChevronLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-semibold">Nuevo movimiento de stock</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        {/* Tipo */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Tipo de movimiento <span className="text-destructive">*</span></label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TIPOS_DISPONIBLES.map((t) => (
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
          <select name="productoId" required defaultValue={productoIdPreseleccionado ?? ""}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="">Seleccioná un producto</option>
            {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre} ({p.unidad})</option>)}
          </select>
        </div>

        {/* Almacén origen */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            {esTransferencia ? "Almacén origen" : "Almacén"} <span className="text-destructive">*</span>
          </label>
          <select name="almacenId" required defaultValue={almacenIdPreseleccionado ?? ""}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="">Seleccioná un almacén</option>
            {almacenes.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </div>

        {/* Almacén destino (solo transferencia) */}
        {esTransferencia && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Almacén destino <span className="text-destructive">*</span></label>
            <select name="almacenDestinoId" required
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
              <option value="">Seleccioná el almacén destino</option>
              {almacenes.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
        )}

        {/* Cantidad */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Cantidad <span className="text-destructive">*</span></label>
          <input name="cantidad" type="number" min="1" required placeholder="0"
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>

        {/* Motivo */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Motivo / referencia</label>
          <input name="motivo" type="text" placeholder="Opcional"
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>

        {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? "Registrando..." : "Registrar movimiento"}
          </button>
          <Link href="/stock/movimientos" className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
