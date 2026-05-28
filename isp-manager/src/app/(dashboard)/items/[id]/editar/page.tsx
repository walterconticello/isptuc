import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { Modulo } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import ItemForm from "../../_components/item-form";

export default async function EditarItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.ITEMS);
  if (!ok) redirect("/dashboard");
  const item = await db.itemServicio.findUnique({ where: { id } });
  if (!item) notFound();
  return <ItemForm item={{ ...item, precioUnitario: Number(item.precioUnitario) }} />;
}
