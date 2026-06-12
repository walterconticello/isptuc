import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { Modulo } from "@/generated/prisma/enums";
import { getOnus, getResumenRed, listarOlts } from "@/modules/red/actions";
import type { ColorSenal } from "@/modules/red/potencia";
import { cn } from "@/lib/utils";
import { Search, Filter, ChevronRight, Activity } from "lucide-react";
import { SyncBar } from "./_components/sync-bar";

const AVATAR_COLORS = [
  "from-blue-600 to-blue-400",
  "from-teal-600 to-teal-400",
  "from-purple-600 to-purple-400",
  "from-green-600 to-green-400",
  "from-rose-600 to-rose-400",
  "from-amber-600 to-amber-400",
  "from-indigo-600 to-indigo-400",
];

function iniciales(nombre: string): string {
  const w = nombre.trim().split(/\s+/);
  if (w.length >= 2) return (w[0][0] + w[1][0]).toUpperCase();
  return nombre.slice(0, 2).toUpperCase();
}
function avatarColor(nombre: string): string {
  const hash = nombre.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// Clases del semáforo de señal por color semántico.
const SENAL: Record<ColorSenal, { badge: string; dot: string }> = {
  verde: { badge: "bg-emerald-500/15 text-emerald-400", dot: "bg-emerald-400" },
  ambar: { badge: "bg-amber-500/15 text-amber-400", dot: "bg-amber-400" },
  rojo: { badge: "bg-red-500/15 text-red-400", dot: "bg-red-400" },
  gris: { badge: "bg-white/10 text-white/50", dot: "bg-white/40" },
};

const NIVELES: { valor: string; label: string }[] = [
  { valor: "", label: "Toda señal" },
  { valor: "sin_senal", label: "Sin señal" },
  { valor: "baja", label: "Baja" },
  { valor: "justa", label: "Justa" },
  { valor: "muy_alta", label: "Muy alta" },
  { valor: "bien", label: "Bien" },
  { valor: "sin_lectura", label: "Sin lectura" },
];

function fmtDbm(n: number | null): string {
  return n == null ? "—" : `${n.toFixed(2).replace(".", ",")} dBm`;
}
function fmtFecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }) +
    " " + d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export default async function RedPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; olt?: string; nivel?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.RED);
  if (!ok) redirect("/dashboard");

  const sp = await searchParams;
  const [resumenR, oltsR, onusR] = await Promise.all([
    getResumenRed(),
    listarOlts(),
    getOnus({ q: sp.q, oltId: sp.olt, estado: sp.nivel }),
  ]);
  if (!onusR.success) redirect("/dashboard");
  const onus = onusR.data;
  const olts = oltsR.success ? oltsR.data : [];
  const resumen = resumenR.success
    ? resumenR.data
    : { total: 0, bien: 0, alerta: 0, critico: 0, sinLectura: 0 };

  const kpis = [
    { label: "ONUs", valor: resumen.total, clase: "text-foreground", borde: "border-t-indigo-500" },
    { label: "Bien", valor: resumen.bien, clase: "text-emerald-400", borde: "border-t-emerald-500" },
    { label: "Alerta", valor: resumen.alerta, clase: "text-amber-400", borde: "border-t-amber-500" },
    { label: "Crítico", valor: resumen.critico, clase: "text-red-400", borde: "border-t-red-500" },
    { label: "Sin lectura", valor: resumen.sinLectura, clase: "text-white/50", borde: "border-t-white/20" },
  ];

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Operaciones › Red</p>
          <h1 className="text-2xl font-bold tracking-tight">Red FTTH</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {onus.length} ONU{onus.length === 1 ? "" : "s"}
            {sp.q || sp.olt || sp.nivel ? " (filtradas)" : ""}
          </p>
        </div>
        <SyncBar />
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className={cn("rounded-xl border border-t-2 bg-card p-4 shadow-sm", k.borde)}>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{k.label}</p>
            <p className={cn("mt-1 text-2xl font-bold tabular-nums", k.clase)}>{k.valor}</p>
          </div>
        ))}
      </div>

      {/* ── Buscador + filtros ── */}
      <form method="GET" className="flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            type="search"
            defaultValue={sp.q}
            placeholder="Buscar por cliente, IP, usuario o serial…"
            className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          name="olt"
          defaultValue={sp.olt ?? ""}
          className="rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring"
        >
          <option value="">Todas las OLT</option>
          {olts.map((o) => (
            <option key={o.id} value={o.id}>{o.nombre}</option>
          ))}
        </select>
        <select
          name="nivel"
          defaultValue={sp.nivel ?? ""}
          className="rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring"
        >
          {NIVELES.map((n) => (
            <option key={n.valor} value={n.valor}>{n.label}</option>
          ))}
        </select>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filtrar</span>
        </button>
      </form>

      {/* ── Tabla desktop ── */}
      <div className="hidden overflow-hidden rounded-xl border bg-card shadow-sm md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              {["Cliente", "IP", "Potencia", "OLT", "PON", "Estado", "Actualizado", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {onus.map((o) => {
              const nombre = o.cliente ?? o.pppoeUser ?? "—";
              const s = SENAL[o.senal.color];
              return (
                <tr key={o.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white", avatarColor(nombre))}>
                        {iniciales(nombre)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{nombre}</p>
                        {o.pppoeUser && <p className="truncate text-xs text-muted-foreground">{o.pppoeUser}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {o.ip ? <span className="font-mono text-xs text-muted-foreground">{o.ip}</span> : <span className="text-xs text-muted-foreground/50">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold", s.badge)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                        {o.senal.etiqueta}
                      </span>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">{fmtDbm(o.potenciaDbm)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs">{o.oltSucursal ?? o.oltNombre}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-muted-foreground">{o.pon ?? "—"}{o.idOnu ? `/${o.idOnu}` : ""}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">{o.estado ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground tabular-nums">{fmtFecha(o.leidoEn)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/red/${o.id}`} title="Detalle" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {onus.length === 0 && <EmptyState filtrado={!!(sp.q || sp.olt || sp.nivel)} />}
      </div>

      {/* ── Cards mobile ── */}
      <div className="grid gap-3 md:hidden">
        {onus.map((o) => {
          const nombre = o.cliente ?? o.pppoeUser ?? "—";
          const s = SENAL[o.senal.color];
          return (
            <Link key={o.id} href={`/red/${o.id}`} className="block rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white", avatarColor(nombre))}>
                  {iniciales(nombre)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{nombre}</p>
                  {o.ip && <p className="truncate font-mono text-xs text-muted-foreground">{o.ip}</p>}
                </div>
                <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold", s.badge)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                  {o.senal.etiqueta}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
                <span className="font-mono tabular-nums">{fmtDbm(o.potenciaDbm)}</span>
                <span>{o.oltSucursal ?? o.oltNombre} · PON {o.pon ?? "—"}</span>
              </div>
            </Link>
          );
        })}
        {onus.length === 0 && <EmptyState filtrado={!!(sp.q || sp.olt || sp.nivel)} />}
      </div>
    </div>
  );
}

function EmptyState({ filtrado }: { filtrado: boolean }) {
  return (
    <div className="py-12 text-center">
      <Activity className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">
        {filtrado ? "Sin resultados para el filtro." : "No hay ONUs cargadas. Pulsá «Sincronizar ONUs»."}
      </p>
    </div>
  );
}
