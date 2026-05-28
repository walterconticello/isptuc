import { Rol } from "@/generated/prisma/client";

export const ROL_LABEL: Record<Rol, string> = {
  DUENO: "Dueño",
  GERENTE: "Gerente",
  ADMIN: "Admin",
  ADMINISTRATIVO: "Administrativo",
  TECNICO: "Técnico",
};

export const ROL_COLOR: Record<Rol, string> = {
  DUENO:         "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  GERENTE:       "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  ADMIN:         "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  ADMINISTRATIVO:"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  TECNICO:       "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};
