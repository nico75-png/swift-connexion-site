import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Activity } from "lucide-react";

import StatsCard from "../StatsCard";

describe("StatsCard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("applique les classes anti-clipping pour les libellés et valeurs", () => {
    const html = renderToStaticMarkup(
      <StatsCard
        label="Commande extrêmement longue pour test d'internationalisation"
        value="123 456 789,99 €"
        icon={Activity}
        trend={{ value: 12, isPositive: true }}
      />,
    );

    expect(html).toContain("wrap-any text-sm");
    expect(html).toContain("wrap-any text-3xl");
    expect(html).toContain("minw0");
  });

  it("rend sans erreurs console", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderToStaticMarkup(
      <StatsCard label="Test" value="999" icon={Activity} trend={{ value: -5, isPositive: false }} />,
    );

    expect(spy).not.toHaveBeenCalled();
  });
});
