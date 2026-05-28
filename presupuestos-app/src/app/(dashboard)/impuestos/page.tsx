"use client";

import { useState, useEffect, useCallback } from "react";

interface Impuesto {
  id: string;
  nombre: string;
  porcentaje: number | string;
  activo: boolean;
  esDefault: boolean;
}

interface ImpuestoFormData {
  nombre: string;
  porcentaje: string;
  esDefault: boolean;
}

const emptyForm: ImpuestoFormData = { nombre: "", porcentaje: "", esDefault: false };

function parseAR(value: string): number {
  const n = parseFloat(value.replace(/\./g, "").replace(",", "."));
  return isNaN(n) ? 0 : n;
}

export default function ImpuestosPage() {
  const [impuestos, setImpuestos] = useState<Impuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Impuesto | null>(null);
  const [form, setForm] = useState<ImpuestoFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadImpuestos = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/impuestos");
    const data = await res.json();
    setImpuestos(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadImpuestos(); }, [loadImpuestos]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEdit(imp: Impuesto) {
    setEditing(imp);
    setForm({ nombre: imp.nombre, porcentaje: String(Number(imp.porcentaje)), esDefault: imp.esDefault });
    setError("");
    setShowForm(true);
  }

  async function handleSave() {
    const porcentaje = parseAR(form.porcentaje);
    if (!form.nombre.trim()) { setError("Nombre requerido"); return; }
    if (porcentaje < 0 || porcentaje > 100) { setError("Porcentaje debe ser entre 0 y 100"); return; }

    setSaving(true);
    setError("");
    try {
      const url = editing ? `/api/impuestos/${editing.id}` : "/api/impuestos";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: form.nombre, porcentaje, esDefault: form.esDefault }),
      });
      if (res.ok) {
        setShowForm(false);
        loadImpuestos();
      } else {
        setError("Error al guardar");
      }
    } finally { setSaving(false); }
  }

  async function handleDesactivar(id: string) {
    if (!confirm("¿Desactivar este impuesto?")) return;
    await fetch(`/api/impuestos/${id}`, { method: "DELETE" });
    loadImpuestos();
  }

  async function handleSetDefault(imp: Impuesto) {
    await fetch(`/api/impuestos/${imp.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ esDefault: true }),
    });
    loadImpuestos();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Impuestos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configurá los impuestos disponibles en los presupuestos</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          + Nuevo Impuesto
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? "Editar impuesto" : "Nuevo impuesto"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  placeholder="ej. IVA 21%"
                  value={form.nombre}
                  onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje *</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={form.porcentaje}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setForm((p) => ({ ...p, porcentaje: e.target.value }))}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Usá 0 para "Sin impuesto / Exento"</p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="esDefault"
                  checked={form.esDefault}
                  onChange={(e) => setForm((p) => ({ ...p, esDefault: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <label htmlFor="esDefault" className="text-sm text-gray-700">Usar como impuesto por defecto</label>
              </div>
            </div>
            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.nombre}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />)}</div>
      ) : impuestos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-sm mb-3">No hay impuestos configurados.</p>
          <button onClick={openCreate} className="text-sm text-blue-600 hover:underline">Crear el primero</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Porcentaje</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {impuestos.map((imp) => (
                <tr key={imp.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {imp.nombre}
                    {imp.esDefault && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded font-medium">Default</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{Number(imp.porcentaje)}%</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-medium">Activo</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!imp.esDefault && (
                        <button
                          onClick={() => handleSetDefault(imp)}
                          className="px-2.5 py-1 text-xs font-medium border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors"
                        >
                          Hacer default
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(imp)}
                        className="px-2.5 py-1 text-xs font-medium border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDesactivar(imp.id)}
                        className="px-2.5 py-1 text-xs font-medium border border-red-200 text-red-600 rounded-md hover:bg-red-50 hover:border-red-300 transition-colors"
                      >
                        Desactivar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
