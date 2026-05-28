import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { Modulo } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import VehiculoForm from "../_components/vehiculo-form";

export default async function NuevoVehiculoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.FLOTA);
  if (!ok) redirect("/dashboard");

  const cuadrillas = await db.cuadrilla.findMany({
    where: { estado: "ACTIVA" },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });

  return <VehiculoForm cuadrillas={cuadrillas} />;
}
