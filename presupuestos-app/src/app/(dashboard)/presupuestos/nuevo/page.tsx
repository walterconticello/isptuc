import { prisma } from "@/lib/db";
import { PresupuestoEditor } from "@/components/presupuesto/PresupuestoEditor";

export default async function NuevoPresupuestoPage() {
  const company = await prisma.company.findFirst();

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6 print:hidden">Nuevo presupuesto</h1>
      <PresupuestoEditor company={company} />
    </div>
  );
}
