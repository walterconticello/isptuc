import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ISP Manager",
  description: "Sistema de gestión integral para empresa ISP",
};

// Script anti-flash: aplica el color de acento guardado antes de que React hidrate,
// evitando el parpadeo al color por defecto en cada carga.
const accentScript = `
(function(){
  try {
    var hue = localStorage.getItem('accent-hue');
    var chroma = localStorage.getItem('accent-chroma');
    if (hue) document.documentElement.style.setProperty('--accent-hue', hue);
    if (chroma) document.documentElement.style.setProperty('--accent-chroma', chroma);
  } catch(e){}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: accentScript }} />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider>
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
