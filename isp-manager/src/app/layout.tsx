import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ISP Manager",
  description: "Sistema de gestión integral para empresa ISP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  );
}
