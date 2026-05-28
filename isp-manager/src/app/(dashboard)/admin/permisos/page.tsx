import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getPermisosMatrix } from "@/modules/admin/actions";
import { Modulo, Rol } from "@/generated/prisma/enums";
import { ROL_LABEL } from "@/lib/labels";
import PermisosTable from "./table";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

const MODULO_LABEL: Record<Modulo, string> = {
  DASHBOARD:    "Dashboard",
  EMPLEADOS:    "Empleados",
  FLOTA:        "Flota",
  COMBUSTIBLE:  "Combustible",
  CUADRILLAS:   "Cuadrillas",
  PRESUPUESTOS: "Presupuestos",
  CLIENTES:     "Clientes",
  ITEMS:        "Items",
  STOCK:        "Stock",
  ADMIN:        "Administración",
};

export default async function PermisosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ok = await checkPermission(session.user.id, Modulo.ADMIN);
  if (!ok) redirect("/dashboard");

  const result = await getPermisosMatrix();
  if (!result.success) redirect("/admin");

  const roles = Object.values(Rol);
  const modulos = Object.values(Modulo);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Permisos por Rol</h1>
          <p className="text-sm text-muted-foreground">
            Activá o desactivá el acceso a cada módulo por rol
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <PermisosTable
          matrix={result.data}
          roles={roles}
          modulos={modulos}
          rolesLabel={ROL_LABEL}
          modulosLabel={MODULO_LABEL}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        * El rol Dueño siempre tiene acceso a Administración y no se puede desactivar.
      </p>
    </div>
  );
}
