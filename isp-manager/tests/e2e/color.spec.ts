import { test, expect } from "@playwright/test";
import { login } from "./helpers";

const primary = (page: import("@playwright/test").Page) =>
  page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--primary").trim());

test.describe("Selector de color", () => {
  test.beforeEach(async ({ page }) => login(page));

  test("cambia el acento, lo aleatoriza y lo persiste", async ({ page }) => {
    await page.goto("/dashboard");
    const inicial = await primary(page);

    await page.getByRole("button", { name: "Color Verde" }).click();
    const verde = await primary(page);
    expect(verde).not.toBe(inicial);

    await page.getByRole("button", { name: "Color aleatorio" }).click();
    const rnd = await primary(page);
    expect(rnd).not.toBe(verde);

    await page.reload();
    expect(await primary(page)).toBe(rnd); // persistió tras recargar
  });

  test("el acento se aplica también en modo oscuro", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Oscuro" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    expect(await primary(page)).toContain("calc"); // fórmula de oscuro activa
  });
});
