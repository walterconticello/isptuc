import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { Modulo } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import AlmacenForm from "../_components/almacen-form";

export default async function NuevoAlmacenPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.STOCK);
  if (!ok) redirect("/dashboard");
  const empleados = await db.empleado.findMany({ where: { activo: true }, select: { id: true, nombre: true, apellido: true }, orderBy: [{ apellido: "asc" }, { nombre: "asc" }] });
  return <AlmacenForm empleados={empleados} />;
}
