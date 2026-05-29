import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Presupuestos WYSIWYG", () => {
  // El primer compile de cada ruta en Turbopack (dev) puede superar el default de 30s.
  test.setTimeout(120000);
  test.beforeEach(async ({ page }) => login(page));

  test("el editor muestra el documento con el encabezado de empresa", async ({ page }) => {
    await page.goto("/presupuestos/nuevo");
    // El documento ES la pantalla: título PRESUPUESTO + datos de empresa visibles.
    await expect(page.getByText("PRESUPUESTO", { exact: true })).toBeVisible();
    await expect(page.getByText(/CUIT:/).first()).toBeVisible();
  });

  test("el total se actualiza en vivo al cargar ítems", async ({ page }) => {
    await page.goto("/presupuestos/nuevo");

    // Primera línea en modo descripción libre.
    await page.getByPlaceholder("Descripción del ítem").first().fill("Instalación de fibra");
    await page.getByLabel("Cantidad ítem 1").fill("2");
    await page.getByLabel("Precio unitario ítem 1").fill("1000");

    // Subtotal de la línea = 2 × 1000 = $2.000,00 → con IVA 21% el total es $2.420,00.
    // La fila de total es el div que contiene el span "TOTAL".
    const totalRow = page.locator("div").filter({ has: page.getByText("TOTAL", { exact: true }) }).last();
    await expect(totalRow).toContainText("$2.420,00");

    // Agregar otra línea sube el total en vivo.
    await page.getByRole("button", { name: "Agregar línea" }).click();
    await page.getByPlaceholder("Descripción del ítem").last().fill("Router");
    await page.getByLabel("Cantidad ítem 2").fill("1");
    await page.getByLabel("Precio unitario ítem 2").fill("3000");
    // (2000 + 3000) × 1.21 = 6050.
    await expect(totalRow).toContainText("$6.050,00");
  });

  test("achicar la letra de los ítems nunca baja del piso de 11px", async ({ page }) => {
    await page.goto("/presupuestos/nuevo");
    // Cargar muchas líneas para forzar el auto-ajuste hasta el piso.
    for (let i = 0; i < 20; i++) {
      await page.getByRole("button", { name: "Agregar línea" }).click();
    }
    // El bloque de ítems lleva fontSize inline; con 21 líneas debe estar en el piso (11px).
    const bloque = page.locator('div[style*="font-size"]').first();
    await expect(bloque).toHaveCount(1);
    const fontSize = await bloque.evaluate((el) => parseFloat((el as HTMLElement).style.fontSize));
    expect(fontSize).toBeGreaterThanOrEqual(11);
    expect(fontSize).toBeLessThanOrEqual(11.5);
  });
});
