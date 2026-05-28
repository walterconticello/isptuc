import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "FleetManager",
  description: "Gestión de flota vehicular",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased" suppressHydrationWarning>
      <body className="h-full flex bg-muted/30">
        <ThemeProvider>
          <Sidebar />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
