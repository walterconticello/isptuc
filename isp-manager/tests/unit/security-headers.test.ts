import { describe, it, expect } from "vitest";
import { SECURITY_HEADERS } from "@/lib/security-headers";

function header(key: string): string | undefined {
  return SECURITY_HEADERS.find((h) => h.key.toLowerCase() === key.toLowerCase())?.value;
}

describe("SECURITY_HEADERS", () => {
  it("previene clickjacking con X-Frame-Options: DENY", () => {
    expect(header("X-Frame-Options")).toBe("DENY");
  });

  it("evita MIME sniffing con X-Content-Type-Options: nosniff", () => {
    expect(header("X-Content-Type-Options")).toBe("nosniff");
  });

  it("define una Referrer-Policy", () => {
    expect(header("Referrer-Policy")).toBeTruthy();
  });

  it("fuerza HTTPS con HSTS (max-age)", () => {
    expect(header("Strict-Transport-Security")).toMatch(/max-age=\d+/);
  });

  it("restringe features del navegador con Permissions-Policy", () => {
    expect(header("Permissions-Policy")).toBeTruthy();
  });

  it("define una CSP con default-src propio y frame-ancestors none", () => {
    const csp = header("Content-Security-Policy");
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
  });
});
