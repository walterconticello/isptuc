import type { NextAuthConfig } from "next-auth";

// Configuración mínima para el middleware (no importa Prisma, seguro para Edge)
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname === "/";

      if (isDashboard && !isLoggedIn) return false;
      if (nextUrl.pathname === "/login" && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
  providers: [],
};
