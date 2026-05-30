"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPresupuesto } from "@/modules/presupuestos/actions";
import { calcularFontSizeItems } from "@/modules/presupuestos/font-size";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import Combobox from "./combobox";
import CrearClienteModal, { type ClienteNuevo } from "./crear-cliente-modal";
import CrearItemModal, { type ItemNuevo } from "./crear-item-modal";
import {
  DocumentoShell,
  EmpresaEncabezado,
  fmtFecha,
  fmtMoneda,
  type EmpresaDoc,
} from "./presupuesto-documento";

interface Cliente {
  id: string;
  nombre: string;
  cuit?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
}
interface Item {
  id: string;
  descripcion: string;
  precioUnitario: number | string;
  unidad: string;
  codigo?: string | null;
}
interface Linea {
  id: string;
  itemServicioId?: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

interface Props {
  clientes: Cliente[];
  items: Item[];
  empresa: EmpresaDoc | null;
  ivaPorcentajeDefault: number;
}

let nextId = 1;
function uid() {
  return String(nextId++);
}

function nuevaLinea(): Linea {
  return { id: uid(), descripcion: "", cantidad: 1, precioUnitario: 0 };
}

export default function PresupuestoEditor({ clientes: clientesIniciales, items: itemsIniciales, empresa, ivaPorcentajeDefault }: Props) {
  const router = useRouter();
  // Listas locales: se amplían en vivo al crear cliente/ítem desde el combobox.
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciales);
  const [items, setItems] = useState<Item[]>(itemsIniciales);
  const [clienteId, setClienteId] = useState("");
  // query del "+ Crear" pendiente (null = modal cerrado).
  const [crearClienteQuery, setCrearClienteQuery] = useState<string | null>(null);
  const [crearItem, setCrearItem] = useState<{ lineId: string; query: string } | null>(null);
  const [validezDias, setValidezDias] = useState(15);
  const [ivaPorcentaje, setIvaPorcentaje] = useState(ivaPorcentajeDefault);
  const [notas, setNotas] = useState("");
  const [lineas, setLineas] = useState<Linea[]>([nuevaLinea()]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cliente = clientes.find((c) => c.id === clienteId) ?? null;
  const opcionesCliente = clientes.map((c) => ({ value: c.id, label: c.nombre, sublabel: c.cuit ?? undefined }));

  function onClienteCreado(nuevo: ClienteNuevo) {
    setClientes((prev) => [...prev, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    setClienteId(nuevo.id);
    setCrearClienteQuery(null);
  }

  const opcionesItem = items.map((i) => ({
    value: i.id,
    label: i.descripcion,
    sublabel: `${i.codigo ? `${i.codigo} · ` : ""}${fmtMoneda(Number(i.precioUnitario))}`,
  }));

  function onItemCreado(lineId: string, nuevo: ItemNuevo) {
    setItems((prev) => [...prev, nuevo].sort((a, b) => a.descripcion.localeCompare(b.descripcion)));
    setLineas((prev) =>
      prev.map((l) =>
        l.id === lineId
          ? { ...l, itemServicioId: nuevo.id, descripcion: nuevo.descripcion, precioUnitario: nuevo.precioUnitario }
          : l,
      ),
    );
    setCrearItem(null);
  }

  const subtotal = lineas.reduce((s, l) => s + l.cantidad * l.precioUnitario, 0);
  const ivaImporte = subtotal * (ivaPorcentaje / 100);
  const total = subtotal + ivaImporte;
  const itemFontPx = calcularFontSizeItems(lineas.length);

  // Fecha de emisión estable durante la edición; vencimiento derivado de la validez.
  const hoy = useMemo(() => new Date(), []);
  const vencimiento = useMemo(() => {
    const d = new Date(hoy);
    d.setDate(d.getDate() + validezDias);
    return d;
  }, [hoy, validezDias]);

  function addLinea() {
    setLineas((prev) => [...prev, nuevaLinea()]);
  }

  function removeLinea(id: string) {
    setLineas((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  }

  function updateLinea(id: string, field: keyof Omit<Linea, "id">, value: string | number) {
    setLineas((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        if (field === "itemServicioId") {
          const item = items.find((i) => i.id === value);
          return item
            ? { ...l, itemServicioId: item.id, descripcion: item.descripcion, precioUnitario: Number(item.precioUnitario) }
            : { ...l, itemServicioId: undefined, descripcion: "", precioUnitario: 0 };
        }
        return { ...l, [field]: value };
      }),
    );
  }

  async function handleSave() {
    setError(null);
    if (!clienteId) {
      setError("Seleccioná un cliente");
      return;
    }
    const lineasValidas = lineas.filter((l) => l.descripcion.trim());
    if (!lineasValidas.length) {
      setError("Agregá al menos un ítem con descripción");
      return;
    }
    setLoading(true);

    const data = {
      clienteId,
      validezDias,
      notas,
      ivaPorcentaje,
      lineas: lineasValidas.map((l, i) => ({
        itemServicioId: l.itemServicioId,
        descripcionCustom: l.itemServicioId ? undefined : l.descripcion,
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario,
        orden: i + 1,
      })),
    };

    const result = await createPresupuesto(data);
    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push(`/presupuestos/${result.data.id}`);
  }

  return (
    <div className="space-y-4">
      {/* Barra de controles — oculta al imprimir */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/presupuestos" className="text-muted-foreground hover:text-foreground" aria-label="Volver a presupuestos">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">Nuevo presupuesto</h1>
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-sm text-destructive">{error}</span>}
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar presupuesto"}
          </button>
        </div>
      </div>

      {/* Documento WYSIWYG editable */}
      <DocumentoShell>
        <EmpresaEncabezado empresa={empresa} fechaEmision={hoy} fechaVencimiento={vencimiento} />

        <hr className="mb-6 border-gray-200" />

        {/* Cliente */}
        <div className="mb-6">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Cliente
          </span>
          <Combobox
            ariaLabel="Cliente"
            className="max-w-sm print:hidden"
            opciones={opcionesCliente}
            value={clienteId}
            onSelect={setClienteId}
            onCrear={(q) => setCrearClienteQuery(q)}
            placeholder="Buscá o creá un cliente..."
          />
          {cliente && (
            <div className="mt-2 print:mt-0">
              <p className="font-medium text-gray-900">{cliente.nombre}</p>
              {cliente.cuit && <p className="text-sm text-gray-500">CUIT: {cliente.cuit}</p>}
              {cliente.direccion && <p className="text-sm text-gray-500">{cliente.direccion}</p>}
              {cliente.telefono && <p className="text-sm text-gray-500">Tel: {cliente.telefono}</p>}
            </div>
          )}
        </div>

        {/* Ítems — el tamaño de letra se auto-ajusta según la cantidad de líneas */}
        <div className="mb-6" style={{ fontSize: `${itemFontPx}px` }}>
          <div className="mb-1 flex gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <span className="flex-1">Descripción</span>
            <span className="w-20 text-right">Cant.</span>
            <span className="w-28 text-right">Precio unit.</span>
            <span className="w-28 text-right">Subtotal</span>
            <span className="w-8 print:hidden" />
          </div>
          <hr className="mb-2 border-gray-200" />

          <div className="space-y-1">
            {lineas.map((linea, idx) => (
              <div key={linea.id} className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                  <Combobox
                    ariaLabel={`Ítem ${idx + 1}`}
                    className="print:hidden"
                    inputClassName="w-full rounded border border-gray-200 bg-white px-2 py-1 text-gray-900 outline-none focus:ring-1 focus:ring-blue-500"
                    opciones={opcionesItem}
                    value={linea.itemServicioId ?? ""}
                    onSelect={(v) => updateLinea(linea.id, "itemServicioId", v)}
                    onCrear={(q) => setCrearItem({ lineId: linea.id, query: q })}
                    placeholder="Buscá, escribí o creá un ítem..."
                  />
                  {linea.itemServicioId ? (
                    <>
                      {/* En pantalla alcanza con el combobox; el <p> es para la impresión. */}
                      <p className="hidden text-gray-900 print:block">{linea.descripcion}</p>
                      <button
                        type="button"
                        onClick={() => updateLinea(linea.id, "itemServicioId", "")}
                        className="text-xs text-gray-400 hover:text-gray-600 print:hidden"
                      >
                        Usar descripción libre
                      </button>
                    </>
                  ) : (
                    <input
                      value={linea.descripcion}
                      onChange={(e) => updateLinea(linea.id, "descripcion", e.target.value)}
                      placeholder="Descripción del ítem"
                      className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-gray-900 outline-none focus:ring-1 focus:ring-blue-500 print:border-0 print:px-0"
                    />
                  )}
                </div>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  aria-label={`Cantidad ítem ${idx + 1}`}
                  value={linea.cantidad}
                  onChange={(e) => updateLinea(linea.id, "cantidad", Number(e.target.value))}
                  className="w-20 rounded border border-gray-200 bg-white px-2 py-1 text-right text-gray-900 outline-none focus:ring-1 focus:ring-blue-500 print:border-0 print:px-0"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  aria-label={`Precio unitario ítem ${idx + 1}`}
                  value={linea.precioUnitario}
                  onChange={(e) => updateLinea(linea.id, "precioUnitario", Number(e.target.value))}
                  className="w-28 rounded border border-gray-200 bg-white px-2 py-1 text-right text-gray-900 outline-none focus:ring-1 focus:ring-blue-500 print:border-0 print:px-0"
                />
                <span className="w-28 pt-1 text-right font-medium text-gray-900">
                  {fmtMoneda(linea.cantidad * linea.precioUnitario)}
                </span>
                <button
                  type="button"
                  onClick={() => removeLinea(linea.id)}
                  disabled={lineas.length === 1}
                  aria-label={`Eliminar ítem ${idx + 1}`}
                  className="flex w-8 items-center justify-center pt-1 text-gray-400 hover:text-destructive disabled:opacity-30 print:hidden"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addLinea}
            className="mt-3 flex items-center gap-1 text-sm text-blue-600 hover:underline print:hidden"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar línea
          </button>
        </div>

        {/* Totales */}
        <div className="mb-6 flex justify-end">
          <div className="w-64 space-y-1">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{fmtMoneda(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span className="flex items-center gap-1">
                IVA
                <select
                  aria-label="Porcentaje de IVA"
                  value={ivaPorcentaje}
                  onChange={(e) => setIvaPorcentaje(Number(e.target.value))}
                  className="ml-1 rounded border border-gray-200 bg-white px-1 py-0.5 text-xs text-gray-900 print:hidden"
                >
                  <option value={0}>0%</option>
                  <option value={10.5}>10.5%</option>
                  <option value={21}>21%</option>
                  <option value={27}>27%</option>
                </select>
                <span className="hidden print:inline">{ivaPorcentaje}%</span>
              </span>
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
        <div className="mb-4 text-xs text-gray-500">
          <span className="flex flex-wrap items-center gap-1">
            Validez:
            <select
              aria-label="Validez en días"
              value={validezDias}
              onChange={(e) => setValidezDias(Number(e.target.value))}
              className="ml-1 rounded border border-gray-200 bg-white px-1 py-0.5 text-xs text-gray-900 print:hidden"
            >
              <option value={10}>10 días</option>
              <option value={15}>15 días</option>
              <option value={30}>30 días</option>
            </select>
            <span className="hidden print:inline">{validezDias} días</span>
            — Este presupuesto es válido hasta el {fmtFecha(vencimiento)}.
          </span>
        </div>

        {/* Notas */}
        <div>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Notas adicionales (condiciones de pago, observaciones...)"
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 outline-none focus:ring-1 focus:ring-blue-500 print:hidden"
          />
          {notas && <p className="hidden whitespace-pre-line text-sm text-gray-600 print:block">{notas}</p>}
        </div>
      </DocumentoShell>

      {crearClienteQuery !== null && (
        <CrearClienteModal
          nombreInicial={crearClienteQuery}
          onClose={() => setCrearClienteQuery(null)}
          onCreado={onClienteCreado}
        />
      )}

      {crearItem && (
        <CrearItemModal
          descripcionInicial={crearItem.query}
          onClose={() => setCrearItem(null)}
          onCreado={(item) => onItemCreado(crearItem.lineId, item)}
        />
      )}
    </div>
  );
}
