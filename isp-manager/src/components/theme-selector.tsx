"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT_COLORS = [
  { key: "default", label: "Azul",    class: "bg-[oklch(0.546_0.245_262.881)]" },
  { key: "sky",     label: "Celeste", class: "bg-[oklch(0.62_0.17_237)]" },
  { key: "indigo",  label: "Índigo",  class: "bg-[oklch(0.511_0.262_277)]" },
  { key: "teal",    label: "Verde",   class: "bg-[oklch(0.55_0.13_185)]" },
  { key: "emerald", label: "Esmeralda",class:"bg-[oklch(0.53_0.15_163)]" },
  { key: "violet",  label: "Violeta", class: "bg-[oklch(0.541_0.281_293)]" },
] as const;

type AccentKey = (typeof ACCENT_COLORS)[number]["key"];

function getStoredAccent(): AccentKey {
  if (typeof window === "undefined") return "default";
  return (localStorage.getItem("accent-color") as AccentKey) ?? "default";
}

function applyAccent(key: AccentKey) {
  const html = document.documentElement;
  html.removeAttribute("data-accent");
  if (key !== "default") html.setAttribute("data-accent", key);
  localStorage.setItem("accent-color", key);
}

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [accent, setAccent] = useState<AccentKey>("default");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = getStoredAccent();
    setAccent(stored);
    applyAccent(stored);
  }, []);

  function handleAccent(key: AccentKey) {
    setAccent(key);
    applyAccent(key);
  }

  if (!mounted) return null;

  return (
    <div className="px-3 py-3 border-t space-y-3">
      {/* Tema claro/oscuro */}
      <div>
        <p className="text-xs text-muted-foreground mb-1.5">Tema</p>
        <div className="flex gap-1">
          {([
            { value: "light",  icon: <Sun  className="h-3.5 w-3.5" />, label: "Claro"  },
            { value: "dark",   icon: <Moon className="h-3.5 w-3.5" />, label: "Oscuro" },
            { value: "system", icon: <Monitor className="h-3.5 w-3.5" />, label: "Sistema" },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              title={opt.label}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs transition-colors",
                theme === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-muted-foreground"
              )}
            >
              {opt.icon}
              <span className="hidden lg:inline">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color de acento */}
      <div>
        <p className="text-xs text-muted-foreground mb-1.5">Color</p>
        <div className="flex gap-1.5 flex-wrap">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.key}
              onClick={() => handleAccent(color.key)}
              title={color.label}
              className={cn(
                "h-5 w-5 rounded-full transition-transform hover:scale-110",
                color.class,
                accent === color.key && "ring-2 ring-offset-1 ring-foreground/40 scale-110"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
