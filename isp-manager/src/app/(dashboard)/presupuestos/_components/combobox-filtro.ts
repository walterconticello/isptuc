/** Una opción seleccionable del combobox. `sublabel` es texto secundario buscable (CUIT, código...). */
export interface OpcionCombobox {
  value: string;
  label: string;
  sublabel?: string;
}

/** Minúsculas, sin acentos y recortado, para comparar texto sin distinguir caso ni tildes. */
export function normalizar(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Filtra opciones cuyo `label` o `sublabel` contiene la consulta.
 * Una consulta vacía (o de solo espacios) devuelve todas las opciones.
 */
export function filtrarOpciones(opciones: OpcionCombobox[], query: string): OpcionCombobox[] {
  const q = normalizar(query);
  if (!q) return opciones;
  return opciones.filter(
    (o) => normalizar(o.label).includes(q) || (o.sublabel ? normalizar(o.sublabel).includes(q) : false),
  );
}

/**
 * Indica si ofrecer «+ Crear «query»»: hay texto y ninguna opción coincide exactamente por label
 * (ignorando caso y acentos). Si ya existe una con ese nombre, no tiene sentido crear un duplicado.
 */
export function debeMostrarCrear(opciones: OpcionCombobox[], query: string): boolean {
  const q = normalizar(query);
  if (!q) return false;
  return !opciones.some((o) => normalizar(o.label) === q);
}
