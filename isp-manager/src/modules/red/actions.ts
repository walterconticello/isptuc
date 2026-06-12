"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { checkPermission } from "@/lib/permissions";
import { Modulo } from "@/generated/prisma/enums";
import { clasificarSenal, rankSenal, type Senal } from "./potencia";
import { fuentePanelMollar } from "./fuentes/panel";
import { sincronizarContratos } from "./wispro/sync-contratos";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

// ID fijo de la OLT de El Mollar (fuente PANEL). La aseguramos al sincronizar
// para no depender de re-sembrar la base.
const OLT_MOLLAR_ID = "olt-mollar";

async function guardRed() {
  const session = await auth();
  if (!session?.user?.id) return { session: null, error: "No autenticado" };
  const ok = await checkPermission(session.user.id, Modulo.RED);
  if (!ok) return { session: null, error: "Sin permisos" };
  return { session, error: null };
}

function aNum(v: { toString(): string } | null): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v.toString());
  return Number.isFinite(n) ? n : null;
}

export interface OnuVista {
  id: string;
  oltNombre: string;
  oltSucursal: string | null;
  pon: string | null;
  idOnu: string | null;
  serial: string | null;
  ip: string | null;
  estado: string | null;
  vlan: string | null;
  pppoeUser: string | null;
  publicIdWispro: number | null;
  potenciaDbm: number | null;
  leidoEn: string;
  cliente: string | null;
  direccion: string | null;
  senal: Senal;
}

export interface FiltrosOnus {
  q?: string;
  oltId?: string;
  estado?: string;
}

export async function listarOlts() {
  const { session, error } = await guardRed();
  if (!session) return { success: false as const, error: error! };
  const olts = await db.olt.findMany({ orderBy: { nombre: "asc" } });
  return { success: true as const, data: olts };
}

export async function getOnus(filtros: FiltrosOnus = {}): Promise<ActionResult<OnuVista[]>> {
  const { session, error } = await guardRed();
  if (!session) return { success: false, error: error! };

  const onus = await db.onu.findMany({
    where: { oltId: filtros.oltId || undefined },
    include: { olt: true },
  });

  // Cruce soft con la cache de contratos WisPro (por publicIdWispro).
  const ids = [...new Set(onus.map((o) => o.publicIdWispro).filter((x): x is number => x != null))];
  const contratos = ids.length
    ? await db.contratoWispro.findMany({ where: { publicId: { in: ids } } })
    : [];
  const contratoPorId = new Map(contratos.map((c) => [c.publicId, c]));

  let filas: OnuVista[] = onus.map((o) => {
    const contrato = o.publicIdWispro != null ? contratoPorId.get(o.publicIdWispro) : undefined;
    const potencia = aNum(o.potenciaDbm);
    return {
      id: o.id,
      oltNombre: o.olt.nombre,
      oltSucursal: o.olt.sucursal,
      pon: o.pon,
      idOnu: o.idOnu,
      serial: o.serial,
      ip: o.ip,
      estado: o.estado,
      vlan: o.vlan,
      pppoeUser: o.pppoeUser,
      publicIdWispro: o.publicIdWispro,
      potenciaDbm: potencia,
      leidoEn: o.leidoEn.toISOString(),
      cliente: contrato?.nombreCliente ?? o.pppoeUser ?? null,
      direccion: contrato?.direccion ?? null,
      senal: clasificarSenal(potencia),
    };
  });

  // Filtro de texto (cliente / IP / usuario / serial).
  const q = filtros.q?.trim().toLowerCase();
  if (q) {
    filas = filas.filter((f) =>
      [f.cliente, f.ip, f.pppoeUser, f.serial, String(f.publicIdWispro ?? "")]
        .some((c) => c?.toLowerCase().includes(q))
    );
  }
  if (filtros.estado) filas = filas.filter((f) => f.senal.nivel === filtros.estado);

  // Orden: peor señal primero.
  filas.sort((a, b) => rankSenal(a.potenciaDbm) - rankSenal(b.potenciaDbm));
  return { success: true, data: filas };
}

