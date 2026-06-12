import "server-only";

// Cliente HTTP de la API de WisPro. Auth por header `Authorization: <API Token>`.
// La API responde { data, meta: { pagination: { total_pages } }, status }.

const URL_BASE = process.env.WISPRO_API_URL ?? "https://www.cloud.wispro.co/api/v1";
const TOKEN = process.env.WISPRO_API_TOKEN ?? "";

interface Pagina<T> {
  data?: T[];
  meta?: { pagination?: { total_pages?: number; total_records?: number } };
  status?: number;
}

async function getPaginado<T>(recurso: string, perPage = 100, maxPaginas = 100): Promise<T[]> {
  if (!TOKEN) throw new Error("Falta WISPRO_API_TOKEN en .env.");
  const out: T[] = [];
  let page = 1;
  let totalPaginas = 1;
  do {
    const res = await fetch(`${URL_BASE}/${recurso}?per_page=${perPage}&page=${page}`, {
      headers: { Authorization: TOKEN, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`WisPro ${recurso}: HTTP ${res.status}.`);
    const json = (await res.json()) as Pagina<T>;
    if (Array.isArray(json.data)) out.push(...json.data);
    totalPaginas = json.meta?.pagination?.total_pages ?? 1;
    page++;
  } while (page <= totalPaginas && page <= maxPaginas);
  return out;
}

// Solo los campos que usamos del contrato (el objeto trae muchos más).
export interface ContratoRaw {
  public_id: number;
  client_id?: string | null;
  state?: string | null;
  ip?: string | null;
  pppoe_username?: string | null;
  plan_id?: string | null;
  address_street?: string | null;
  address_number?: string | null;
  address_city?: string | null;
}

export interface ClienteRaw {
  id: string;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

export const getContratos = () => getPaginado<ContratoRaw>("contracts");
export const getClientesWispro = () => getPaginado<ClienteRaw>("clients");

/** Nombre legible de un cliente WisPro a partir de sus campos posibles. */
export function nombreCliente(c: ClienteRaw): string | null {
  if (c.name && c.name.trim()) return c.name.trim();
  const compuesto = [c.first_name, c.last_name].filter(Boolean).join(" ").trim();
  return compuesto || null;
}
