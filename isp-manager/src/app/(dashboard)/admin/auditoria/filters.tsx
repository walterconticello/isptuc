"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

interface Props {
  modulos: string[];
  empleados: { id: string; nombre: string; apellido: string }[];
  filtroActual: { modulo?: string; empleadoId?: string; desde?: string; hasta?: string };
}

export default function AuditoriaFilters({ modulos, empleados, filtroActual }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [modulo, setModulo] = useState(filtroActual.modulo ?? "");
  const [empleadoId, setEmpleadoId] = useState(filtroActual.empleadoId ?? "");
  const [desde, setDesde] = useState(filtroActual.desde ?? "");
  const [hasta, setHasta] = useState(filtroActual.hasta ?? "");

  function aplicar() {
    const params = new URLSearchParams();
    if (modulo) params.set("modulo", modulo);
    if (empleadoId) params.set("empleadoId", empleadoId);
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);
    router.push(`${pathname}?${params.toString()}`);
  }

  function limpiar() {
    setModulo(""); setEmpleadoId(""); setDesde(""); setHasta("");
    router.push(pathname);
  }

  const hayFiltros = !!(filtroActual.modulo || filtroActual.empleadoId || filtroActual.desde || filtroActual.hasta);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Módulo</label>
          <select value={modulo} onChange={(e) => setModulo(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="">Todos</option>
            {modulos.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Usuario</label>
          <select value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="">Todos</option>
            {empleados.map((e) => <option key={e.id} value={e.id}>{e.apellido} {e.nombre}</option>)}
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
      <div className="flex gap-2">
        <button onClick={aplicar}
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
    </div>
  );
}
