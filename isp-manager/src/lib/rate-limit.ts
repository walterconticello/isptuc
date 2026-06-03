// Límite de intentos fallidos de login por cuenta antes de bloquear temporalmente.
export const MAX_INTENTOS_LOGIN = 10;

// Ventana de tiempo (ms) sobre la que se cuentan los intentos fallidos: 15 minutos.
export const VENTANA_LOGIN_MS = 15 * 60 * 1000;

/**
 * ¿Se alcanzó el límite de intentos fallidos? Predicado puro para frenar fuerza
 * bruta / credential stuffing sobre una cuenta. Cierra el hallazgo A4.
 */
export function superaLimiteIntentos(
  intentos: number,
  limite: number = MAX_INTENTOS_LOGIN
): boolean {
  return intentos >= limite;
}
