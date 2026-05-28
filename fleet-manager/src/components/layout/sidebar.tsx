"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Car, Fuel, LayoutDashboard, Users, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vehicles", label: "Vehículos", icon: Car },
  { href: "/fuel", label: "Combustible", icon: Fuel },
  { href: "/crews", label: "Cuadrillas", icon: Users },
]

const ACCENTS = [
  { id: "blue",    label: "Azul",          bg: "bg-blue-500" },
  { id: "sky",     label: "Celeste",       bg: "bg-sky-400" },
  { id: "indigo",  label: "Índigo",        bg: "bg-indigo-500" },
  { id: "teal",    label: "Verde azulado", bg: "bg-teal-500" },
  { id: "emerald", label: "Esmeralda",     bg: "bg-emerald-500" },
  { id: "violet",  label: "Violeta",       bg: "bg-violet-500" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [accent, setAccent] = useState("blue")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("fleet-accent") ?? "blue"
    setAccent(saved)
    if (saved !== "blue") {
      document.documentElement.setAttribute("data-accent", saved)
    }
  }, [])

  function handleAccent(id: string) {
    setAccent(id)
    localStorage.setItem("fleet-accent", id)
    if (id === "blue") {
      document.documentElement.removeAttribute("data-accent")
    } else {
      document.documentElement.setAttribute("data-accent", id)
    }
  }

  return (
    <aside className="w-56 shrink-0 border-r bg-sidebar flex flex-col">
      <div className="px-6 py-5 border-b">
        <h1 className="font-bold text-lg tracking-tight">FleetManager</h1>
        <p className="text-xs text-muted-foreground">Gestión de flota</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href || (href !== "/" && pathname.startsWith(href))
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-medium text-muted-foreground">Apariencia</span>
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title={theme === "dark" ? "Cambiar a claro" : "Cambiar a oscuro"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 px-2">
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              title={a.label}
              onClick={() => handleAccent(a.id)}
              className={cn(
                "w-5 h-5 rounded-full transition-all",
                a.bg,
                accent === a.id
                  ? "ring-2 ring-offset-2 ring-offset-sidebar ring-foreground scale-110"
                  : "opacity-70 hover:opacity-100"
              )}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}
