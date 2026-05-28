"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createCliente, updateCliente } from "@/modules/clientes/actions";
import { ChevronLeft } from "lucide-react";

interface ClienteData { id?: string; nombre?: string; cuit?: string | null; direccion?: string | null; telefono?: string | null; email?: string | null; }

export default function ClienteForm({ cliente }: { cliente?: ClienteData }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!cliente?.id;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null); setLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const result = isEdit ? await updateCliente(cliente!.id!, data) : await createCliente(data);
    if (!result.success) { setError(result.error); setLoading(false); return; }
    router.push("/clientes");
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/clientes" className="text-muted-foreground hover:text-foreground"><ChevronLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-semibold">{isEdit ? "Editar cliente" : "Nuevo cliente"}</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        <F label="Nombre" name="nombre" required defaultValue={cliente?.nombre} />
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="CUIT" name="cuit" defaultValue={cliente?.cuit ?? ""} placeholder="XX-XXXXXXXX-X" />
          <F label="Teléfono" name="telefono" defaultValue={cliente?.telefono ?? ""} />
        </div>
        <F label="Dirección" name="direccion" defaultValue={cliente?.direccion ?? ""} />
        <F label="Email" name="email" type="email" defaultValue={cliente?.email ?? ""} />
        {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear cliente"}
          </button>
          <Link href="/clientes" className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent">Cancelar</Link>
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
