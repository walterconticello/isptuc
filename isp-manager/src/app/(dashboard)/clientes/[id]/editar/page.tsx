import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getClienteById } from "@/modules/clientes/actions";
import { Modulo } from "@/generated/prisma/client";
import ClienteForm from "../../_components/cliente-form";

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.CLIENTES);
  if (!ok) redirect("/dashboard");
  const result = await getClienteById(id);
  if (!result.success) notFound();
  return <ClienteForm cliente={result.data} />;
}
