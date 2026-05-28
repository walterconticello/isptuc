import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  const nombre = (session?.user as { nombre?: string })?.nombre ?? session?.user?.name ?? "Usuario";

  return (
    <div>
      <h1 className="text-2xl font-semibold">Bienvenido, {nombre}</h1>
      <p className="mt-1 text-muted-foreground">
        Sistema de gestión integral ISP
      </p>
    </div>
  );
}
