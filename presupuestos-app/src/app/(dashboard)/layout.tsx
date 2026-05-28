import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { NavLinks } from "@/components/NavLinks";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <nav className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <span className="font-semibold text-gray-900">Presupuestos</span>
              <NavLinks />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{session.user?.name}</span>
              <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
                <button type="submit" className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
                  Salir
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none">
        {children}
      </main>
    </div>
  );
}
