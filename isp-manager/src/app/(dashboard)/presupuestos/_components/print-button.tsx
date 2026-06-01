"use client";

import { Printer } from "lucide-react";

/** Botón de impresión: dispara el diálogo nativo (Imprimir / Guardar como PDF). */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
    >
      <Printer className="h-4 w-4" /> Imprimir / PDF
    </button>
  );
}
