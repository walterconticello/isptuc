"use client";

import { useState, useEffect } from "react";

interface CompanyForm {
  nombre: string;
  cuit: string;
  direccion: string;
  telefono: string;
  email: string;
  logoUrl: string;
}

const emptyForm: CompanyForm = { nombre: "", cuit: "", direccion: "", telefono: "", email: "", logoUrl: "" };

export default function ConfiguracionPage() {
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    fetch("/api/company")
      .then((r) => r.json())
      .then((data) => {
        if (data) setForm({ nombre: data.nombre, cuit: data.cuit, direccion: data.direccion ?? "", telefono: data.telefono ?? "", email: data.email ?? "", logoUrl: data.logoUrl ?? "" });
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch("/api/company", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Configuración de la empresa</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSave} className="space-y-4">
          {[
            { field: "nombre", label: "Nombre de la empresa *", type: "text" },
            { field: "cuit", label: "CUIT *", type: "text", placeholder: "30-12345678-9" },
            { field: "direccion", label: "Dirección", type: "text" },
            { field: "telefono", label: "Teléfono", type: "text" },
            { field: "email", label: "Email", type: "email" },
          ].map(({ field, label, type, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} value={form[field as keyof CompanyForm]}
                onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL del Logo</label>
            <input type="url" value={form.logoUrl}
              onChange={(e) => { setLogoError(false); setForm((p) => ({ ...p, logoUrl: e.target.value })); }}
              placeholder="https://i.imgur.com/abc123.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="text-xs text-gray-500 mt-1">
              Usá la URL <strong>directa</strong> a la imagen (termina en .jpg, .png, etc.).
              En Imgur: abrí la imagen, clic derecho → "Copiar dirección de imagen" para obtener la URL que empieza con <code className="bg-gray-100 px-1 rounded">i.imgur.com</code>.
            </p>
          </div>

          {form.logoUrl && (
            <div className="mt-2">
              {logoError ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  No se pudo cargar la imagen. Verificá que la URL apunte directamente al archivo (ej: <code className="bg-red-100 px-1 rounded">i.imgur.com/abc.jpg</code>).
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.logoUrl}
                  alt="Preview logo"
                  onError={() => setLogoError(true)}
                  className="h-16 object-contain border border-gray-200 rounded-lg p-2"
                />
              )}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving || !form.nombre || !form.cuit}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            {saved && <span className="text-sm text-green-600 font-medium">✓ Guardado correctamente</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
