import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getVehiculoById } from "@/modules/flota/actions";
import { Modulo, TipoVehiculo, EstadoVehiculo, TipoCombustible } from "@/generated/prisma/client";
import { TIPO_VEHICULO_LABEL, ESTADO_VEHICULO_LABEL, ESTADO_VEHICULO_COLOR, TIPO_COMBUSTIBLE_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { ChevronLeft, Pencil, Fuel, Gauge } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function VehiculoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.FLOTA);
  if (!ok) redirect("/dashboard");

  const result = await getVehiculoById(id);
  if (!result.success) notFound();
  const v = result.data;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/flota" className="text-muted-foreground hover:text-foreground"><ChevronLeft className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-2xl font-semibold font-mono">{v.patente}</h1>
          <p className="text-muted-foreground text-sm">{v.marca} {v.modelo} · {v.anio}</p>
        </div>
      </div>

      {/* Info principal */}
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{TIPO_VEHICULO_LABEL[v.tipo as TipoVehiculo]}</span>
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", ESTADO_VEHICULO_COLOR[v.estado as EstadoVehiculo])}>
            {ESTADO_VEHICULO_LABEL[v.estado as EstadoVehiculo]}
          </span>
        </div>
        <dl className="grid gap-2.5 text-sm sm:grid-cols-2">
          <Row label="Odómetro" value={`${v.odometroActual.toLocaleString("es-AR")} km`} />
          <Row label="Cuadrilla" value={v.cuadrilla?.nombre ?? "Sin asignar"} />
          {v.notas && <Row label="Notas" value={v.notas} />}
        </dl>
        <div className="flex gap-3 pt-2 border-t">
          <Link href={`/flota/${id}/editar`}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent">
            <Pencil className="h-4 w-4" /> Editar
          </Link>
          <Link href={`/combustible/nuevo?vehiculoId=${id}`}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent">
            <Fuel className="h-4 w-4" /> Cargar combustible
          </Link>
        </div>
      </div>

      {/* Últimas cargas */}
      <div className="space-y-3">
        <h2 className="font-medium flex items-center gap-2"><Gauge className="h-4 w-4" />Últimas cargas de combustible</h2>
        {v.registrosCombustible.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin registros aún</p>
        ) : (
          <div className="rounded-lg border divide-y">
            {v.registrosCombustible.map((r) => (
              <div key={r.id} className="px-4 py-3 text-sm flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{r.litros.toFixed(2)} L · {TIPO_COMBUSTIBLE_LABEL[r.tipoCombustible as TipoCombustible]}</p>
                  <p className="text-muted-foreground text-xs">
                    {format(new Date(r.fecha), "dd/MM/yyyy", { locale: es })} · {r.empleado.nombre} {r.empleado.apellido}
                    {r.kmDesdeUltimo ? ` · ${r.kmDesdeUltimo.toFixed(0)} km` : ""}
                  </p>
                </div>
                <p className="font-semibold whitespace-nowrap">
                  ${r.costoTotal.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}
