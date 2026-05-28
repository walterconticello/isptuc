"use client";

import { useState, useEffect, useRef } from "react";

interface Cliente {
  id: string;
  nombre: string;
  cuit?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
}

interface Props {
  value: Cliente | null;
  onChange: (cliente: Cliente) => void;
}

export function ClienteAutocomplete({ value, onChange }: Props) {
  const [query, setQuery] = useState(value?.nombre ?? "");
  const [results, setResults] = useState<Cliente[]>([]);
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newForm, setNewForm] = useState({ nombre: "", cuit: "", email: "", telefono: "", direccion: "" });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInteracted = useRef(false);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!hasInteracted.current) return;
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/clientes?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
      setOpen(true);
    }, 300);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectCliente(c: Cliente) {
    onChange(c);
    setQuery(c.nombre);
    setOpen(false);
    setShowCreate(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newForm.nombre.trim()) return;
    setCreating(true);
    const res = await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newForm),
    });
    if (res.ok) {
      const cliente = await res.json();
      selectCliente(cliente);
      setNewForm({ nombre: "", cuit: "", email: "", telefono: "", direccion: "" });
    }
    setCreating(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { hasInteracted.current = true; setQuery(e.target.value); setShowCreate(false); }}
        onFocus={() => query && setOpen(true)}
        placeholder="Buscar o escribir nombre del cliente..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {open && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {results.length > 0 ? (
            results.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCliente(c)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
              >
                <span className="font-medium">{c.nombre}</span>
                {c.cuit && <span className="text-gray-400 ml-2 text-xs">{c.cuit}</span>}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">No se encontraron clientes</div>
          )}
          <button
            type="button"
            onClick={() => { setOpen(false); setShowCreate(true); setNewForm((f) => ({ ...f, nombre: query })); }}
            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 border-t border-gray-100 font-medium"
          >
            + Crear cliente &ldquo;{query}&rdquo;
          </button>
        </div>
      )}

      {showCreate && (
        <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm font-medium text-amber-800 mb-3">Nuevo cliente</p>
          <form onSubmit={handleCreate} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Nombre *"
                value={newForm.nombre}
                onChange={(e) => setNewForm((f) => ({ ...f, nombre: e.target.value }))}
                required
                className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="CUIT"
                value={newForm.cuit}
                onChange={(e) => setNewForm((f) => ({ ...f, cuit: e.target.value }))}
                className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={newForm.email}
                onChange={(e) => setNewForm((f) => ({ ...f, email: e.target.value }))}
                className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Teléfono"
                value={newForm.telefono}
                onChange={(e) => setNewForm((f) => ({ ...f, telefono: e.target.value }))}
                className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <input
              type="text"
              placeholder="Dirección"
              value={newForm.direccion}
              onChange={(e) => setNewForm((f) => ({ ...f, direccion: e.target.value }))}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={creating}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? "Guardando..." : "Guardar cliente"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
