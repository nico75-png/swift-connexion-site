
import { expect, test } from "@playwright/test";

import { SECTOR_OPTIONS } from "../src/config/secteurs";

const VALID_SIRET = "73282932000074";

const fillValidForm = async (page: import("@playwright/test").Page) => {
  await page.getByLabel(/Nom de la société/i).fill("Ma Société");
  await page.getByLabel(/E-mail professionnel/i).fill("contact@exemple.fr");
  await page.getByLabel(/Téléphone/i).fill("06 12 34 56 78");
  await page.getByLabel(/Numéro de SIRET/i).fill(VALID_SIRET);
  const sectorTrigger = page.getByLabel(/Secteur d'activité/i);
  await sectorTrigger.click();
  await page.getByRole("option", { name: SECTOR_OPTIONS[0].label }).click();
  await page.getByLabel(/Adresse — ligne 1/i).fill("12 rue de l'Innovation");
  await page.getByLabel(/Code postal/i).fill("75008");
  await page.getByLabel(/Ville/i).fill("Paris");
  await page.getByLabel(/Pays/i).fill("France");
};

test.describe("Page d'inscription", () => {
  test("parcours mobile : validation et message de succès", async ({ page }) => {
    await page.goto("/inscription");

    const submitButton = page.getByRole("button", { name: /Envoyer ma demande/i });
    await submitButton.click();

    await expect(page.getByText(/Indiquez un nom de société/i)).toBeVisible();
    await expect(page.getByLabel(/Nom de la société/i)).toBeFocused();

    await fillValidForm(page);

    await submitButton.click();

    await expect(page.getByText("Demande d'inscription envoyée.")).toBeVisible();
  });

  test("parcours desktop : navigation clavier et sélection secteur", async ({ page }) => {
    await page.goto("/inscription");

    const orderedLabels = [
      /Nom de la société/i,
      /E-mail professionnel/i,
      /Téléphone/i,
      /Numéro de SIRET/i,
      /Secteur d'activité/i,
    ];

    await page.getByLabel(orderedLabels[0]).focus();

    for (const label of orderedLabels.slice(1)) {
      await page.keyboard.press("Tab");
      await expect(page.getByLabel(label)).toBeFocused();
    }

    const trigger = page.getByLabel(/Secteur d'activité/i);
    await trigger.click();

    for (const option of SECTOR_OPTIONS) {
      await expect(page.getByRole("option", { name: option.label })).toBeVisible();
    }

    await page.getByRole("option", { name: SECTOR_OPTIONS[1].label }).click();
    await expect(trigger).toHaveText(SECTOR_OPTIONS[1].label);
  });
});
