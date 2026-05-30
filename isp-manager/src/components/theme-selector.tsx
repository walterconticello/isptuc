"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * El acento se define por dos variables CSS (--accent-hue / --accent-chroma) que
 * globals.css usa para derivar --primary, --ring, sidebar y chart-1 tanto en
 * claro como en oscuro. Cambiar el acento = sobreescribir esas dos variables en
 * <html>. Esto permite paleta extensible y un acento aleatorio sin reglas CSS por color.
 */
interface Accent {
  key: string;
  label: string;
  hue: number;
  chroma: number;
}

const ACCENT_COLORS: Accent[] = [
  { key: "blue",    label: "Azul",      hue: 262.881, chroma: 0.245 },
  { key: "sky",     label: "Celeste",   hue: 237,     chroma: 0.17 },
  { key: "indigo",  label: "Índigo",    hue: 277,     chroma: 0.262 },
  { key: "violet",  label: "Violeta",   hue: 293,     chroma: 0.281 },
  { key: "fuchsia", label: "Fucsia",    hue: 322,     chroma: 0.26 },
  { key: "rose",    label: "Rosa",      hue: 12,      chroma: 0.22 },
  { key: "red",     label: "Rojo",      hue: 27,      chroma: 0.245 },
  { key: "orange",  label: "Naranja",   hue: 55,      chroma: 0.18 },
  { key: "amber",   label: "Ámbar",     hue: 85,      chroma: 0.16 },
  { key: "emerald", label: "Esmeralda", hue: 163,     chroma: 0.15 },
  { key: "teal",    label: "Verde",     hue: 185,     chroma: 0.13 },
  { key: "cyan",    label: "Cian",      hue: 215,     chroma: 0.15 },
];

const STORAGE_KEY = "accent-key";
const STORAGE_HUE = "accent-hue";
const STORAGE_CHROMA = "accent-chroma";

function swatch(hue: number, chroma: number): string {
  return `oklch(0.6 ${chroma} ${hue})`;
}

function applyAccent(hue: number, chroma: number) {
  const html = document.documentElement;
  html.style.setProperty("--accent-hue", String(hue));
  html.style.setProperty("--accent-chroma", String(chroma));
  localStorage.setItem(STORAGE_HUE, String(hue));
  localStorage.setItem(STORAGE_CHROMA, String(chroma));
}

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [accentKey, setAccentKey] = useState<string>("blue");
  const [randomSwatch, setRandomSwatch] = useState<string>(swatch(0, 0.2));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Guard de hidratación SSR: sincroniza el acento/tema persistidos en localStorage
    // (sistema externo) al montar. El setState acá es intencional y evita el mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const key = localStorage.getItem(STORAGE_KEY) ?? "blue";
    const hue = Number(localStorage.getItem(STORAGE_HUE));
    const chroma = Number(localStorage.getItem(STORAGE_CHROMA));
    setAccentKey(key);
    if (Number.isFinite(hue) && hue > 0 && Number.isFinite(chroma) && chroma > 0) {
      applyAccent(hue, chroma);
      if (key === "random") setRandomSwatch(swatch(hue, chroma));
    }
  }, []);

  function selectAccent(a: Accent) {
    setAccentKey(a.key);
    localStorage.setItem(STORAGE_KEY, a.key);
    applyAccent(a.hue, a.chroma);
  }

  function randomize() {
    const hue = Math.round(Math.random() * 360);
    const chroma = +(0.14 + Math.random() * 0.12).toFixed(3); // 0.14–0.26
    setAccentKey("random");
    setRandomSwatch(swatch(hue, chroma));
    localStorage.setItem(STORAGE_KEY, "random");
    applyAccent(hue, chroma);
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
              aria-pressed={theme === opt.value}
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
              onClick={() => selectAccent(color)}
              title={color.label}
              aria-label={`Color ${color.label}`}
              aria-pressed={accentKey === color.key}
              style={{ backgroundColor: swatch(color.hue, color.chroma) }}
              className={cn(
                "h-5 w-5 rounded-full transition-transform hover:scale-110",
                accentKey === color.key && "ring-2 ring-offset-1 ring-foreground/40 scale-110"
              )}
            />
          ))}
          {/* Acento aleatorio */}
          <button
            onClick={randomize}
            title="Color aleatorio"
            aria-label="Color aleatorio"
            aria-pressed={accentKey === "random"}
            style={accentKey === "random" ? { backgroundColor: randomSwatch } : undefined}
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-foreground/30 text-muted-foreground transition-transform hover:scale-110",
              accentKey === "random" && "ring-2 ring-offset-1 ring-foreground/40 scale-110 border-transparent text-white"
            )}
          >
            <Shuffle className="h-2.5 w-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
