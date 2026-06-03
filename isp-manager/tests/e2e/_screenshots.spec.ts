import { test } from "@playwright/test";
import { login } from "./helpers";

// Spec auxiliar para generar capturas de verificación manual.
// Correr: npx playwright test _screenshots.spec.ts
test.describe("Screenshots de verificación", () => {
  test.beforeEach(async ({ page }) => login(page));

  test("editor con pocos ítems (letra grande)", async ({ page }) => {
    await page.goto("/presupuestos/nuevo");
    await page.getByPlaceholder("Descripción del ítem").first().fill("Instalación de fibra óptica");
    await page.getByLabel("Cantidad ítem 1").fill("1");
    await page.getByLabel("Precio unitario ítem 1").fill("45000");
    await page.getByRole("button", { name: "Agregar línea" }).click();
    await page.getByPlaceholder("Descripción del ítem").last().fill("Router WiFi 6");
    await page.getByLabel("Cantidad ítem 2").fill("2");
    await page.getByLabel("Precio unitario ítem 2").fill("38000");
    await page.screenshot({ path: ".screenshots/editor-pocos-items.png", fullPage: true });
  });

  test("editor con muchos ítems (auto-ajuste a 11px)", async ({ page }) => {
    await page.goto("/presupuestos/nuevo");
    await page.getByPlaceholder("Descripción del ítem").first().fill("Ítem de servicio 1");
    await page.getByLabel("Cantidad ítem 1").fill("1");
    await page.getByLabel("Precio unitario ítem 1").fill("1000");
    for (let i = 2; i <= 20; i++) {
      await page.getByRole("button", { name: "Agregar línea" }).click();
      await page.getByPlaceholder("Descripción del ítem").last().fill(`Ítem de servicio ${i}`);
      await page.getByLabel(`Cantidad ítem ${i}`).fill("1");
      await page.getByLabel(`Precio unitario ítem ${i}`).fill(String(1000 * i));
    }
    await page.screenshot({ path: ".screenshots/editor-muchos-items.png", fullPage: true });
  });
});
