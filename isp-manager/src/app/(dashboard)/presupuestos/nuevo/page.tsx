import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { Modulo } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import PresupuestoEditor from "../_components/presupuesto-editor";

export default async function NuevoPresupuestoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.PRESUPUESTOS);
  if (!ok) redirect("/dashboard");

  const [clientes, items, impuesto] = await Promise.all([
    db.cliente.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true, cuit: true, email: true, telefono: true, direccion: true } }),
    db.itemServicio.findMany({ where: { activo: true }, orderBy: { descripcion: "asc" } })
      .then((rows) => rows.map((r) => ({ ...r, precioUnitario: Number(r.precioUnitario) }))),
    db.impuesto.findFirst({ where: { esDefault: true, activo: true } }),
  ]);

  return (
    <PresupuestoEditor
      clientes={clientes}
      items={items}
      ivaPorcentajeDefault={impuesto ? Number(impuesto.porcentaje) : 21}
    />
  );
}
