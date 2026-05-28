import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const empleado = await db.empleado.findUnique({
          where: { email: parsed.data.email },
        });

        if (!empleado) return null;

        if (!empleado.activo) {
          throw new Error("CUENTA_INACTIVA");
        }

        const passwordOk = await bcrypt.compare(
          parsed.data.password,
          empleado.passwordHash
        );
        if (!passwordOk) return null;

        return {
          id: empleado.id,
          email: empleado.email,
          name: `${empleado.nombre} ${empleado.apellido}`,
          nombre: empleado.nombre,
          apellido: empleado.apellido,
          rol: empleado.rol,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.nombre = (user as { nombre?: string }).nombre ?? "";
        token.apellido = (user as { apellido?: string }).apellido ?? "";
        token.rol = (user as { rol?: string }).rol ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.nombre = token.nombre as string;
      session.user.apellido = token.apellido as string;
      session.user.rol = token.rol as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
