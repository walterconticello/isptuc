import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getClientes } from "@/modules/clientes/actions";
import { Modulo } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { Plus, Search, Filter, Pencil, FileText } from "lucide-react";

const AVATAR_COLORS = [
  "from-blue-600 to-blue-400",
  "from-teal-600 to-teal-400",
  "from-purple-600 to-purple-400",
  "from-green-600 to-green-400",
  "from-rose-600 to-rose-400",
  "from-amber-600 to-amber-400",
  "from-indigo-600 to-indigo-400",
];

function getClientInitials(nombre: string): string {
  const words = nombre.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return nombre.slice(0, 2).toUpperCase();
}

function getAvatarColor(nombre: string): string {
  const hash = nombre.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.CLIENTES);
  if (!ok) redirect("/dashboard");

  const result = await getClientes();
  if (!result.success) redirect("/dashboard");
  const clientes = result.data;

  const q = (searchParams.q ?? "").toLowerCase().trim();
  const filtered = q
    ? clientes.filter((c) =>
        `${c.nombre} ${c.cuit ?? ""} ${c.email ?? ""}`.toLowerCase().includes(q)
      )
    : clientes;

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Gestión comercial › Clientes
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {clientes.length} clientes registrados
          </p>
        </div>
        <Link
          href="/clientes/nuevo"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo cliente</span>
          <span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      {/* ── Buscador ── */}
      <form method="GET" className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            type="search"
            defaultValue={searchParams.q}
            placeholder="Buscar por nombre, CUIT o email…"
            className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </form>

      {/* ── Tabla desktop ── */}
      <div className="hidden overflow-hidden rounded-xl border bg-card shadow-sm md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Cliente</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Contacto</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">CUIT</th>
              <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((c) => {
              const initials = getClientInitials(c.nombre);
              const color    = getAvatarColor(c.nombre);
              return (
                <tr key={c.id} className="transition-colors hover:bg-muted/30">
                  {/* Cliente */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white",
                        color
                      )}>
                        {initials}
                      </div>
                      <p className="font-semibold">{c.nombre}</p>
                    </div>
                  </td>

                  {/* Contacto */}
                  <td className="px-4 py-3">
                    {c.telefono ? (
                      <p className="text-sm font-medium">{c.telefono}</p>
                    ) : null}
                    {c.email ? (
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    ) : null}
                    {!c.telefono && !c.email && (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* CUIT */}
                  <td className="px-4 py-3">
                    {c.cuit ? (
                      <span className="font-mono text-xs text-muted-foreground">{c.cuit}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href="/presupuestos"
                        title="Ver presupuestos"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/clientes/${c.id}/editar`}
                        title="Editar"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {q ? `Sin resultados para "${searchParams.q}"` : "No hay clientes registrados"}
            </p>
          </div>
        )}
      </div>

      {/* ── Cards mobile ── */}
      <div className="grid gap-3 md:hidden">
        {filtered.map((c) => {
          const initials = getClientInitials(c.nombre);
          const color    = getAvatarColor(c.nombre);
          return (
            <div key={c.id} className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white",
                  color
                )}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{c.nombre}</p>
                  {c.cuit && <p className="text-xs text-muted-foreground">CUIT: {c.cuit}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <div className="min-w-0 flex-1">
                  {c.telefono && <p className="text-xs truncate">{c.telefono}</p>}
                  {c.email    && <p className="text-xs text-muted-foreground truncate">{c.email}</p>}
                  {!c.telefono && !c.email && <span className="text-xs text-muted-foreground">Sin datos de contacto</span>}
                </div>
                <div className="flex gap-1.5 ml-3">
                  <Link href="/presupuestos" className="flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                    <FileText className="h-3.5 w-3.5" />
                  </Link>
                  <Link href={`/clientes/${c.id}/editar`} className="flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {q ? `Sin resultados para "${searchParams.q}"` : "No hay clientes registrados"}
          </p>
        )}
      </div>
    </div>
  );
}