import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getEmpleadoById } from "@/modules/empleados/actions";
import { Modulo } from "@/generated/prisma/client";
import EditarEmpleadoForm from "./form";

export default async function EditarEmpleadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ok = await checkPermission(session.user.id, Modulo.EMPLEADOS);
  if (!ok) redirect("/dashboard");

  const result = await getEmpleadoById(id);
  if (!result.success) notFound();

  return <EditarEmpleadoForm empleado={result.data} sessionUserId={session.user.id} />;
}
