"use client";

import { useState, useEffect, useRef } from "react";
import { calcularSubtotalLinea, formatCurrency } from "@/lib/calculations";

export interface LineaItem {
  id: string;
  itemId?: string;
  descripcionCustom?: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  orden: number;
}

interface ItemResult {
  id: string;
  descripcion: string;
  precioUnitario: number | string;
  codigo?: string | null;
  unidad: string;
}

interface Props {
  linea: LineaItem;
  onChange: (linea: LineaItem) => void;
  onRemove: () => void;
}

function parseAR(value: string): number {
  const n = parseFloat(value.replace(/\./g, "").replace(",", "."));
  return isNaN(n) ? 0 : n;
}

export function ItemLine({ linea, onChange, onRemove }: Props) {
  const [query, setQuery] = useState(linea.descripcion);
  const [results, setResults] = useState<ItemResult[]>([]);
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newForm, setNewForm] = useState({ descripcion: "", precioUnitario: "", unidad: "unidad", codigo: "" });
  const [cantidadStr, setCantidadStr] = useState(linea.descripcion ? String(linea.cantidad) : "");
  const [precioStr, setPrecioStr] = useState(linea.descripcion ? String(linea.precioUnitario) : "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInteracted = useRef(false);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!hasInteracted.current) return;
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/items?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
      setOpen(true);
    }, 300);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function updateCantidad(v: number) {
    const subtotal = calcularSubtotalLinea(v, linea.precioUnitario);
    onChange({ ...linea, cantidad: v, subtotal });
  }

  function updatePrecio(v: number) {
    const subtotal = calcularSubtotalLinea(linea.cantidad, v);
    onChange({ ...linea, precioUnitario: v, subtotal });
  }

  function selectItem(item: ItemResult) {
    const precio = Number(item.precioUnitario);
    const subtotal = calcularSubtotalLinea(linea.cantidad, precio);
    onChange({ ...linea, itemId: item.id, descripcion: item.descripcion, descripcionCustom: undefined, precioUnitario: precio, subtotal });
    setQuery(item.descripcion);
    setOpen(false);
    setShowCreate(false);
    setPrecioStr(String(precio));
  }

  function handleDescripcionChange(v: string) {
    hasInteracted.current = true;
    setQuery(v);
    onChange({ ...linea, descripcion: v, descripcionCustom: v, itemId: undefined });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const precio = parseAR(newForm.precioUnitario);
    if (!newForm.descripcion.trim() || precio <= 0) return;
    setCreating(true);
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion: newForm.descripcion, precioUnitario: precio, unidad: newForm.unidad, codigo: newForm.codigo || undefined }),
    });
    if (res.ok) {
      const item = await res.json();
      selectItem(item);
      setNewForm({ descripcion: "", precioUnitario: "", unidad: "unidad", codigo: "" });
    }
    setCreating(false);
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-2 items-start">
        <div ref={containerRef} className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => handleDescripcionChange(e.target.value)}
            onFocus={() => query && setOpen(true)}
            placeholder="Descripción del servicio/ítem..."
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {open && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {results.length > 0 ? results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectItem(item)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                >
                  <span className="font-medium">{item.descripcion}</span>
                  <span className="text-gray-400 ml-2 text-xs">{formatCurrency(Number(item.precioUnitario))}</span>
                </button>
              )) : (
                <div className="px-3 py-2 text-sm text-gray-500">Sin coincidencias</div>
              )}
              <button
                type="button"
                onClick={() => { setOpen(false); setShowCreate(true); setNewForm((f) => ({ ...f, descripcion: query })); }}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 border-t border-gray-100 font-medium"
              >
                + Crear ítem &ldquo;{query}&rdquo;
              </button>
            </div>
          )}
        </div>

        <input
          type="text"
          inputMode="decimal"
          value={cantidadStr}
          placeholder="1"
          onFocus={(e) => e.target.select()}
          onChange={(e) => { setCantidadStr(e.target.value); if (e.target.value !== "") updateCantidad(parseAR(e.target.value)); }}
          className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          type="text"
          inputMode="decimal"
          value={precioStr}
          placeholder="0,00"
          onFocus={(e) => e.target.select()}
          onChange={(e) => { setPrecioStr(e.target.value); if (e.target.value !== "") updatePrecio(parseAR(e.target.value)); }}
          className="w-28 px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="w-28 py-1.5 text-sm text-right text-gray-900 font-medium">
          {formatCurrency(linea.subtotal)}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="py-1.5 px-2 text-gray-400 hover:text-red-500 text-sm"
          aria-label="Eliminar línea"
        >
          ✕
        </button>
      </div>

      {showCreate && (
        <div className="ml-0 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-medium text-amber-800 mb-2">Nuevo ítem</p>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Descripción *"
              value={newForm.descripcion}
              onChange={(e) => setNewForm((f) => ({ ...f, descripcion: e.target.value }))}
              required
              className="flex-1 min-w-32 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <input
              type="text"
              inputMode="decimal"
              placeholder="Precio *"
              value={newForm.precioUnitario}
              onChange={(e) => setNewForm((f) => ({ ...f, precioUnitario: e.target.value }))}
              className="w-28 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <input
              type="text"
              placeholder="Unidad"
              value={newForm.unidad}
              onChange={(e) => setNewForm((f) => ({ ...f, unidad: e.target.value }))}
              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <button type="submit" disabled={creating} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50">
              {creating ? "..." : "Guardar"}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-3 py-1 text-sm text-gray-600">
              Cancelar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
