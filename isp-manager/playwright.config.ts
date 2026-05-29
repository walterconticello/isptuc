import { defineConfig, devices } from "@playwright/test";

/**
 * Tests e2e del sistema. Requieren la base levantada (docker-compose up -d) y
 * usan la cuenta semilla admin@isp.local / admin123. El webServer reutiliza un
 * dev server ya corriendo o levanta uno nuevo.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000/login",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
