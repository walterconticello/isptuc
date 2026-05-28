"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClienteAutocomplete } from "@/components/cliente/ClienteAutocomplete";
import { ItemLine, LineaItem } from "@/components/item/ItemLineAutocomplete";
import { calcularTotales, formatCurrency, formatDate, calcularFechaVencimiento } from "@/lib/calculations";

interface Cliente {
  id: string;
  nombre: string;
  cuit?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
}

interface Company {
  nombre: string;
  cuit: string;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  logoUrl?: string | null;
}

interface Impuesto {
  id: string;
  nombre: string;
  porcentaje: number | string;
  esDefault: boolean;
}

interface PresupuestoData {
  id?: string;
  numero?: number;
  cliente?: Cliente;
  items?: LineaItem[];
  validezDias?: number;
  ivaPorcentaje?: number;
  notas?: string;
  estado?: string;
}

interface Props {
  company: Company | null;
  presupuesto?: PresupuestoData;
}

function makeLineaId() {
  return Math.random().toString(36).slice(2);
}

function emptyLinea(orden: number): LineaItem {
  return { id: makeLineaId(), descripcion: "", cantidad: 1, precioUnitario: 0, subtotal: 0, orden };
}

const ESTADO_LABELS: Record<string, string> = {
  BORRADOR: "Borrador",
  ENVIADO: "Enviado",
  ACEPTADO: "Aceptado",
  RECHAZADO: "Rechazado",
};

