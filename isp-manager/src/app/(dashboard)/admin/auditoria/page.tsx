import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getAuditLogs } from "@/modules/admin/audit-actions";
import { Modulo } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { ACCION_LABEL, MODULO_AUDIT_COLOR } from "@/lib/audit";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import AuditoriaFilters from "./filters";

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ modulo?: string; empleadoId?: string; desde?: string; hasta?: string; page?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.ADMIN);
  if (!ok) redirect("/dashboard");

  const page = Number(params.page ?? 1);

  const [result, empleados] = await Promise.all([
    getAuditLogs({
      modulo: params.modulo,
      empleadoId: params.empleadoId,
      fechaDesde: params.desde,
      fechaHasta: params.hasta,
      page,
    }),
    db.empleado.findMany({ select: { id: true, nombre: true, apellido: true }, orderBy: [{ apellido: "asc" }, { nombre: "asc" }] }),
  ]);

  if (!result.success) redirect("/admin");
  const { logs, total, pageSize } = result.data;
  const totalPages = Math.ceil(total / pageSize);

  const MODULOS = ["AUTH", "EMPLEADOS", "FLOTA", "COMBUSTIBLE", "CUADRILLAS", "PRESUPUESTOS", "CLIENTES", "ITEMS", "STOCK", "ADMIN"];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground"><ChevronLeft className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-2xl font-semibold">Auditoría del sistema</h1>
          <p className="text-sm text-muted-foreground">{total.toLocaleString("es-AR")} registros</p>
        </div>
      </div>

      {/* Filtros */}
      <AuditoriaFilters
        modulos={MODULOS}
        empleados={empleados}
        filtroActual={{ modulo: params.modulo, empleadoId: params.empleadoId, desde: params.desde, hasta: params.hasta }}
      />

      {/* Tabla */}
      <div className="rounded-lg border divide-y">
        {logs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No hay registros con los filtros seleccionados</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 px-4 py-3">
              <div className="shrink-0 pt-0.5">
                <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-medium", MODULO_AUDIT_COLOR[log.modulo as keyof typeof MODULO_AUDIT_COLOR] ?? "bg-gray-100 text-gray-600")}>
                  {log.modulo}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {ACCION_LABEL[log.accion as keyof typeof ACCION_LABEL] ?? log.accion}
                  {log.entidadNombre && <span className="text-muted-foreground font-normal"> — {log.entidadNombre}</span>}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {log.empleado
                    ? `${log.empleado.apellido} ${log.empleado.nombre}`
                    : "Sistema"}
                  {" · "}
                  {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                </p>
                {log.detalles && (
                  <details className="mt-1">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      Ver detalles
                    </summary>
                    <pre className="mt-1 rounded bg-muted p-2 text-xs overflow-x-auto max-h-32">
                      {JSON.stringify(log.detalles, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Página {page} de {totalPages} ({total} registros)
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
                className="flex items-center gap-1 rounded-lg border px-3 py-1.5 hover:bg-accent text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
                className="flex items-center gap-1 rounded-lg border px-3 py-1.5 hover:bg-accent text-xs"
              >
                Siguiente <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
