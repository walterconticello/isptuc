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

  test("crea un cliente nuevo desde el editor sin salir", async ({ page }) => {
    await page.goto("/presupuestos/nuevo");
    const nombre = `Cliente E2E ${Date.now()}`;

    // Escribir en el combobox de cliente un nombre inexistente → aparece "+ Crear".
    await page.getByRole("combobox", { name: "Cliente" }).fill(nombre);
    await page.getByRole("button", { name: `Crear «${nombre}»` }).click();

    // Se abre el modal con el nombre precargado; completar y crear.
    const dialog = page.getByRole("dialog", { name: "Nuevo cliente" });
    await expect(dialog.locator('input[name="nombre"]')).toHaveValue(nombre);
    await dialog.locator('input[name="cuit"]').fill("20-99999999-9");
    await dialog.getByRole("button", { name: "Crear cliente" }).click();

    // El cliente queda seleccionado: su ficha (nombre + CUIT) se muestra en el documento.
    await expect(dialog).toBeHidden();
    await expect(page.getByText(nombre)).toBeVisible();
    await expect(page.getByText("CUIT: 20-99999999-9")).toBeVisible();
  });

  test("crea un ítem nuevo desde una línea y autocompleta el precio", async ({ page }) => {
    await page.goto("/presupuestos/nuevo");
    const desc = `Item E2E ${Date.now()}`;

    await page.getByRole("combobox", { name: "Ítem 1" }).fill(desc);
    await page.getByRole("button", { name: `Crear «${desc}»` }).click();

    const dialog = page.getByRole("dialog", { name: "Nuevo ítem" });
    await expect(dialog.locator('input[name="descripcion"]')).toHaveValue(desc);
    await dialog.locator('input[name="precioUnitario"]').fill("1500");
    await dialog.getByRole("button", { name: "Crear ítem" }).click();

    // La línea toma el ítem: el precio unitario se autocompleta y el subtotal refleja 1×1500.
    await expect(dialog).toBeHidden();
    await expect(page.getByLabel("Precio unitario ítem 1")).toHaveValue("1500");
    const totalRow = page.locator("div").filter({ has: page.getByText("TOTAL", { exact: true }) }).last();
    await expect(totalRow).toContainText("$1.815,00"); // 1500 × 1.21
  });

  test("el editor ofrece Imprimir/PDF y oculta el sidebar al imprimir", async ({ page }) => {
    await page.goto("/presupuestos/nuevo");

    // El botón está disponible desde el editor (antes de guardar).
    await expect(page.getByRole("button", { name: "Imprimir / PDF" })).toBeVisible();

    // En pantalla el sidebar se ve; al imprimir queda oculto (no ensucia el PDF).
    const sidebar = page.getByRole("complementary");
    await expect(sidebar).toBeVisible();
    await page.emulateMedia({ media: "print" });
    await expect(sidebar).toBeHidden();
    // El documento del presupuesto sí se imprime.
    await expect(page.getByText("PRESUPUESTO", { exact: true })).toBeVisible();
    await page.emulateMedia({ media: "screen" });
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
