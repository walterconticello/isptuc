import { describe, it, expect } from "vitest";
import {
  crearEmpleadoSchema,
  editarEmpleadoSchema,
  loginSchema,
} from "@/lib/validations";

describe("crearEmpleadoSchema", () => {
  const valido = {
    nombre: "Juan",
    apellido: "Pérez",
    email: "juan@isp.local",
    rol: "TECNICO",
    password: "secreto123",
  };

  it("acepta datos válidos", () => {
    expect(crearEmpleadoSchema.safeParse(valido).success).toBe(true);
  });

  it("rechaza email inválido", () => {
    const result = crearEmpleadoSchema.safeParse({ ...valido, email: "no-es-email" });
    expect(result.success).toBe(false);
  });

  it("rechaza contraseña menor a 8 caracteres", () => {
    const result = crearEmpleadoSchema.safeParse({ ...valido, password: "corta" });
    expect(result.success).toBe(false);
  });

  it("rechaza rol inválido", () => {
    const result = crearEmpleadoSchema.safeParse({ ...valido, rol: "SUPERADMIN" });
    expect(result.success).toBe(false);
  });

  it("rechaza nombre vacío", () => {
    const result = crearEmpleadoSchema.safeParse({ ...valido, nombre: "" });
    expect(result.success).toBe(false);
  });
});

describe("editarEmpleadoSchema", () => {
  it("acepta edición sin contraseña", () => {
    const result = editarEmpleadoSchema.safeParse({
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan@isp.local",
      rol: "GERENTE",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza contraseña menor a 8 caracteres si se provee", () => {
    const result = editarEmpleadoSchema.safeParse({
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan@isp.local",
      rol: "GERENTE",
      password: "corta",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("acepta email y contraseña válidos", () => {
    const result = loginSchema.safeParse({ email: "admin@isp.local", password: "admin123" });
    expect(result.success).toBe(true);
  });

  it("rechaza email inválido", () => {
    const result = loginSchema.safeParse({ email: "no-email", password: "admin123" });
    expect(result.success).toBe(false);
  });

  it("rechaza contraseña vacía", () => {
    const result = loginSchema.safeParse({ email: "admin@isp.local", password: "" });
    expect(result.success).toBe(false);
  });
});
