// Valores de ejemplo que nunca deben usarse como secreto real en producción.
const SECRETOS_INSEGUROS = new Set([
  "isp-manager-dev-secret-2026",
  "cambia-esto-por-un-secreto-seguro",
]);

const LONGITUD_MINIMA = 32;

/**
 * Verifica que el secreto de sesión sea seguro. Solo es estricto en producción:
 * ahí un secreto débil o ausente permitiría forjar tokens de sesión (incluido el
 * rol DUENO). Fuera de producción no interrumpe el arranque local.
 *
 * Generá uno con: `openssl rand -base64 32`.
 */
export function assertSecretValido(secret: string | undefined, nodeEnv: string): void {
  if (nodeEnv !== "production") return;

  if (!secret || secret.trim().length === 0) {
    throw new Error(
      "NEXTAUTH_SECRET no está definido. Generá uno con `openssl rand -base64 32`."
    );
  }

  if (SECRETOS_INSEGUROS.has(secret)) {
    throw new Error(
      "NEXTAUTH_SECRET usa un valor de ejemplo inseguro. Generá uno único con `openssl rand -base64 32`."
    );
  }

  if (secret.length < LONGITUD_MINIMA) {
    throw new Error(
      `NEXTAUTH_SECRET es demasiado corto (mínimo ${LONGITUD_MINIMA} caracteres).`
    );
  }
}
