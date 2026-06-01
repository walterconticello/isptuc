"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/validations";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

const SLIDES = [
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=80",
  "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1920&q=80",
  "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1920&q=80",
  "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=1920&q=80",
];

function isValidEmail(val: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function getInitials(email: string) {
  const local = email.split("@")[0];
  const parts = local.split(/[.\-_]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailVal, setEmailVal] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [slide, setSlide] = useState(0);

  const validEmail = isValidEmail(emailVal);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      email: form.get("email") as string,
      password: form.get("password") as string,
    };

    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    if (result?.error) {
      setError(
        result.error === "CUENTA_INACTIVA"
          ? "Tu cuenta está desactivada. Contactá al administrador."
          : "Email o contraseña incorrectos."
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ── Carrusel de fondo ── */}
      {SLIDES.map((url, i) => (
        <div
          key={url}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${url}')`,
            opacity: i === slide ? 1 : 0,
            transition: "opacity 1.6s ease-in-out",
          }}
        />
      ))}

      {/* ── Overlay oscuro ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(5,8,24,0.84) 0%, rgba(10,18,40,0.78) 100%)",
        }}
      />

      {/* ── Dots del carrusel ── */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSlide(i)}
            className="h-1.5 rounded-full transition-all duration-300 cursor-pointer border-0 p-0"
            style={{
              width: i === slide ? "20px" : "6px",
              background:
                i === slide ? "#F59E0B" : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>

      {/* ── Card principal ── */}
      <div
        className="relative z-10 w-full max-w-[400px] rounded-3xl px-9 py-9"
        style={{
          background: "rgba(10, 15, 35, 0.80)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow:
            "0 4px 6px rgba(0,0,0,0.3), 0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo_isp.jpeg"
            alt="ISP Tucumán"
            className="h-14 w-auto mb-1.5 block"
            style={{
              filter: "invert(1) hue-rotate(180deg) brightness(1.05)",
            }}
          />
          <span
            className="text-[10px] uppercase tracking-[2px]"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Sistema de gestión interna
          </span>
        </div>

        {/* Separador */}
        <div
          className="h-px mb-6"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
          }}
        />

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="flex items-center justify-center rounded-full mb-2.5 relative overflow-hidden"
            style={{
              width: "72px",
              height: "72px",
              background: validEmail
                ? "rgba(245,158,11,0.1)"
                : "rgba(255,255,255,0.06)",
              border: validEmail
                ? "2px solid #F59E0B"
                : "2px solid rgba(255,255,255,0.12)",
              boxShadow: validEmail
                ? "0 0 0 4px rgba(245,158,11,0.15)"
                : "none",
              transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {validEmail ? (
              <span
                className="text-[22px] font-extrabold text-amber-400"
                style={{ transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}
              >
                {getInitials(emailVal)}
              </span>
            ) : (
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            )}
          </div>
          <span
            className="text-[13px] transition-colors duration-300 truncate max-w-[220px]"
            style={{ color: validEmail ? "#F59E0B" : "rgba(255,255,255,0.4)" }}
          >
            {validEmail ? emailVal : "Ingresá tus credenciales"}
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-[20px] font-bold text-white tracking-tight">
            Iniciar Sesión
          </h1>
          <p
            className="text-[13px] mt-1"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Acceso exclusivo para personal autorizado
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-[10px] font-bold uppercase tracking-[1px] mb-1.5"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="usuario@empresa.com"
              value={emailVal}
              onChange={(e) => setEmailVal(e.target.value)}
              disabled={loading}
              className="w-full rounded-[10px] px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200 disabled:opacity-50"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: validEmail
                  ? "1.5px solid rgba(245,158,11,0.5)"
                  : "1.5px solid rgba(255,255,255,0.1)",
                boxShadow: validEmail
                  ? "0 0 0 3px rgba(245,158,11,0.08)"
                  : "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Contraseña */}
          <div>
            <label
              htmlFor="password"
              className="block text-[10px] font-bold uppercase tracking-[1px] mb-1.5"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                disabled={loading}
                className="w-full rounded-[10px] px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200 disabled:opacity-50"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1.5px solid rgba(255,255,255,0.1)",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border =
                    "1.5px solid rgba(245,158,11,0.5)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(245,158,11,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border =
                    "1.5px solid rgba(255,255,255,0.1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0 transition-colors duration-200"
                style={{ color: "rgba(255,255,255,0.3)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.7)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.3)")
                }
                aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="rounded-lg px-3.5 py-2.5 text-sm flex items-center gap-2"
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#fca5a5",
              }}
            >
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[10px] py-3 text-sm font-extrabold tracking-wide flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 cursor-pointer border-0 mt-1"
            style={{
              background: "linear-gradient(135deg, #F59E0B, #D97706)",
              color: "#0f172a",
              boxShadow: "0 4px 16px rgba(245,158,11,0.35)",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 24px rgba(245,158,11,0.5)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(245,158,11,0.35)";
            }}
          >
            <LogIn size={15} />
            {loading ? "VERIFICANDO..." : "INGRESAR"}
          </button>
        </form>

        <p
          className="text-center text-[11px] mt-5"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          © 2026 ISP Tucumán — Uso interno exclusivo
        </p>
      </div>
    </div>
  );
}