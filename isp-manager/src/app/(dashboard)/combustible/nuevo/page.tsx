import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { Modulo } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import NuevaCargaForm from "./form";

export default async function NuevaCargaPage({
  searchParams,
}: {
  searchParams: Promise<{ vehiculoId?: string }>;
}) {
  const { vehiculoId } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.COMBUSTIBLE);
  if (!ok) redirect("/dashboard");

  const [vehiculos, empleados] = await Promise.all([
    db.vehiculo.findMany({
      where: { estado: "ACTIVO" },
      select: { id: true, patente: true, marca: true, modelo: true, odometroActual: true },
      orderBy: { patente: "asc" },
    }),
    db.empleado.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, apellido: true },
      orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
    }),
  ]);

  return (
    <NuevaCargaForm
      vehiculos={vehiculos}
      empleados={empleados}
      vehiculoIdPreseleccionado={vehiculoId}
      sessionEmpleadoId={session.user.id}
    />
  );
}
