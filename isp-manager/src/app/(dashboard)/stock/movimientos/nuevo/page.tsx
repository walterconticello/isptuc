import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { Modulo } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import NuevoMovimientoForm from "./form";

export default async function NuevoMovimientoPage({
  searchParams,
}: {
  searchParams: Promise<{ productoId?: string; almacenId?: string }>;
}) {
  const { productoId, almacenId } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.STOCK);
  if (!ok) redirect("/dashboard");

  const [almacenes, productos] = await Promise.all([
    db.almacen.findMany({ where: { activo: true }, select: { id: true, nombre: true }, orderBy: { nombre: "asc" } }),
    db.producto.findMany({ where: { activo: true }, select: { id: true, nombre: true, unidad: true }, orderBy: { nombre: "asc" } }),
  ]);

  return (
    <NuevoMovimientoForm
      almacenes={almacenes}
      productos={productos}
      productoIdPreseleccionado={productoId}
      almacenIdPreseleccionado={almacenId}
    />
  );
}
