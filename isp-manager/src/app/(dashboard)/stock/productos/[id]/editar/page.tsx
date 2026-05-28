import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { Modulo } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import ProductoForm from "../../_components/producto-form";

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.STOCK);
  if (!ok) redirect("/dashboard");
  const p = await db.producto.findUnique({ where: { id } });
  if (!p) notFound();
  return <ProductoForm producto={p} />;
}
