import type { OnuCruda } from "./parse-arrays";

// Contrato de una "fuente" de datos de una OLT. Hoy se implementa PANEL (web que
// ya scrapea la OLT); a futuro SNMP/TELNET implementan la misma interfaz, así la
// sincronización (`sincronizarOnus`) y la vista no cambian al sumar OLTs.
export interface FuenteDatos {
  /** Lee las ONUs (crudas, normalizadas) de la OLT. Lanza si no puede leer. */
  leerOnus(): Promise<OnuCruda[]>;
}
