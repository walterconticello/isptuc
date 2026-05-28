import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { Modulo } from "@/generated/prisma/enums";
import ClienteForm from "../_components/cliente-form";

export default async function NuevoClientePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.CLIENTES);
  if (!ok) redirect("/dashboard");
  return <ClienteForm />;
}
