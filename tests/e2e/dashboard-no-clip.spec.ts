import { expect, test, type Locator } from "@playwright/test";

const assertNoClip = async (locator: Locator) => {
  await locator.waitFor({ state: "visible" });
  await locator.scrollIntoViewIfNeeded();

  const metrics = await locator.evaluate((element) => {
    element.scrollIntoView({ block: "center", inline: "center" });

    const rect = element.getBoundingClientRect();
    const scrollWidth = Math.ceil(element.scrollWidth);
    const scrollHeight = Math.ceil(element.scrollHeight);
    const width = Math.ceil(rect.width);
    const height = Math.ceil(rect.height);
    const clipped = scrollWidth - width > 1 || scrollHeight - height > 1;

    let hiddenByOverflow = false;
    let current: HTMLElement | null = element.parentElement;
    while (current) {
      const style = window.getComputedStyle(current);
      if (["hidden", "clip"].includes(style.overflow) || ["hidden", "clip"].includes(style.overflowX)) {
        const parentRect = current.getBoundingClientRect();
        if (
          rect.left < parentRect.left - 1 ||
          rect.right > parentRect.right + 1 ||
          rect.top < parentRect.top - 1 ||
          rect.bottom > parentRect.bottom + 1
        ) {
          hiddenByOverflow = true;
          break;
        }
      }
      current = current.parentElement;
    }

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const elementAtPoint = document.elementFromPoint(centerX, centerY);

    return {
      rect,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      clipped,
      hiddenByOverflow,
      elementAtPointMatches: elementAtPoint === element || element.contains(elementAtPoint),
    };
  });

  expect.soft(metrics.clipped, "Le contenu déborde à l'intérieur de l'élément").toBe(false);
  expect.soft(metrics.hiddenByOverflow, "L'élément est coupé par un parent overflow:hidden").toBe(false);
  expect.soft(metrics.rect.left).toBeGreaterThanOrEqual(-1);
  expect.soft(metrics.rect.top).toBeGreaterThanOrEqual(-1);
  expect.soft(metrics.rect.right).toBeLessThanOrEqual(metrics.viewport.width + 1);
  expect.soft(metrics.rect.bottom).toBeLessThanOrEqual(metrics.viewport.height + 1);
  expect.soft(metrics.elementAtPointMatches, "Un overlay recouvre l'élément").toBe(true);
};

const assertFocusVisible = async (locator: Locator) => {
  await locator.focus();
  const focusStyles = await locator.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      outlineWidth: parseFloat(style.outlineWidth || "0"),
      boxShadow: style.boxShadow,
    };
  });

  expect.soft(
    focusStyles.outlineWidth > 0 || focusStyles.boxShadow !== "none",
    "Le focus doit être visible",
  ).toBe(true);
};

test.describe("Dashboard – garde-fou anti-clipping", () => {
  test("les KPI et CTA restent lisibles", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForSelector('[data-testid="stats-card"]');

    const cards = await page.locator('[data-testid="stats-card"]').all();
    for (const card of cards) {
      await assertNoClip(card);
    }

    const cta = page.getByRole("link", { name: /Voir tout/i });
    await assertNoClip(cta);
    await assertFocusVisible(cta);

    const header = page.locator("header").first();
    await assertNoClip(header);
  });

  test("le tableau des factures est scrollable sans perte de contenu", async ({ page }) => {
    await page.goto("/factures");
    const table = page.getByTestId("invoice-table");
    await table.waitFor({ state: "visible" });
    await assertNoClip(table);

    const headers = await page.getByRole("columnheader").all();
    for (const header of headers) {
      await assertNoClip(header);
    }

    const massiveValueCell = table.locator("tbody tr td:nth-child(4)").first();
    if (await massiveValueCell.count()) {
      await assertNoClip(massiveValueCell);
    }

    const downloadLink = page.getByRole("link", { name: /Télécharger/i }).first();
    if (await downloadLink.count()) {
      await assertFocusVisible(downloadLink);
    }
  });
});
