import { test, expect } from "@playwright/test";
import { login } from "./helpers";

const RUTAS = [
  "/dashboard", "/empleados", "/empleados/nuevo", "/flota", "/flota/nuevo",
  "/combustible", "/combustible/nuevo", "/cuadrillas", "/cuadrillas/nueva",
  "/presupuestos", "/presupuestos/nuevo", "/clientes", "/clientes/nuevo",
  "/items", "/items/nuevo", "/stock", "/stock/almacenes", "/stock/almacenes/nuevo",
  "/stock/herramientas", "/stock/movimientos", "/stock/movimientos/nuevo",
  "/stock/productos", "/stock/productos/nuevo", "/admin", "/admin/auditoria",
  "/admin/empresa", "/admin/permisos",
];

test.describe("Recorrido del sistema", () => {
  test.beforeEach(async ({ page }) => login(page));

  for (const ruta of RUTAS) {
    test(`${ruta} carga sin errores`, async ({ page }) => {
      const errores: string[] = [];
      page.on("pageerror", (e) => errores.push(e.message));

      const resp = await page.goto(ruta, { waitUntil: "networkidle" });
      expect(resp?.status(), `status de ${ruta}`).toBeLessThan(400);
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page).not.toHaveURL(/\/login/);
      expect(errores, `errores de runtime en ${ruta}`).toHaveLength(0);
    });
  }
});
