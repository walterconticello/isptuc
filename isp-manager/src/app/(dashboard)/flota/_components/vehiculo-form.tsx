"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createVehiculo, updateVehiculo } from "@/modules/flota/actions";
import { vehiculoSchema } from "@/lib/validations";
import { TIPO_VEHICULO_LABEL, ESTADO_VEHICULO_LABEL } from "@/lib/labels";
import { ChevronLeft } from "lucide-react";
import { TipoVehiculo, EstadoVehiculo } from "@/generated/prisma/enums";

interface VehiculoData {
  id?: string;
  patente?: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  tipo?: TipoVehiculo;
  estado?: EstadoVehiculo;
  odometroActual?: number;
  cuadrillaId?: string | null;
  notas?: string | null;
}

interface Props {
  vehiculo?: VehiculoData;
  cuadrillas: { id: string; nombre: string }[];
}

export default function VehiculoForm({ vehiculo, cuadrillas }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!vehiculo?.id;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    const parsed = vehiculoSchema.safeParse(data);
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      setLoading(false);
      return;
    }

    const result = isEdit
      ? await updateVehiculo(vehiculo!.id!, data)
      : await createVehiculo(data);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(isEdit ? `/flota/${vehiculo!.id}` : "/flota");
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href={isEdit ? `/flota/${vehiculo?.id}` : "/flota"} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold">{isEdit ? "Editar vehículo" : "Nuevo vehículo"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Patente" name="patente" required defaultValue={vehiculo?.patente} placeholder="Ej: AA123BB" />
          <Field label="Año" name="anio" type="number" required defaultValue={String(vehiculo?.anio ?? new Date().getFullYear())} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Marca" name="marca" required defaultValue={vehiculo?.marca} />
          <Field label="Modelo" name="modelo" required defaultValue={vehiculo?.modelo} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Tipo" name="tipo" required defaultValue={vehiculo?.tipo}>
            {Object.values(TipoVehiculo).map((t) => (
              <option key={t} value={t}>{TIPO_VEHICULO_LABEL[t]}</option>
            ))}
          </SelectField>
          <SelectField label="Estado" name="estado" required defaultValue={vehiculo?.estado ?? "ACTIVO"}>
            {Object.values(EstadoVehiculo).map((e) => (
              <option key={e} value={e}>{ESTADO_VEHICULO_LABEL[e]}</option>
            ))}
          </SelectField>
        </div>

        <Field
          label="Odómetro actual (km)"
          name="odometroActual"
          type="number"
          defaultValue={String(vehiculo?.odometroActual ?? 0)}
        />

        <SelectField label="Cuadrilla asignada" name="cuadrillaId" defaultValue={vehiculo?.cuadrillaId ?? ""}>
          <option value="">Sin cuadrilla</option>
          {cuadrillas.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </SelectField>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Notas</label>
          <textarea
            name="notas"
            rows={2}
            defaultValue={vehiculo?.notas ?? ""}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear vehículo"}
          </button>
          <Link href={isEdit ? `/flota/${vehiculo?.id}` : "/flota"}
            className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, type = "text", required = false, defaultValue = "", placeholder = "" }:
  { label: string; name: string; type?: string; required?: boolean; defaultValue?: string; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label} {required && <span className="text-destructive">*</span>}</label>
      <input name={name} type={type} required={required} defaultValue={defaultValue} placeholder={placeholder}
        className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}

function SelectField({ label, name, required = false, defaultValue = "", children }:
  { label: string; name: string; required?: boolean; defaultValue?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label} {required && <span className="text-destructive">*</span>}</label>
      <select name={name} required={required} defaultValue={defaultValue}
        className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
        {children}
      </select>
    </div>
  );
}
