import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Combustible", () => {
  test.beforeEach(async ({ page }) => login(page));

  test("la tabla muestra registros y el toggle cambia la unidad de rendimiento", async ({ page }) => {
    await page.goto("/combustible");
    const filas = page.locator("tbody tr");
    await expect(filas.first()).toBeVisible();

    const consumoKmL = (await filas.first().locator("td").nth(7).innerText()).trim();
    await page.getByRole("button", { name: "L/100km", exact: true }).click();
    const consumoL100 = (await filas.first().locator("td").nth(7).innerText()).trim();
    expect(consumoL100).not.toBe(consumoKmL);
  });

  test("el filtro por vehículo reduce los resultados", async ({ page }) => {
    await page.goto("/combustible");
    const total = await page.locator("tbody tr").count();
    await page.locator("select").first().selectOption({ index: 1 });
    await page.getByRole("button", { name: "Filtrar" }).click();
    await page.waitForURL(/vehiculoId=/);
    await expect(page.locator("tbody tr").first()).toBeVisible();
    expect(await page.locator("tbody tr").count()).toBeLessThanOrEqual(total);
  });

  test("el formulario calcula el precio por litro automáticamente", async ({ page }) => {
    await page.goto("/combustible/nuevo");
    await page.selectOption('select[name="vehiculoId"]', { index: 1 });
    await page.fill('input[name="litros"]', "40");
    await page.fill('input[name="costoTotal"]', "60000");
    await expect(page.getByText(/Precio por litro calculado/)).toBeVisible();
    await expect(page.getByText("$1.500,00 / L")).toBeVisible();
  });

  test("rechaza un odómetro duplicado", async ({ page }) => {
    await page.goto("/combustible/nuevo");
    // Selecciona el primer vehículo y reusa su último odómetro (mostrado en el select).
    await page.selectOption('select[name="vehiculoId"]', { index: 1 });
    const opcion = await page.locator('select[name="vehiculoId"] option').nth(1).innerText();
    const km = opcion.match(/\(([\d.]+)\s*km\)/)?.[1]?.replace(/\./g, "") ?? "";
    test.skip(!km, "No se pudo extraer el odómetro del vehículo");
    await page.fill('input[name="litros"]', "10");
    await page.fill('input[name="costoTotal"]', "15000");
    await page.fill('input[name="odometro"]', km);
    await page.click('button:has-text("Registrar carga")');
    await expect(page.locator("div.text-destructive")).toContainText(/Ya existe una carga/);
  });
});
