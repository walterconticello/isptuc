"use client";

import { useTransition } from "react";
import { togglePermiso } from "@/modules/admin/actions";
import { Modulo, Rol } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

interface Props {
  matrix: Record<Rol, Record<Modulo, boolean>>;
  roles: Rol[];
  modulos: Modulo[];
  rolesLabel: Record<Rol, string>;
  modulosLabel: Record<Modulo, string>;
}

export default function PermisosTable({ matrix, roles, modulos, rolesLabel, modulosLabel }: Props) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b bg-muted/50">
          <th className="px-4 py-3 text-left font-medium">Módulo</th>
          {roles.map((rol) => (
            <th key={rol} className="px-3 py-3 text-center font-medium whitespace-nowrap">
              {rolesLabel[rol]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {modulos.map((modulo) => (
          <tr key={modulo} className="border-b last:border-0 hover:bg-muted/20">
            <td className="px-4 py-3 font-medium">{modulosLabel[modulo]}</td>
            {roles.map((rol) => (
              <td key={rol} className="px-3 py-3 text-center">
                <ToggleCell
                  rol={rol}
                  modulo={modulo}
                  value={matrix[rol][modulo]}
                  locked={rol === Rol.DUENO && modulo === Modulo.ADMIN}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ToggleCell({
  rol, modulo, value, locked,
}: {
  rol: Rol; modulo: Modulo; value: boolean; locked: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    if (locked) return;
    startTransition(() => {
      togglePermiso(rol, modulo);
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={locked || pending}
      title={locked ? "El Dueño siempre tiene acceso a Administración" : undefined}
      className={cn(
        "mx-auto flex h-6 w-11 items-center rounded-full transition-colors",
        value ? "bg-primary" : "bg-border",
        locked ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:opacity-80",
        pending && "opacity-60"
      )}
    >
      <span
        className={cn(
          "block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          value ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
