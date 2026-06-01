import { z } from "zod";

// Contraseñas de ejemplo conocidas que nunca deben usarse como credencial real.
const PASSWORDS_INSEGUROS = new Set(["admin123", "password", "12345678"]);

const credencialesSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .refine((p) => !PASSWORDS_INSEGUROS.has(p), {
      message: "contraseña insegura",
    }),
});

export interface CredencialesAdmin {
  email: string;
  password: string;
}

/**
 * Resuelve las credenciales del admin inicial del seed desde el entorno.
 * No tiene valores por defecto: si faltan o son inseguras, falla con un mensaje
 * claro. Cierra el hallazgo S2 (admin sembrado con contraseña débil hardcodeada).
 */
export function getCredencialesAdminSeed(
  env: Record<string, string | undefined> = process.env
): CredencialesAdmin {
  const parsed = credencialesSchema.safeParse({
    email: env.SEED_ADMIN_EMAIL,
    password: env.SEED_ADMIN_PASSWORD,
  });

  if (!parsed.success) {
    throw new Error(
      "Credenciales del admin del seed faltantes o inválidas. Definí SEED_ADMIN_EMAIL " +
        "(email válido) y SEED_ADMIN_PASSWORD (mínimo 8 caracteres, no un valor de ejemplo) " +
        "en tu entorno antes de correr `npm run db:seed`."
    );
  }

  return parsed.data;
}
