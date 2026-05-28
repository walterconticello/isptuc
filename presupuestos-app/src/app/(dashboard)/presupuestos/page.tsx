import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/calculations";

const ESTADO_LABELS: Record<string, string> = {
  BORRADOR: "Borrador",
  ENVIADO: "Enviado",
  ACEPTADO: "Aceptado",
  RECHAZADO: "Rechazado",
};

const ESTADO_COLORS: Record<string, string> = {
  BORRADOR: "bg-gray-100 text-gray-700",
  ENVIADO: "bg-blue-100 text-blue-700",
  ACEPTADO: "bg-green-100 text-green-700",
  RECHAZADO: "bg-red-100 text-red-700",
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1"));
  const pageSize = 20;

  const [presupuestos, total] = await Promise.all([
    prisma.presupuesto.findMany({
      include: { cliente: true, creadoPor: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.presupuesto.count(),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Presupuestos</h1>
        <Link
          href="/presupuestos/nuevo"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo presupuesto
        </Link>
      </div>

      {presupuestos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-sm">No hay presupuestos todavía.</p>
          <Link href="/presupuestos/nuevo" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
            Crear el primero
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">#</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Cliente</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Fecha</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Total</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {presupuestos.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.numero}</td>
                  <td className="px-4 py-3 text-gray-700">{p.cliente.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(p.fechaEmision)}</td>
                  <td className="px-4 py-3 text-gray-900">{formatCurrency(Number(p.total))}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[p.estado]}`}>
                      {ESTADO_LABELS[p.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/presupuestos/${p.id}`} className="text-blue-600 hover:underline">
                      Ver / Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-500">{total} presupuestos</span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`?page=${page - 1}`} className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    Anterior
                  </Link>
                )}
                {page < totalPages && (
                  <Link href={`?page=${page + 1}`} className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    Siguiente
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
