import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = ["/", "/intake", "/plans"];

for (const path of pages) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.goto(`http://localhost:8888${path}`);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toHaveLength(0);
  });
}
