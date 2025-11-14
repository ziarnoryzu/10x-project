import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/VibeTravels/i);
  });

  test("should display main navigation", async ({ page }) => {
    await page.goto("/");
    // Add specific navigation checks based on your app structure
    await expect(page).toHaveURL("/");
  });
});
