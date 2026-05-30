"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { filtrarOpciones, debeMostrarCrear, type OpcionCombobox } from "./combobox-filtro";

interface Props {
  opciones: OpcionCombobox[];
  value: string;
  onSelect: (value: string) => void;
  /** Si se pasa, ofrece «+ Crear «texto»» cuando no hay coincidencia exacta. */
  onCrear?: (query: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  inputClassName?: string;
}

const inputBase =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500";

export default function Combobox({
  opciones,
  value,
  onSelect,
  onCrear,
  placeholder,
  ariaLabel,
  className,
  inputClassName,
}: Props) {
  const [query, setQuery] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const seleccionada = opciones.find((o) => o.value === value) ?? null;
  const filtradas = filtrarOpciones(opciones, query);
  const ofrecerCrear = !!onCrear && debeMostrarCrear(opciones, query);
  // Filas navegables: opciones + (opcional) la fila "crear" al final.
  const totalFilas = filtradas.length + (ofrecerCrear ? 1 : 0);

  // Cerrar al hacer click fuera.
  useEffect(() => {
    if (!abierto) return;
    function onClickFuera(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, [abierto]);

  function abrir() {
    setAbierto(true);
    setActivo(0);
  }

  function elegir(opcion: OpcionCombobox) {
    onSelect(opcion.value);
    setQuery("");
    setAbierto(false);
  }

  function crear() {
    onCrear?.(query.trim());
    setQuery("");
    setAbierto(false);
  }

  function ejecutarFila(indice: number) {
    if (indice < filtradas.length) elegir(filtradas[indice]);
    else if (ofrecerCrear) crear();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!abierto) return abrir();
      setActivo((i) => (totalFilas ? (i + 1) % totalFilas : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!abierto) return abrir();
      setActivo((i) => (totalFilas ? (i - 1 + totalFilas) % totalFilas : 0));
    } else if (e.key === "Enter") {
      if (abierto && totalFilas) {
        e.preventDefault();
        ejecutarFila(activo);
      }
    } else if (e.key === "Escape") {
      setAbierto(false);
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <input
        type="text"
        role="combobox"
        aria-expanded={abierto}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label={ariaLabel}
        value={abierto ? query : seleccionada?.label ?? ""}
        placeholder={placeholder}
        onFocus={abrir}
        onChange={(e) => {
          setQuery(e.target.value);
          setActivo(0);
          setAbierto(true);
        }}
        onKeyDown={onKeyDown}
        className={inputClassName ?? inputBase}
      />

      {abierto && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {filtradas.map((opcion, idx) => (
            <li key={opcion.value} role="option" aria-selected={idx === activo}>
              <button
                type="button"
                tabIndex={-1}
                onMouseEnter={() => setActivo(idx)}
                onClick={() => elegir(opcion)}
                className={`flex w-full flex-col items-start px-3 py-2 text-left text-sm ${
                  idx === activo ? "bg-blue-50 text-blue-700" : "text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span>{opcion.label}</span>
                {opcion.sublabel && <span className="text-xs text-gray-400">{opcion.sublabel}</span>}
              </button>
            </li>
          ))}

          {ofrecerCrear && (
            <li role="option" aria-selected={activo === filtradas.length}>
              <button
                type="button"
                tabIndex={-1}
                onMouseEnter={() => setActivo(filtradas.length)}
                onClick={crear}
                className={`flex w-full items-center gap-1.5 border-t border-gray-100 px-3 py-2 text-left text-sm font-medium ${
                  activo === filtradas.length ? "bg-blue-50 text-blue-700" : "text-blue-600 hover:bg-gray-50"
                }`}
              >
                <Plus className="h-3.5 w-3.5" /> Crear «{query.trim()}»
              </button>
            </li>
          )}

          {!filtradas.length && !ofrecerCrear && (
            <li className="px-3 py-2 text-sm text-gray-400">Sin resultados</li>
          )}
        </ul>
      )}
    </div>
  );
}
