import { expect, test } from "@playwright/test";

/*
 * The flagship guarantee: after downloading a city pack, the answer
 * engine keeps working with zero connectivity. This drill broke once in
 * manual testing (service-worker asset-graph caching) — it must never
 * silently regress again.
 */

test("smoke: night arrival at RAK recommends a taxi and rolls the bus to tomorrow", async ({
  page,
}) => {
  await page.goto("/move?from=rak-airport&to=jemaa-el-fnaa&at=23:40");
  await expect(page.getByText("Best next move")).toBeVisible();
  await expect(page.getByText("Petit taxi").first()).toBeVisible();
  await expect(page.getByText("Departs tomorrow 06:30")).toBeVisible();
});

test("smoke: Arabic renders right-to-left", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("offline: pack download survives total connectivity loss", async ({
  page,
  context,
}) => {
  // Clean slate so the test exercises the full install + warm-up path.
  await page.goto("/packs");
  await page.evaluate(async () => {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
    const names = await caches.keys();
    await Promise.all(names.map((n) => caches.delete(n)));
  });
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    return Boolean(reg?.active);
  });

  // Download the Marrakech pack (first card) and let the warm-up finish.
  await page.getByRole("button", { name: "Download pack" }).first().click();
  await expect(page.getByText(/Ready ·/).first()).toBeVisible({
    timeout: 30_000,
  });
  await page.waitForTimeout(5_000);

  // Pull the plug.
  await context.setOffline(true);
  try {
    await page.goto("/offline", { waitUntil: "domcontentloaded" });

    const selects = page.locator("select");
    await selects.nth(0).selectOption("rak-airport");
    await selects.nth(1).selectOption("jemaa-el-fnaa");
    await page.getByRole("button", { name: "Find my next move" }).click();

    // The engine answered on-device: best move + the trust layer.
    await expect(page.getByText("Best next move")).toBeVisible();
    await expect(page.getByText("Agree the fare before you ride")).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});
