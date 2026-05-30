"use client";

import { useState } from "react";
import { updateEmpresa } from "@/modules/admin/empresa-actions";
import { Check } from "lucide-react";

interface EmpresaData {
  nombre?: string;
  cuit?: string;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  logoUrl?: string | null;
}

export default function EmpresaForm({ empresa }: { empresa?: EmpresaData | null }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [guardado, setGuardado] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null); setGuardado(false); setLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const result = await updateEmpresa(data);
    if (!result.success) { setError(result.error); } else { setGuardado(true); }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
      {/* Logo preview */}
      {empresa?.logoUrl && (
        <div className="flex items-center gap-3 pb-2 border-b">
          {/* logoUrl es una URL pública arbitraria del usuario: next/image exigiría whitelistear
              dominios en next.config y rompería con hosts no listados. Mantenemos <img>. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={empresa.logoUrl} alt="Logo empresa" className="h-12 w-auto object-contain rounded" />
          <span className="text-sm text-muted-foreground">Logo actual</span>
        </div>
      )}

      <F label="Nombre de la empresa" name="nombre" required defaultValue={empresa?.nombre} />
      <F label="CUIT" name="cuit" required defaultValue={empresa?.cuit} placeholder="XX-XXXXXXXX-X" />

      <div className="grid gap-4 sm:grid-cols-2">
        <F label="Teléfono" name="telefono" defaultValue={empresa?.telefono ?? ""} />
        <F label="Email" name="email" type="email" defaultValue={empresa?.email ?? ""} />
      </div>

      <F label="Dirección" name="direccion" defaultValue={empresa?.direccion ?? ""} />
      <F label="URL del logo" name="logoUrl" defaultValue={empresa?.logoUrl ?? ""}
        placeholder="https://... (imagen pública)" />

      <p className="text-xs text-muted-foreground">
        El nombre y CUIT aparecen en el encabezado de los presupuestos.
      </p>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>
      )}
      {guardado && (
        <div className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20 px-3 py-2.5 text-sm text-green-700 dark:text-green-400">
          <Check className="h-4 w-4" /> Datos guardados correctamente
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
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