export async function getOnuById(id: string): Promise<ActionResult<OnuVista & {
  historial: { id: string; accion: string; resultado: string | null; tecnico: string | null; createdAt: string }[];
}>> {
  const { session, error } = await guardRed();
  if (!session) return { success: false, error: error! };

  const o = await db.onu.findUnique({ where: { id }, include: { olt: true } });
  if (!o) return { success: false, error: "ONU no encontrada" };

  const contrato = o.publicIdWispro != null
    ? await db.contratoWispro.findUnique({ where: { publicId: o.publicIdWispro } })
    : null;
  const potencia = aNum(o.potenciaDbm);

  // Historial de configuraciones (por serial o por public_id).
  const registros = await db.registroConfiguracion.findMany({
    where: {
      OR: [
        o.serial ? { serialOnu: o.serial } : { id: "__none__" },
        o.publicIdWispro != null ? { publicIdWispro: o.publicIdWispro } : { id: "__none__" },
      ],
    },
    include: { empleado: { select: { nombre: true, apellido: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return {
    success: true,
    data: {
      id: o.id,
      oltNombre: o.olt.nombre,
      oltSucursal: o.olt.sucursal,
      pon: o.pon,
      idOnu: o.idOnu,
      serial: o.serial,
      ip: o.ip,
      estado: o.estado,
      vlan: o.vlan,
      pppoeUser: o.pppoeUser,
      publicIdWispro: o.publicIdWispro,
      potenciaDbm: potencia,
      leidoEn: o.leidoEn.toISOString(),
      cliente: contrato?.nombreCliente ?? o.pppoeUser ?? null,
      direccion: contrato?.direccion ?? null,
      senal: clasificarSenal(potencia),
      historial: registros.map((r) => ({
        id: r.id,
        accion: r.accion,
        resultado: r.resultado,
        tecnico: r.empleado ? `${r.empleado.nombre} ${r.empleado.apellido}` : r.tecnicoNombre,
        createdAt: r.createdAt.toISOString(),
      })),
    },
  };
}

/** Asegura la OLT de El Mollar (fuente PANEL) y la devuelve. */
async function asegurarOltMollar() {
  return db.olt.upsert({
    where: { id: OLT_MOLLAR_ID },
    update: {},
    create: {
      id: OLT_MOLLAR_ID,
      nombre: "OLT El Mollar",
      sucursal: "El Mollar",
      ipGestion: "192.168.101.254",
      vendor: "V-SOL",
      tipoFuente: "PANEL",
    },
  });
}

export async function sincronizarOnus(oltId?: string): Promise<ActionResult<{ total: number }>> {
  const { session, error } = await guardRed();
  if (!session) return { success: false, error: error! };

  const olt = oltId
    ? await db.olt.findUnique({ where: { id: oltId } })
    : await asegurarOltMollar();
  if (!olt) return { success: false, error: "OLT no encontrada" };

  if (olt.tipoFuente !== "PANEL") {
    return { success: false, error: `La fuente ${olt.tipoFuente} todavía no está implementada.` };
  }

  let crudas;
  try {
    crudas = await fuentePanelMollar().leerOnus();
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "No pude leer la OLT" };
  }

  const ahora = new Date();
  for (const c of crudas) {
    const datos = {
      serial: c.serial,
      ip: c.ip,
      potenciaDbm: c.potenciaDbm,
      estado: c.estado,
      vlan: c.vlan,
      pppoeUser: c.pppoeUser,
      publicIdWispro: c.publicIdWispro,
      leidoEn: ahora,
    };
    await db.onu.upsert({
      where: { oltId_pon_idOnu: { oltId: olt.id, pon: c.pon, idOnu: c.idOnu } },
      update: datos,
      create: { oltId: olt.id, pon: c.pon, idOnu: c.idOnu, ...datos },
    });
  }

  void logAudit({
    empleadoId: session.user.id,
    accion: "SYNC_ONUS",
    modulo: "RED",
    entidadId: olt.id,
    entidadNombre: olt.nombre,
    detalles: { total: crudas.length },
  });
  revalidatePath("/red");
  return { success: true, data: { total: crudas.length } };
}

export async function sincronizarContratosWispro(): Promise<ActionResult<{ total: number }>> {
  const { session, error } = await guardRed();
  if (!session) return { success: false, error: error! };
  try {
    const { total } = await sincronizarContratos();
    void logAudit({
      empleadoId: session.user.id,
      accion: "SYNC_ONUS",
      modulo: "RED",
      entidadNombre: "Contratos WisPro",
      detalles: { contratos: total },
    });
    revalidatePath("/red");
    return { success: true, data: { total } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error sincronizando WisPro" };
  }
}

export async function getResumenRed(): Promise<ActionResult<{
  total: number;
  bien: number;
  alerta: number;
  critico: number;
  sinLectura: number;
}>> {
  const { session, error } = await guardRed();
  if (!session) return { success: false, error: error! };

  const onus = await db.onu.findMany({ select: { potenciaDbm: true } });
  const resumen = { total: onus.length, bien: 0, alerta: 0, critico: 0, sinLectura: 0 };
  for (const o of onus) {
    const nivel = clasificarSenal(aNum(o.potenciaDbm)).nivel;
    if (nivel === "bien") resumen.bien++;
    else if (nivel === "justa" || nivel === "muy_alta") resumen.alerta++;
    else if (nivel === "baja" || nivel === "sin_senal") resumen.critico++;
    else resumen.sinLectura++;
  }
  return { success: true, data: resumen };
}
