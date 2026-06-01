import { type Page, expect } from "@playwright/test";

/** Loguea con la cuenta semilla y espera salir de /login. */
export async function login(page: Page) {
  await page.goto("/login");
  await page.fill('input[name="email"]', "admin@isp.local");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button[type="submit"]');
  await expect(page).not.toHaveURL(/\/login/, { timeout: 20000 });
}
