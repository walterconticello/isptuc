"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createItem } from "@/modules/items/actions";

export interface ItemNuevo {
  id: string;
  descripcion: string;
  precioUnitario: number;
  unidad: string;
  codigo?: string | null;
}

interface Props {
  descripcionInicial: string;
  onClose: () => void;
  onCreado: (item: ItemNuevo) => void;
}

export default function CrearItemModal({ descripcionInicial, onClose, onCreado }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const result = await createItem(data);
    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }
    onCreado({
      id: result.data.id,
      descripcion: String(data.descripcion ?? ""),
      precioUnitario: Number(data.precioUnitario ?? 0),
      unidad: String(data.unidad ?? ""),
      codigo: (data.codigo as string) || null,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Nuevo ítem"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nuevo ítem</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Campo label="Descripción" name="descripcion" required defaultValue={descripcionInicial} autoFocus />
          <div className="grid gap-4 sm:grid-cols-3">
            <Campo label="Código" name="codigo" />
            <Campo label="Precio unit." name="precioUnitario" type="number" step="0.01" min="0" required defaultValue="0" />
            <Campo label="Unidad" name="unidad" required defaultValue="u" placeholder="u, m, hs..." />
          </div>
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Creando..." : "Crear ítem"}
            </button>
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Campo({
  label,
  name,
  type = "text",
  required = false,
  defaultValue = "",
  placeholder = "",
  step,
  min,
  autoFocus = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  step?: string;
  min?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        step={step}
        min={min}
        autoFocus={autoFocus}
        className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
