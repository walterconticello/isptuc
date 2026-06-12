import "server-only";
import { parseArrays, type OnuCruda } from "./parse-arrays";
import type { FuenteDatos } from "./tipos";

// Fuente PANEL: panel web PHP que ya scrapea la OLT (ej. El Mollar). Hace login
// (campos del form: 'usuari'/'passwor' — sí, así están escritos en el HTML),
// arrastra la cookie PHPSESSID y baja el JSON de /ajax/data/arrays.txt.

export interface ConfigPanel {
  baseUrl: string;
  usuario: string;
  password: string;
}

/** Une los `Set-Cookie` recibidos en un header `Cookie` (solo "NAME=VALUE"). */
function aCookieHeader(setCookies: string[]): string {
  return setCookies.map((c) => c.split(";")[0]).join("; ");
}

/** Lee los Set-Cookie de una respuesta de forma segura entre runtimes. */
function getSetCookies(res: Response): string[] {
  const h = res.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof h.getSetCookie === "function") return h.getSetCookie();
  const raw = res.headers.get("set-cookie");
  return raw ? [raw] : [];
}

export function crearFuentePanel(cfg: ConfigPanel): FuenteDatos {
  const base = cfg.baseUrl.replace(/\/+$/, "");
  return {
    async leerOnus(): Promise<OnuCruda[]> {
      // 1) GET login para obtener la cookie de sesión.
      const r1 = await fetch(`${base}/login.php`, { redirect: "manual" });
      let cookies = getSetCookies(r1);

      // 2) POST login con los campos del formulario.
      const r2 = await fetch(`${base}/login.php`, {
        method: "POST",
        redirect: "manual",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: aCookieHeader(cookies),
        },
        body: new URLSearchParams({ usuari: cfg.usuario, passwor: cfg.password }),
      });
      const cookies2 = getSetCookies(r2);
      if (cookies2.length) cookies = cookies2;
      // Login OK = 302 hacia /index.php (no de vuelta a login).
      const destino = r2.headers.get("location") ?? "";
      if (r2.status === 302 && destino.includes("login")) {
        throw new Error("Panel: credenciales rechazadas (redirige al login).");
      }

      // 3) GET de los datos ya recolectados por el panel.
      const r3 = await fetch(`${base}/ajax/data/arrays.txt`, {
        headers: { Cookie: aCookieHeader(cookies) },
      });
      if (!r3.ok) throw new Error(`Panel: no pude leer arrays.txt (HTTP ${r3.status}).`);
      return parseArrays(await r3.text());
    },
  };
}

/** Fuente PANEL de El Mollar tomada del entorno (.env). */
export function fuentePanelMollar(): FuenteDatos {
  const baseUrl = process.env.PANEL_MOLLAR_URL;
  const usuario = process.env.PANEL_MOLLAR_USER;
  const password = process.env.PANEL_MOLLAR_PASS;
  if (!baseUrl || !usuario || !password) {
    throw new Error(
      "Faltan variables del panel El Mollar (PANEL_MOLLAR_URL/USER/PASS) en .env."
    );
  }
  return crearFuentePanel({ baseUrl, usuario, password });
}
