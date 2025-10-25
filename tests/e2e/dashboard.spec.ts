import { test, expect } from "@playwright/test";

test.describe("Dashboard responsive layout", () => {
  test.fixme("Requires authenticated session seeding", async ({ page }) => {
    await page.goto("/client/dashboard");
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.getByRole("heading", { name: /tableau de bord/i })).toBeVisible();
  });
});
