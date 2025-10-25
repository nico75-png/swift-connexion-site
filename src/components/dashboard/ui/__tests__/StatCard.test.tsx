import { render, screen } from "@testing-library/react";
import { Package } from "lucide-react";
import StatCard from "../StatCard";

describe("StatCard", () => {
  it("renders value, description and icon", () => {
    render(
      <StatCard
        title="Commandes"
        value={12}
        description="Commandes validées"
        icon={Package}
        trend={{ value: 85, isPositive: true, label: "livrées" }}
      />,
    );

    expect(screen.getByText("Commandes")).toBeInTheDocument();
    const [statusRegion] = screen.getAllByRole("status");
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Commandes validées")).toBeVisible();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("shows skeleton when loading", () => {
    render(
      <StatCard
        title="Montant"
        value="1 200 €"
        description="Montant facturé"
        isLoading
      />,
    );

    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });
});
