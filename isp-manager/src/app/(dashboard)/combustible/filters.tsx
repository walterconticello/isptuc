"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Vehiculo { id: string; patente: string; marca: string; modelo: string }
interface Empleado { id: string; nombre: string; apellido: string }

interface Props {
  vehiculos: Vehiculo[];
  empleados: Empleado[];
  diasConCarga: string[]; // yyyy-MM-dd (UTC)
  filtroActual: { vehiculoId?: string; empleadoId?: string; desde?: string; hasta?: string; dia?: string };
}

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS_SEMANA = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

/** yyyy-MM-dd de una fecha en UTC. */
function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function CombustibleFilters({ vehiculos, empleados, diasConCarga, filtroActual }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [vehiculoId, setVehiculoId] = useState(filtroActual.vehiculoId ?? "");
  const [empleadoId, setEmpleadoId] = useState(filtroActual.empleadoId ?? "");
  const [desde, setDesde] = useState(filtroActual.desde ?? "");
  const [hasta, setHasta] = useState(filtroActual.hasta ?? "");

  const diasSet = new Set(diasConCarga);

  // Mes mostrado en el calendario: el del día seleccionado, o el actual.
  const inicial = filtroActual.dia ? new Date(`${filtroActual.dia}T00:00:00.000Z`) : new Date();
  const [mesVista, setMesVista] = useState(new Date(Date.UTC(inicial.getUTCFullYear(), inicial.getUTCMonth(), 1)));

  function navegar(extra: Record<string, string>) {
    const params = new URLSearchParams();
    if (vehiculoId) params.set("vehiculoId", vehiculoId);
    if (empleadoId) params.set("empleadoId", empleadoId);
    for (const [k, v] of Object.entries(extra)) {
      if (v) params.set(k, v);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function aplicarRango() {
    navegar({ desde, hasta });
  }

  function seleccionarDia(diaIso: string) {
    // Click sobre el día ya seleccionado lo deselecciona.
    if (filtroActual.dia === diaIso) {
      navegar({ desde, hasta });
    } else {
      navegar({ dia: diaIso });
    }
  }

  function limpiar() {
    setVehiculoId(""); setEmpleadoId(""); setDesde(""); setHasta("");
    router.push(pathname);
  }

  const hayFiltros = !!(filtroActual.vehiculoId || filtroActual.empleadoId || filtroActual.desde || filtroActual.hasta || filtroActual.dia);

  // Construcción de la grilla del mes (semana inicia el lunes).
  const anio = mesVista.getUTCFullYear();
  const mes = mesVista.getUTCMonth();
  const primerDia = new Date(Date.UTC(anio, mes, 1));
  const offset = (primerDia.getUTCDay() + 6) % 7; // lunes = 0
  const diasEnMes = new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate();
  const hoyIso = iso(new Date());

  const celdas: (string | null)[] = [];
  for (let i = 0; i < offset; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(iso(new Date(Date.UTC(anio, mes, d))));

  function cambiarMes(delta: number) {
    setMesVista(new Date(Date.UTC(anio, mes + delta, 1)));
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      {/* Selects + rango de fechas */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Vehículo</label>
          <select value={vehiculoId} onChange={(e) => setVehiculoId(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="">Todos</option>
            {vehiculos.map((v) => <option key={v.id} value={v.id}>{v.patente} — {v.marca} {v.modelo}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Empleado</label>
          <select value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="">Todos</option>
            {empleados.map((emp) => <option key={emp.id} value={emp.id}>{emp.apellido} {emp.nombre}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Desde</label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Hasta</label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={aplicarRango}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">
          <Search className="h-3.5 w-3.5" /> Filtrar
        </button>
        {hayFiltros && (
          <button onClick={limpiar}
            className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-medium hover:bg-accent">
            <X className="h-3.5 w-3.5" /> Limpiar filtros
          </button>
        )}
      </div>

      {/* Calendario: días con cargas resaltados */}
      <div className="rounded-lg border bg-background p-3 sm:max-w-xs">
        <div className="mb-2 flex items-center justify-between">
          <button onClick={() => cambiarMes(-1)} aria-label="Mes anterior"
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium">{MESES[mes]} {anio}</span>
          <button onClick={() => cambiarMes(1)} aria-label="Mes siguiente"
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {DIAS_SEMANA.map((d) => (
            <span key={d} className="py-1 text-[10px] font-medium text-muted-foreground">{d}</span>
          ))}
          {celdas.map((diaIso, i) => {
            if (!diaIso) return <span key={`v-${i}`} />;
            const numero = Number(diaIso.slice(8, 10));
            const tieneCarga = diasSet.has(diaIso);
            const seleccionado = filtroActual.dia === diaIso;
            const esHoy = diaIso === hoyIso;
            return (
              <button
                key={diaIso}
                onClick={() => seleccionarDia(diaIso)}
                aria-pressed={seleccionado}
                aria-label={`${diaIso}${tieneCarga ? " — con cargas" : ""}`}
                title={tieneCarga ? "Hubo cargas este día" : undefined}
                className={cn(
                  "relative aspect-square rounded-md text-xs transition-colors",
                  seleccionado
                    ? "bg-primary font-semibold text-primary-foreground"
                    : tieneCarga
                      ? "bg-primary/15 font-medium text-foreground hover:bg-primary/25"
                      : "text-muted-foreground hover:bg-accent",
                  esHoy && !seleccionado && "ring-1 ring-ring",
                )}
              >
                {numero}
                {tieneCarga && !seleccionado && (
                  <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Con cargas</span>
          {filtroActual.dia && (
            <button onClick={() => navegar({ desde, hasta })} className="ml-auto underline hover:text-foreground">
              Quitar día
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
