import { test, expect, Page } from "@playwright/test";

async function completeIntakeSurvey(page: Page) {
  await page.locator('select[name="anxiety"]').selectOption("often");
  await page.locator('select[name="sleep"]').selectOption("good");
  await page.locator('input[name="country"]').fill("United Arab Emirates");
  await page.locator('input[name="language"]').fill("English");
  await page.locator('select[name="therapistGender"]').selectOption("no_preference");
  await page.locator('input[name="dob"]').fill("1990-01-01");
  await page.locator('input[name="priorTherapy"][value="no"]').check();
  await page.locator('input[name="risk"][value="no"]').check();
  await page.locator('textarea[name="goal"]').fill("Reduce anxiety and sleep better");
}

test("survey enables CTA and routes to plans", async ({ page }) => {
  await page.goto("http://localhost:8888/intake");

  await completeIntakeSurvey(page);

  const cta = page.getByRole("button", { name: /recommended plan/i });
  await expect(cta).toBeEnabled();
  await cta.click();
  await expect(page).toHaveURL(/\/plans$/);
  await expect(page.getByText(/why this plan/i)).toBeVisible();
});

test("survey preserves next param across plans flow", async ({ page }) => {
  await page.goto("http://localhost:8888/intake?next=%2Fportal");

  await completeIntakeSurvey(page);

  const cta = page.getByRole("button", { name: /recommended plan/i });
  await expect(cta).toBeEnabled();
  await cta.click();
  await expect(page).toHaveURL(/\/plans\?next=%2Fportal$/);
});
