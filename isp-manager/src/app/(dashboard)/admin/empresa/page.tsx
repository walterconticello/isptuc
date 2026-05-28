import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { Modulo } from "@/generated/prisma/client";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function EmpresaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ok = await checkPermission(session.user.id, Modulo.ADMIN);
  if (!ok) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold">Datos de la Empresa</h1>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground text-sm">Configuración de empresa — disponible en Fase 5.</p>
      </div>
    </div>
  );
}
