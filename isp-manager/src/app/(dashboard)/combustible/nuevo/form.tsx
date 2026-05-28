"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createRegistroCombustible } from "@/modules/combustible/actions";
import { combustibleSchema } from "@/lib/validations";
import { TIPO_COMBUSTIBLE_LABEL } from "@/lib/labels";
import { TipoCombustible } from "@/generated/prisma/client";
import { ChevronLeft } from "lucide-react";
import { format } from "date-fns";

interface Props {
  vehiculos: { id: string; patente: string; marca: string; modelo: string }[];
  empleados: { id: string; nombre: string; apellido: string }[];
  vehiculoIdPreseleccionado?: string;
  sessionEmpleadoId: string;
}

export default function NuevaCargaForm({ vehiculos, empleados, vehiculoIdPreseleccionado, sessionEmpleadoId }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [litros, setLitros] = useState("");
  const [precio, setPrecio] = useState("");
  const total = litros && precio ? (parseFloat(litros) * parseFloat(precio)).toFixed(2) : "—";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    const parsed = combustibleSchema.safeParse(data);
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      setLoading(false);
      return;
    }

    const result = await createRegistroCombustible(data);
    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/combustible");
  }

  const hoy = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/combustible" className="text-muted-foreground hover:text-foreground"><ChevronLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-semibold">Nueva carga de combustible</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        {/* Vehículo */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Vehículo <span className="text-destructive">*</span></label>
          <select name="vehiculoId" required defaultValue={vehiculoIdPreseleccionado ?? ""}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="">Seleccioná un vehículo</option>
            {vehiculos.map((v) => (
              <option key={v.id} value={v.id}>{v.patente} — {v.marca} {v.modelo}</option>
            ))}
          </select>
        </div>

        {/* Empleado */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Cargó <span className="text-destructive">*</span></label>
          <select name="empleadoId" required defaultValue={sessionEmpleadoId}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="">Seleccioná un empleado</option>
            {empleados.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.apellido} {emp.nombre}</option>
            ))}
          </select>
        </div>

        {/* Fecha + tipo */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Fecha <span className="text-destructive">*</span></label>
            <input name="fecha" type="date" required defaultValue={hoy}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tipo <span className="text-destructive">*</span></label>
            <select name="tipoCombustible" required defaultValue="NAFTA"
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
              {Object.values(TipoCombustible).map((t) => (
                <option key={t} value={t}>{TIPO_COMBUSTIBLE_LABEL[t]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Litros + precio */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Litros <span className="text-destructive">*</span></label>
            <input name="litros" type="number" step="0.001" required placeholder="0.000"
              value={litros} onChange={(e) => setLitros(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Precio / litro <span className="text-destructive">*</span></label>
            <input name="precioPorLitro" type="number" step="0.01" required placeholder="0.00"
              value={precio} onChange={(e) => setPrecio(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        {/* Total calculado */}
        {total !== "—" && (
          <div className="rounded-lg bg-muted/50 px-4 py-2.5 flex justify-between text-sm">
            <span className="text-muted-foreground">Total calculado</span>
            <span className="font-semibold">${parseFloat(total).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
          </div>
        )}

        {/* Odómetro + estación */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Odómetro (km) <span className="text-destructive">*</span></label>
            <input name="odometro" type="number" required placeholder="0"
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Estación</label>
            <input name="estacion" type="text" placeholder="Opcional"
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Notas</label>
          <input name="notas" type="text" placeholder="Opcional"
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? "Guardando..." : "Registrar carga"}
          </button>
          <Link href="/combustible" className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
