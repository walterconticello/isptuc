"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { sincronizarOnus, sincronizarContratosWispro } from "@/modules/red/actions";

type Estado = { tipo: "ok" | "error"; texto: string } | null;

export function SyncBar() {
  const router = useRouter();
  const [pendingOnus, startOnus] = useTransition();
  const [pendingWispro, startWispro] = useTransition();
  const [estado, setEstado] = useState<Estado>(null);

  function syncOnus() {
    setEstado(null);
    startOnus(async () => {
      const r = await sincronizarOnus();
      if (r.success) {
        setEstado({ tipo: "ok", texto: `${r.data.total} ONUs sincronizadas` });
        router.refresh();
      } else {
        setEstado({ tipo: "error", texto: r.error });
      }
    });
  }

  function syncWispro() {
    setEstado(null);
    startWispro(async () => {
      const r = await sincronizarContratosWispro();
      if (r.success) {
        setEstado({ tipo: "ok", texto: `${r.data.total} contratos WisPro actualizados` });
        router.refresh();
      } else {
        setEstado({ tipo: "error", texto: r.error });
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-2">
        <button
          onClick={syncWispro}
          disabled={pendingWispro || pendingOnus}
          className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
        >
          <Database className={cn("h-4 w-4", pendingWispro && "animate-pulse")} />
          <span className="hidden sm:inline">Sincronizar WisPro</span>
          <span className="sm:hidden">WisPro</span>
        </button>
        <button
          onClick={syncOnus}
          disabled={pendingOnus || pendingWispro}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          <RefreshCw className={cn("h-4 w-4", pendingOnus && "animate-spin")} />
          <span className="hidden sm:inline">Sincronizar ONUs</span>
          <span className="sm:hidden">ONUs</span>
        </button>
      </div>
      {estado && (
        <p
          role="status"
          className={cn(
            "text-xs font-medium",
            estado.tipo === "ok" ? "text-emerald-400" : "text-red-400"
          )}
        >
          {estado.texto}
        </p>
      )}
    </div>
  );
}
