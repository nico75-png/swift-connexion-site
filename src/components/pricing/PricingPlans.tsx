import { useState } from "react";

import { PricingCard } from "@/components/pricing/PricingCard";
import type { PricingPlanId } from "@/lib/pricing/plans";
import { PRICING_PLANS } from "@/lib/pricing/plans";

export type PricingPlansProps = {
  onSelectPlan?: (planId: PricingPlanId) => void;
};

export const PricingPlans = ({ onSelectPlan }: PricingPlansProps) => {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlanId | null>(
    PRICING_PLANS.find((plan) => plan.isFeatured)?.id ?? null,
  );

  const handleSelect = (planId: PricingPlanId) => {
    setSelectedPlan(planId);
    onSelectPlan?.(planId); // Option : émettre un événement/callback vers le parent.
    // Option : rediriger vers la page de réservation avec le plan pré-sélectionné.
    // navigate(`/commande-sans-compte?plan=${planId}`);
  };

  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">Des formules adaptées à chaque étape</h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Choisissez le plan qui correspond à vos besoins et bénéficiez d’un accompagnement premium sur vos livraisons.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:mx-auto xl:max-w-6xl">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} isSelected={selectedPlan === plan.id} onSelect={handleSelect} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;
