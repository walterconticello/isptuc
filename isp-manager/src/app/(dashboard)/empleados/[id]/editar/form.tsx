"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateEmpleado } from "@/modules/empleados/actions";
import { editarEmpleadoSchema } from "@/lib/validations";
import { ROL_LABEL } from "@/lib/labels";
import { ChevronLeft } from "lucide-react";
import { Rol } from "@/generated/prisma/enums";

const ROLES = ["DUENO", "GERENTE", "ADMIN", "ADMINISTRATIVO", "TECNICO"] as const;

interface EmpleadoData {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  dni: string | null;
  telefono: string | null;
  rol: Rol;
}

export default function EditarEmpleadoForm({
  empleado,
  sessionUserId,
}: {
  empleado: EmpleadoData;
  sessionUserId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const esPropioUsuario = empleado.id === sessionUserId;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    const parsed = editarEmpleadoSchema.safeParse(data);
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      setLoading(false);
      return;
    }

    const result = await updateEmpleado(empleado.id, data);
    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(`/empleados/${empleado.id}`);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/empleados/${empleado.id}`} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold">Editar empleado</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" name="nombre" defaultValue={empleado.nombre} required />
          <Field label="Apellido" name="apellido" defaultValue={empleado.apellido} required />
        </div>
        <Field label="Email" name="email" type="email" defaultValue={empleado.email} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="DNI" name="dni" defaultValue={empleado.dni ?? ""} />
          <Field label="Teléfono" name="telefono" defaultValue={empleado.telefono ?? ""} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Rol <span className="text-destructive">*</span>
            {esPropioUsuario && (
              <span className="ml-2 text-xs text-muted-foreground">(no podés cambiar tu propio rol)</span>
            )}
          </label>
          <select
            name="rol"
            required
            defaultValue={empleado.rol}
            disabled={esPropioUsuario}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROL_LABEL[r]}</option>
            ))}
          </select>
          {esPropioUsuario && (
            <input type="hidden" name="rol" value={empleado.rol} />
          )}
        </div>

        <Field
          label="Nueva contraseña"
          name="password"
          type="password"
          placeholder="Dejar vacío para no cambiar"
        />

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
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
          <Link
            href={`/empleados/${empleado.id}`}
            className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label, name, type = "text", required = false, placeholder = "", defaultValue = "",
}: {
  label: string; name: string; type?: string; required?: boolean;
  placeholder?: string; defaultValue?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
