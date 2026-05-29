import { format } from "date-fns";
import { es } from "date-fns/locale";
import { calcularFontSizeItems } from "@/modules/presupuestos/font-size";

/**
 * Documento WYSIWYG de presupuesto (estilo factura imprimible).
 *
 * El documento ES la pantalla: usa colores fijos (fondo blanco / tinta oscura)
 * para que el PDF se vea bien en cualquier tema, y variantes `print:` para
 * quedar limpio al imprimir. Este archivo concentra las piezas compartidas
 * entre el editor (alta) y la vista de detalle: el shell de la hoja, el
 * encabezado de empresa y los formateadores.
 */

export interface EmpresaDoc {
  nombre: string;
  cuit: string;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  logoUrl?: string | null;
}

export interface ClienteDoc {
  nombre: string;
  cuit?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
}

export interface LineaDoc {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

/** Formatea un importe en pesos argentinos con dos decimales. */
export function fmtMoneda(n: number): string {
  return `$${n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Formatea una fecha como dd/MM/yyyy en español. */
export function fmtFecha(date: Date): string {
  return format(date, "dd/MM/yyyy", { locale: es });
}

/** Hoja blanca con bordes/sombra en pantalla y limpia al imprimir. */
export function DocumentoShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-6 text-gray-900 shadow-sm sm:p-10 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
      {children}
    </div>
  );
}

/** Encabezado: logo + datos de empresa a la izquierda, "PRESUPUESTO N°" + fechas a la derecha. */
export function EmpresaEncabezado({
  empresa,
  numero,
  fechaEmision,
  fechaVencimiento,
}: {
  empresa: EmpresaDoc | null;
  numero?: number;
  fechaEmision: Date;
  fechaVencimiento: Date;
}) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4 print:mb-6">
      <div>
        {empresa?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={empresa.logoUrl} alt={`Logo de ${empresa.nombre}`} className="mb-2 h-16 object-contain" />
        ) : (
          <div className="mb-2 flex h-16 w-32 items-center justify-center rounded bg-gray-100 text-xs text-gray-400 print:hidden">
            Sin logo
          </div>
        )}
        <p className="text-lg font-bold text-gray-900">{empresa?.nombre ?? "Tu empresa"}</p>
        <p className="text-sm text-gray-600">CUIT: {empresa?.cuit ?? "—"}</p>
        {empresa?.direccion && <p className="text-sm text-gray-500">{empresa.direccion}</p>}
        {empresa?.telefono && <p className="text-sm text-gray-500">Tel: {empresa.telefono}</p>}
        {empresa?.email && <p className="text-sm text-gray-500">{empresa.email}</p>}
      </div>

      <div className="text-right">
        <p className="text-2xl font-bold text-gray-900">PRESUPUESTO</p>
        {numero !== undefined && (
          <p className="text-sm text-gray-500">N° {String(numero).padStart(4, "0")}</p>
        )}
        <p className="mt-2 text-sm text-gray-500">Fecha: {fmtFecha(fechaEmision)}</p>
        <p className="text-sm text-gray-500">Válido hasta: {fmtFecha(fechaVencimiento)}</p>
      </div>
    </div>
  );
}

const ESTADO_LABEL: Record<string, string> = {
  BORRADOR: "Borrador",
  ENVIADO: "Enviado",
  ACEPTADO: "Aceptado",
  RECHAZADO: "Rechazado",
};

interface PresupuestoDocumentoProps {
  empresa: EmpresaDoc | null;
  cliente: ClienteDoc;
  lineas: LineaDoc[];
  numero?: number;
  estado?: string;
  fechaEmision: Date;
  fechaVencimiento: Date;
  validezDias: number;
  subtotal: number;
  ivaPorcentaje: number;
  ivaImporte: number;
  total: number;
  notas?: string | null;
}

/**
 * Render de solo lectura del documento (vista de detalle / impresión).
 * El editor de alta arma su propia versión editable reutilizando las piezas
 * exportadas arriba; este componente cubre el caso ya guardado.
 */
export function PresupuestoDocumento({
  empresa,
  cliente,
  lineas,
  numero,
  estado,
  fechaEmision,
  fechaVencimiento,
  validezDias,
  subtotal,
  ivaPorcentaje,
  ivaImporte,
  total,
  notas,
}: PresupuestoDocumentoProps) {
  const itemFontPx = calcularFontSizeItems(lineas.length);

  return (
    <DocumentoShell>
      <EmpresaEncabezado
        empresa={empresa}
        numero={numero}
        fechaEmision={fechaEmision}
        fechaVencimiento={fechaVencimiento}
      />

      <hr className="mb-6 border-gray-200" />

      {/* Cliente */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Cliente</p>
          {estado && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 print:hidden">
              {ESTADO_LABEL[estado] ?? estado}
            </span>
          )}
        </div>
        <p className="font-medium text-gray-900">{cliente.nombre}</p>
        {cliente.cuit && <p className="text-sm text-gray-500">CUIT: {cliente.cuit}</p>}
        {cliente.direccion && <p className="text-sm text-gray-500">{cliente.direccion}</p>}
        {cliente.telefono && <p className="text-sm text-gray-500">Tel: {cliente.telefono}</p>}
      </div>

      {/* Ítems — el tamaño de letra se auto-ajusta según la cantidad de líneas */}
      <div className="mb-6" style={{ fontSize: `${itemFontPx}px` }}>
        <div className="mb-1 flex gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <span className="flex-1">Descripción</span>
          <span className="w-20 text-right">Cant.</span>
          <span className="w-28 text-right">Precio unit.</span>
          <span className="w-28 text-right">Subtotal</span>
        </div>
        <hr className="mb-2 border-gray-200" />
        <div className="space-y-1">
          {lineas.map((linea, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="flex-1 text-gray-900">{linea.descripcion}</span>
              <span className="w-20 text-right text-gray-600">{linea.cantidad}</span>
              <span className="w-28 text-right text-gray-600">{fmtMoneda(linea.precioUnitario)}</span>
              <span className="w-28 text-right font-medium text-gray-900">{fmtMoneda(linea.subtotal)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Totales */}
      <div className="mb-6 flex justify-end">
        <div className="w-64 space-y-1">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{fmtMoneda(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>IVA {ivaPorcentaje}%</span>
            <span>{fmtMoneda(ivaImporte)}</span>
          </div>
          <hr className="border-gray-200" />
          <div className="flex justify-between font-bold text-gray-900">
            <span>TOTAL</span>
            <span>{fmtMoneda(total)}</span>
          </div>
        </div>
      </div>

      {/* Validez */}
      <p className="mb-4 text-xs text-gray-500">
        Validez: {validezDias} días — Este presupuesto es válido hasta el {fmtFecha(fechaVencimiento)}.
      </p>

      {/* Notas */}
      {notas && <p className="whitespace-pre-line text-sm text-gray-600">{notas}</p>}
    </DocumentoShell>
  );
}
