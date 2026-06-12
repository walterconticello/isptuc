import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { Modulo } from "@/generated/prisma/enums";
import { getOnuById } from "@/modules/red/actions";
import type { ColorSenal } from "@/modules/red/potencia";
import { cn } from "@/lib/utils";
import { ChevronLeft, Wrench } from "lucide-react";

const SENAL: Record<ColorSenal, { badge: string; dot: string }> = {
  verde: { badge: "bg-emerald-500/15 text-emerald-400", dot: "bg-emerald-400" },
  ambar: { badge: "bg-amber-500/15 text-amber-400", dot: "bg-amber-400" },
  rojo: { badge: "bg-red-500/15 text-red-400", dot: "bg-red-400" },
  gris: { badge: "bg-white/10 text-white/50", dot: "bg-white/40" },
};

function fmtDbm(n: number | null): string {
  return n == null ? "—" : `${n.toFixed(2).replace(".", ",")} dBm`;
}
function fmtFechaHora(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default async function OnuDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.RED);
  if (!ok) redirect("/dashboard");

  const result = await getOnuById(id);
  if (!result.success) notFound();
  const o = result.data;
  const nombre = o.cliente ?? o.pppoeUser ?? "Sin cliente";
  const s = SENAL[o.senal.color];

  const datos: { label: string; valor: string; mono?: boolean }[] = [
    { label: "IP", valor: o.ip ?? "—", mono: true },
    { label: "Usuario PPPoE", valor: o.pppoeUser ?? "—", mono: true },
    { label: "Serial ONU", valor: o.serial ?? "—", mono: true },
    { label: "OLT", valor: o.oltNombre },
    { label: "Sucursal", valor: o.oltSucursal ?? "—" },
    { label: "PON / ID", valor: `${o.pon ?? "—"}${o.idOnu ? ` / ${o.idOnu}` : ""}`, mono: true },
    { label: "VLAN", valor: o.vlan ?? "—", mono: true },
    { label: "Estado", valor: o.estado ?? "—" },
    { label: "Contrato WisPro", valor: o.publicIdWispro != null ? `#${o.publicIdWispro}` : "—", mono: true },
    { label: "Dirección", valor: o.direccion ?? "—" },
    { label: "Última lectura", valor: fmtFechaHora(o.leidoEn) },
  ];

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div>
        <Link href="/red" className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-foreground">
          <ChevronLeft className="h-3.5 w-3.5" /> Red FTTH
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{nombre}</h1>
      </div>

      {/* ── Potencia destacada ── */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Potencia óptica (RX)</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="font-mono text-3xl font-bold tabular-nums">{fmtDbm(o.potenciaDbm)}</span>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold", s.badge)}>
            <span className={cn("h-2 w-2 rounded-full", s.dot)} />
            {o.senal.etiqueta}
          </span>
        </div>
      </div>

      {/* ── Datos ── */}
      <div className="rounded-xl border bg-card shadow-sm">
        <dl className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-y-0">
          {datos.map((d, i) => (
            <div key={d.label} className={cn("flex items-center justify-between gap-4 px-4 py-3 sm:border-b", i % 2 === 0 && "sm:border-r")}>
              <dt className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{d.label}</dt>
              <dd className={cn("text-right text-sm", d.mono && "font-mono text-xs text-muted-foreground")}>{d.valor}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ── Historial de configuraciones ── */}
      <div>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          <Wrench className="h-4 w-4" /> Historial de configuración
        </h2>
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          {o.historial.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Sin configuraciones registradas para este equipo.
            </p>
          ) : (
            <ul className="divide-y">
              {o.historial.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{h.accion}</p>
                    <p className="text-xs text-muted-foreground">{h.tecnico ?? "Técnico desconocido"}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {h.resultado && (
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        h.resultado.toUpperCase() === "OK"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-red-500/15 text-red-400"
                      )}>
                        {h.resultado}
                      </span>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">{fmtFechaHora(h.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
