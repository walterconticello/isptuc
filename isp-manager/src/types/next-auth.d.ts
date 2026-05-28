import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nombre: string;
      apellido: string;
      rol: string;
    } & DefaultSession["user"];
  }
}
