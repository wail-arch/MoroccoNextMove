import { defineConfig } from "@playwright/test";

/*
 * E2E suite. Requires a production build first:
 *   npm run build && npm run test:e2e
 * (and once per machine: npx playwright install chromium)
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  use: {
    baseURL: "http://localhost:3100",
    viewport: { width: 390, height: 844 },
  },
  webServer: {
    command: "npm run start -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
