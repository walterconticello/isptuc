"use client";

import { useState } from "react";
import Link from "next/link";
import { TipoCombustible } from "@/generated/prisma/enums";
import { TIPO_COMBUSTIBLE_LABEL } from "@/lib/labels";
import { fechaCortaUTC, cn } from "@/lib/utils";
import {
  type UnidadRendimiento,
  type NivelRendimiento,
  nivelRendimiento,
  textoRendimiento,
} from "@/modules/combustible/rendimiento";

/** Forma serializable del registro que llega desde el server component. */
export interface RegistroFila {
  id: string;
  vehiculoId: string;
  fecha: string | Date;
  litros: number;
  precioPorLitro: number;
  costoTotal: number;
  odometro: number;
  kmDesdeUltimo: number | null;
  consumo: number | null; // L/100km (como lo guarda la DB)
  tipoCombustible: TipoCombustible;
  estacion: string | null;
  vehiculo: { patente: string; marca: string; modelo: string };
  empleado: { nombre: string; apellido: string };
}

/** Clase de color por nivel de rendimiento (verde rinde más, rojo rinde menos). */
const COLOR_NIVEL: Record<NivelRendimiento, string> = {
  alto: "text-green-600 dark:text-green-400 font-semibold",
  medio: "text-yellow-600 dark:text-yellow-400 font-semibold",
  bajo: "text-red-600 dark:text-red-400 font-semibold",
  indefinido: "text-muted-foreground",
};

export default function TablaRegistros({
  registros,
  hayFiltros = false,
}: {
  registros: RegistroFila[];
  hayFiltros?: boolean;
}) {
  const [unidad, setUnidad] = useState<UnidadRendimiento>("kmL");

  if (registros.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <p className="py-12 text-center text-sm text-muted-foreground">
          {hayFiltros ? "No hay cargas con los filtros seleccionados" : "No hay registros de combustible"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      {/* Toggle de unidad de rendimiento */}
      <div className="flex items-center justify-end gap-2 border-b px-4 py-2.5">
        <span className="text-xs text-muted-foreground">Rendimiento:</span>
        <div className="inline-flex rounded-md border p-0.5">
          <button
            type="button"
            onClick={() => setUnidad("kmL")}
            aria-pressed={unidad === "kmL"}
            className={cn(
              "rounded px-2.5 py-1 text-xs font-medium transition-colors",
              unidad === "kmL" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Km/L
          </button>
          <button
            type="button"
            onClick={() => setUnidad("l100")}
            aria-pressed={unidad === "l100"}
            className={cn(
              "rounded px-2.5 py-1 text-xs font-medium transition-colors",
              unidad === "l100" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            L/100km
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">Vehículo</th>
              <th className="px-4 py-3 text-left font-medium">Fecha</th>
              <th className="px-4 py-3 text-right font-medium">Km</th>
              <th className="px-4 py-3 text-right font-medium">Km recorridos</th>
              <th className="px-4 py-3 text-right font-medium">Litros</th>
              <th className="px-4 py-3 text-right font-medium">$/L</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 text-right font-medium">{unidad === "kmL" ? "Km/L" : "L/100km"}</th>
              <th className="px-4 py-3 text-left font-medium">Tipo</th>
              <th className="px-4 py-3 text-left font-medium">Cargó</th>
              <th className="px-4 py-3 text-left font-medium">Estación</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((r) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5">
                  <Link href={`/flota/${r.vehiculoId}`} className="font-mono font-medium text-primary hover:underline">
                    {r.vehiculo.patente}
                  </Link>
                  <span className="ml-1 text-xs text-muted-foreground">
                    {r.vehiculo.marca} {r.vehiculo.modelo}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{fechaCortaUTC(new Date(r.fecha))}</td>
                <td className="px-4 py-2.5 text-right">{r.odometro.toLocaleString("es-AR")}</td>
                <td className="px-4 py-2.5 text-right text-muted-foreground">
                  {r.kmDesdeUltimo ? `+${r.kmDesdeUltimo.toLocaleString("es-AR", { maximumFractionDigits: 0 })}` : "—"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {r.litros.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                </td>
                <td className="px-4 py-2.5 text-right text-muted-foreground">
                  ${r.precioPorLitro.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-2.5 text-right font-medium">
                  ${r.costoTotal.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                </td>
                <td className={cn("px-4 py-2.5 text-right", COLOR_NIVEL[nivelRendimiento(r.consumo)])}>
                  {textoRendimiento(r.consumo, unidad)}
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">
                  {TIPO_COMBUSTIBLE_LABEL[r.tipoCombustible]}
                </td>
                <td className="px-4 py-2.5">{r.empleado.nombre} {r.empleado.apellido}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.estacion ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
