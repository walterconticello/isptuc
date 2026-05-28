import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getAlmacenById } from "@/modules/stock/actions";
import { Modulo } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import AlmacenForm from "../../_components/almacen-form";

export default async function EditarAlmacenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.STOCK);
  if (!ok) redirect("/dashboard");
  const [result, empleados] = await Promise.all([
    getAlmacenById(id),
    db.empleado.findMany({ where: { activo: true }, select: { id: true, nombre: true, apellido: true }, orderBy: [{ apellido: "asc" }, { nombre: "asc" }] }),
  ]);
  if (!result.success) notFound();
  return <AlmacenForm almacen={result.data} empleados={empleados} />;
}