export function PresupuestoEditor({ company, presupuesto }: Props) {
  const router = useRouter();

  const [cliente, setCliente] = useState<Cliente | null>(presupuesto?.cliente ?? null);
  const [lineas, setLineas] = useState<LineaItem[]>(
    presupuesto?.items?.length ? presupuesto.items : [emptyLinea(0)]
  );
  const [validezDias, setValidezDias] = useState<number>(presupuesto?.validezDias ?? 30);
  const [ivaPorcentaje, setIvaPorcentaje] = useState<number>(presupuesto?.ivaPorcentaje ?? 21);
  const [notas, setNotas] = useState(presupuesto?.notas ?? "");
  const [estado, setEstado] = useState(presupuesto?.estado ?? "BORRADOR");
  const [impuestos, setImpuestos] = useState<Impuesto[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/impuestos")
      .then((r) => r.json())
      .then((data: Impuesto[]) => {
        setImpuestos(data);
        if (!presupuesto?.id && data.length > 0) {
          const def = data.find((i) => i.esDefault) ?? data[0];
          setIvaPorcentaje(Number(def.porcentaje));
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { subtotal, ivaImporte, total } = calcularTotales(lineas, ivaPorcentaje);
  const hoy = new Date();
  const vencimiento = calcularFechaVencimiento(hoy, validezDias);

  const addLinea = useCallback(() => {
    setLineas((prev) => [...prev, emptyLinea(prev.length)]);
  }, []);

  const updateLinea = useCallback((id: string, updated: LineaItem) => {
    setLineas((prev) => prev.map((l) => (l.id === id ? updated : l)));
  }, []);

  const removeLinea = useCallback((id: string) => {
    setLineas((prev) => prev.length > 1 ? prev.filter((l) => l.id !== id) : prev);
  }, []);

  async function handleSave() {
    if (!cliente) { setError("Selecciona un cliente"); return; }
    const lineasValidas = lineas.filter((l) => l.descripcion.trim());
    if (!lineasValidas.length) { setError("Agrega al menos un ítem con descripción"); return; }

    setSaving(true);
    setError("");

    const body = {
      clienteId: cliente.id,
      validezDias,
      ivaPorcentaje,
      notas,
      items: lineasValidas.map((l) => ({
        itemId: l.itemId,
        descripcionCustom: l.descripcionCustom ?? (l.itemId ? undefined : l.descripcion),
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario,
        orden: l.orden,
      })),
    };

    const url = presupuesto?.id ? `/api/presupuestos/${presupuesto.id}` : "/api/presupuestos";
    const method = presupuesto?.id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/presupuestos/${data.id}`);
    } else {
      setError("Error al guardar. Verificá los datos e intentá de nuevo.");
    }
    setSaving(false);
  }

  async function handleEstadoChange(nuevoEstado: string) {
    if (!presupuesto?.id) return;
    await fetch(`/api/presupuestos/${presupuesto.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    setEstado(nuevoEstado);
  }

  return (
    <div>
      {/* Controles — hidden al imprimir */}
      <div className="print:hidden flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {presupuesto?.id && (
            <select
              value={estado}
              onChange={(e) => handleEstadoChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none"
            >
              {Object.entries(ESTADO_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          )}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75v3.75h10.5v-3.75M6.75 8.25V3.75h10.5v4.5M4.5 8.25h15a.75.75 0 01.75.75v7.5a.75.75 0 01-.75.75H4.5a.75.75 0 01-.75-.75V9a.75.75 0 01.75-.75z" />
            </svg>
            Imprimir / PDF
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Guardando..." : presupuesto?.id ? "Actualizar" : "Guardar borrador"}
          </button>
        </div>
      </div>

      {/* Documento WYSIWYG */}
      <div className="bg-white border border-gray-200 rounded-xl p-10 max-w-4xl mx-auto print:border-0 print:rounded-none print:p-0 print:shadow-none">

        {/* Encabezado */}
        <div className="flex items-start justify-between mb-8 print:mb-6">
          <div>
            {company?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logoUrl} alt="Logo" className="h-16 object-contain mb-2" />
            ) : (
              <div className="h-16 w-32 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs print:hidden">
                Sin logo
              </div>
            )}
            <p className="text-lg font-bold text-gray-900">{company?.nombre ?? "Tu empresa"}</p>
            <p className="text-sm text-gray-600">CUIT: {company?.cuit ?? "—"}</p>
            {company?.direccion && <p className="text-sm text-gray-500">{company.direccion}</p>}
            {company?.telefono && <p className="text-sm text-gray-500">{company.telefono}</p>}
            {company?.email && <p className="text-sm text-gray-500">{company.email}</p>}
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">PRESUPUESTO</p>
            {presupuesto?.numero && <p className="text-gray-500 text-sm">N° {presupuesto.numero.toString().padStart(4, "0")}</p>}
            <p className="text-sm text-gray-500 mt-2">Fecha: {formatDate(hoy)}</p>
            <p className="text-sm text-gray-500">Válido hasta: {formatDate(vencimiento)}</p>
          </div>
        </div>

        <hr className="border-gray-200 mb-6" />

        {/* Cliente */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cliente</p>
          <div className="print:hidden">
            <ClienteAutocomplete value={cliente} onChange={setCliente} />
          </div>
          {cliente && (
            <div className="mt-2 print:mt-0">
              <p className="font-medium text-gray-900">{cliente.nombre}</p>
              {cliente.cuit && <p className="text-sm text-gray-500">CUIT: {cliente.cuit}</p>}
              {cliente.direccion && <p className="text-sm text-gray-500">{cliente.direccion}</p>}
            </div>
          )}
        </div>

        {/* Tabla de ítems */}
        <div className="mb-6">
          {/* Header tabla */}
          <div className="flex gap-2 mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span className="flex-1">Descripción</span>
            <span className="w-20 text-right">Cant.</span>
            <span className="w-28 text-right">Precio unit.</span>
            <span className="w-28 text-right">Subtotal</span>
            <span className="w-8 print:hidden" />
          </div>
          <hr className="border-gray-200 mb-2" />

          <div className="space-y-1">
            {lineas.map((linea) => (
              <ItemLine
                key={linea.id}
                linea={linea}
                onChange={(updated) => updateLinea(linea.id, updated)}
                onRemove={() => removeLinea(linea.id)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addLinea}
            className="print:hidden mt-3 text-sm text-blue-600 hover:underline"
          >
            + Agregar línea
          </button>
        </div>

        {/* Totales */}
        <div className="flex justify-end mb-6">
          <div className="w-64 space-y-1">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 items-center">
              <span className="flex items-center gap-1">
                IVA
                <select
                  value={ivaPorcentaje}
                  onChange={(e) => setIvaPorcentaje(Number(e.target.value))}
                  className="print:hidden ml-1 text-xs border border-gray-200 rounded px-1 py-0.5"
                >
                  {impuestos.length > 0 ? impuestos.map((imp) => (
                    <option key={imp.id} value={Number(imp.porcentaje)}>
                      {imp.nombre} ({Number(imp.porcentaje)}%)
                    </option>
                  )) : (
                    <>
                      <option value={0}>0%</option>
                      <option value={10.5}>10.5%</option>
                      <option value={21}>21%</option>
                    </>
                  )}
                </select>
                <span className="hidden print:inline">{ivaPorcentaje}%</span>
              </span>
              <span>{formatCurrency(ivaImporte)}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between font-bold text-gray-900">
              <span>TOTAL</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Validez */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Validez:
            <select
              value={validezDias}
              onChange={(e) => setValidezDias(Number(e.target.value))}
              className="print:hidden ml-1 text-xs border border-gray-200 rounded px-1 py-0.5"
            >
              <option value={10}>10 días</option>
              <option value={15}>15 días</option>
              <option value={30}>30 días</option>
            </select>
            <span className="hidden print:inline">{validezDias} días</span>
            &nbsp;— Este presupuesto es válido hasta el {formatDate(vencimiento)}.
          </p>
        </div>

        {/* Notas */}
        <div>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Notas adicionales (condiciones de pago, observaciones...)"
            rows={3}
            className="print:hidden w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {notas && <p className="hidden print:block text-sm text-gray-600 whitespace-pre-line">{notas}</p>}
        </div>
      </div>
    </div>
  );
}
