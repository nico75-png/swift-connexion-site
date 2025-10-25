import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { SECTOR_OPTIONS } from "@/config/secteurs";
import Inscription from "../Inscription";

vi.mock("@/services/registration", () => ({
  submitRegistration: vi.fn(() => Promise.resolve({ ok: true })),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe("Inscription form", () => {
  const setup = () =>
    render(
      <MemoryRouter>
        <Inscription />
      </MemoryRouter>,
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche tous les champs requis avec des labels accessibles", () => {
    setup();

    expect(screen.getByLabelText(/Nom de la société/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail professionnel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Téléphone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Numéro de SIRET/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Secteur d'activité/i)).toBeInTheDocument();

    const addressLegend = screen.getByText(/Adresse de facturation/i);
    expect(addressLegend.tagName).toBe("LEGEND");

    expect(screen.getByLabelText(/Adresse — ligne 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Adresse — ligne 2/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Code postal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ville/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pays/i)).toBeInTheDocument();
  });

  it("affiche les messages d'erreur lors d'une soumission vide", async () => {
    setup();

    await userEvent.click(screen.getByRole("button", { name: /Envoyer ma demande/i }));

    expect(await screen.findByText(/Indiquez un nom de société/i)).toBeVisible();
    expect(screen.getByText(/L'adresse e-mail est requise/i)).toBeVisible();
    expect(screen.getByText(/Le numéro de téléphone est requis/i)).toBeVisible();
    expect(screen.getByText(/Le numéro de SIRET est requis/i)).toBeVisible();
    expect(screen.getByText(/Sélectionnez un secteur/i)).toBeVisible();
    expect(screen.getByText(/Adresse \(ligne 1\) requise/i)).toBeVisible();
    expect(screen.getByText(/Le code postal est requis/i)).toBeVisible();
    expect(screen.getByText(/La ville est requise/i)).toBeVisible();
    expect(screen.getByText(/Le pays est requis/i)).toBeVisible();
  });

  it("valide les formats de téléphone et SIRET", async () => {
    setup();

    const phoneInput = screen.getByLabelText(/Téléphone/i);
    const siretInput = screen.getByLabelText(/Numéro de SIRET/i);

    await userEvent.type(phoneInput, "123");
    await userEvent.type(siretInput, "1234");

    await userEvent.click(screen.getByRole("button", { name: /Envoyer ma demande/i }));

    expect(await screen.findByText(/Saisissez un numéro de téléphone valide/i)).toBeVisible();
    expect(screen.getByText(/Le SIRET doit contenir 14 chiffres/i)).toBeVisible();
  });

  it("soumet les données normalisées lorsqu'elles sont valides", async () => {
    setup();

    const user = userEvent.setup();
    const companyInput = screen.getByLabelText(/Nom de la société/i);
    const emailInput = screen.getByLabelText(/E-mail professionnel/i);
    const phoneInput = screen.getByLabelText(/Téléphone/i);
    const siretInput = screen.getByLabelText(/Numéro de SIRET/i);
    const sectorTrigger = screen.getByLabelText(/Secteur d'activité/i);
    const line1Input = screen.getByLabelText(/Adresse — ligne 1/i);
    const postalCodeInput = screen.getByLabelText(/Code postal/i);
    const cityInput = screen.getByLabelText(/Ville/i);
    const countryInput = screen.getByLabelText(/Pays/i);

    await user.type(companyInput, "  Ma Société  ");
    await user.type(emailInput, "CONTACT@EXEMPLE.FR ");
    await user.type(phoneInput, "06 12 34 56 78");
    await user.type(siretInput, "73282932000074");

    await user.click(sectorTrigger);
    const optionsList = await screen.findByRole("listbox");
    const sectorOption = within(optionsList).getByText(SECTOR_OPTIONS[0].label);
    await user.click(sectorOption);

    await user.type(line1Input, " 12 rue de l'Innovation ");
    await user.type(postalCodeInput, "75008");
    await user.type(cityInput, " Paris ");
    await user.type(countryInput, " France ");

    await user.click(screen.getByRole("button", { name: /Envoyer ma demande/i }));

    const { submitRegistration } = await import("@/services/registration");

    expect(submitRegistration).toHaveBeenCalledWith({
      companyName: "Ma Société",
      email: "contact@exemple.fr",
      phone: "+33612345678",
      siret: "73282932000074",
      sector: SECTOR_OPTIONS[0].value,
      billingAddress: {
        line1: "12 rue de l'Innovation",
        line2: undefined,
        postalCode: "75008",
        city: "Paris",
        country: "France",
      },
    });

    const { toast } = await import("sonner");
    expect(toast.success).toHaveBeenCalledWith("Demande d'inscription envoyée.");
  });
});
