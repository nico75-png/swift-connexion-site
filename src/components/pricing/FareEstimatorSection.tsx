import { useState } from "react";

import FareEstimatorForm, { type FareEstimatorFormValues } from "@/components/pricing/FareEstimatorForm";
import FareSummary from "@/components/pricing/FareSummary";
import { estimateFare, type FareEstimate } from "@/lib/pricing/pricingEngine";

const FareEstimatorSection = () => {
  const [estimate, setEstimate] = useState<FareEstimate | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  const handleEstimate = async (values: FareEstimatorFormValues) => {
    setIsEstimating(true);
    try {
      const result = estimateFare(values);
      setEstimate(result);
      // TODO: Rediriger vers le parcours de réservation si l'utilisateur confirme l'estimation.
    } finally {
      setIsEstimating(false);
    }
  };

  return (
    <section className="py-16">
      <div className="container px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">Estimez votre tarif en quelques clics</h2>
          <p className="mt-3 text-base text-muted-foreground">
            Renseignez votre trajet et obtenez une estimation instantanée basée sur notre grille tarifaire officielle.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <FareSummary estimate={estimate} />
          <FareEstimatorForm onEstimate={handleEstimate} isEstimating={isEstimating} />
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Estimation indicative, calculée à partir des informations saisies.
        </p>
      </div>
    </section>
  );
};

export default FareEstimatorSection;
