import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getVehiculoById } from "@/modules/flota/actions";
import { Modulo } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import VehiculoForm from "../../_components/vehiculo-form";

export default async function EditarVehiculoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.FLOTA);
  if (!ok) redirect("/dashboard");

  const [result, cuadrillas] = await Promise.all([
    getVehiculoById(id),
    db.cuadrilla.findMany({ where: { estado: "ACTIVA" }, select: { id: true, nombre: true }, orderBy: { nombre: "asc" } }),
  ]);
  if (!result.success) notFound();

  return <VehiculoForm vehiculo={result.data} cuadrillas={cuadrillas} />;
}
