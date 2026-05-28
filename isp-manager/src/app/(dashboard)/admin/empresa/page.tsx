import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getEmpresa } from "@/modules/admin/empresa-actions";
import { Modulo } from "@/generated/prisma/client";
import EmpresaForm from "./form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function EmpresaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await checkPermission(session.user.id, Modulo.ADMIN);
  if (!ok) redirect("/dashboard");

  const result = await getEmpresa();
  const empresa = result.success ? result.data : null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Datos de la Empresa</h1>
          <p className="text-sm text-muted-foreground">Información que aparece en presupuestos y el sistema</p>
        </div>
      </div>
      <EmpresaForm empresa={empresa} />
    </div>
  );
}
