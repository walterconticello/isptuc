import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { Modulo } from "@/generated/prisma/enums";
import { Shield, Building2, ScrollText } from "lucide-react";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ok = await checkPermission(session.user.id, Modulo.ADMIN);
  if (!ok) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Administración</h1>
        <p className="text-sm text-muted-foreground">Configuración del sistema</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminCard
          href="/admin/permisos"
          icon={<Shield className="h-6 w-6" />}
          title="Permisos y Roles"
          description="Configurá qué módulos puede ver cada rol"
        />
        <AdminCard
          href="/admin/empresa"
          icon={<Building2 className="h-6 w-6" />}
          title="Datos de la Empresa"
          description="Nombre, CUIT, logo y datos de contacto"
        />
        <AdminCard
          href="/admin/auditoria"
          icon={<ScrollText className="h-6 w-6" />}
          title="Auditoría del sistema"
          description="Registro completo de todas las acciones realizadas"
        />
      </div>
    </div>
  );
}

function AdminCard({
  href, icon, title, description,
}: {
  href: string; icon: React.ReactNode; title: string; description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 rounded-lg border bg-card p-5 hover:bg-accent/50 transition-colors"
    >
      <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}
