import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { Modulo } from "@/generated/prisma/enums";
import ItemForm from "../_components/item-form";

export default async function NuevoItemPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.ITEMS);
  if (!ok) redirect("/dashboard");
  return <ItemForm />;
}
