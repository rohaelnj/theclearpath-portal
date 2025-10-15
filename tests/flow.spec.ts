import { test, expect } from "@playwright/test";

test("survey enables CTA and routes to plans", async ({ page }) => {
  await page.goto("http://localhost:3000/intake");
  await page.getByLabel(/anxious/i).selectOption("often");
  await page.getByLabel(/sleep/i).selectOption("good");
  await page.getByLabel(/Where are you located/i).fill("United Arab Emirates");
  await page.getByLabel(/Preferred language/i).fill("English");
  await page.getByLabel(/gender preference/i).selectOption("no_preference");
  await page.getByLabel(/Date of birth/i).fill("1990-01-01");
  await page.getByRole("radio", { name: /^No$/ }).first().check();
  await page.getByRole("radio", { name: /^No$/ }).nth(1).check();
  await page.getByLabel(/goal/i).fill("Reduce anxiety");
  const cta = page.getByRole("button", { name: /recommended plan/i });
  await expect(cta).toBeEnabled();
  await cta.click();
  await expect(page).toHaveURL(/\/plans/);
  await expect(page.getByText(/why this plan/i)).toBeVisible();
});
