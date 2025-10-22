import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PricingPlan } from "@/lib/pricing/plans";
import { CheckCircle2 } from "lucide-react";

export type PricingCardProps = {
  plan: PricingPlan;
  isSelected: boolean;
  onSelect: (planId: PricingPlan["id"]) => void;
};

export const PricingCard = ({ plan, isSelected, onSelect }: PricingCardProps) => {
  const featured = plan.isFeatured;

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col gap-8 overflow-hidden rounded-3xl border border-border/60 bg-card p-8 text-left shadow-soft transition-smooth focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        featured &&
          "border-transparent bg-primary text-primary-foreground shadow-large focus-within:ring-primary-foreground focus-within:ring-offset-primary"
      )}
    >
      {plan.badge ? (
        <Badge
          className={cn(
            "mx-auto w-fit rounded-full px-4 py-1 text-[11px] tracking-[0.18em]",
            featured ? "bg-primary-foreground text-primary" : "bg-secondary text-secondary-foreground"
          )}
        >
          {plan.badge}
        </Badge>
      ) : (
        <span className="h-2" aria-hidden="true" />
      )}

      <div className="flex flex-col items-center text-center">
        <h3 className="text-2xl font-semibold leading-tight">{plan.name}</h3>
        <p className={cn("mt-3 text-sm font-medium", featured ? "text-primary-foreground/80" : "text-muted-foreground")}>{plan.tagline}</p>
      </div>

      <div className="flex flex-col items-center text-center">
        <span className="text-4xl font-bold leading-none">{plan.price}</span>
        <span className={cn("mt-2 text-sm font-semibold", featured ? "text-primary-foreground/80" : "text-muted-foreground/80")}>{plan.priceDetails}</span>
      </div>

      <ul className="space-y-4 text-sm">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <CheckCircle2
              className={cn("mt-0.5 h-5 w-5 flex-none", featured ? "text-primary-foreground" : "text-primary")}
              aria-hidden="true"
            />
            <span className={cn("leading-relaxed", featured ? "text-primary-foreground/90" : "text-muted-foreground")}>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        variant={featured ? "default" : "outline"}
        size="lg"
        className={cn(
          "mt-auto w-full rounded-full text-base font-semibold",
          featured
            ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            : "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        )}
        aria-pressed={isSelected}
        onClick={() => onSelect(plan.id)}
      >
        Choisir ce plan
      </Button>
    </Card>
  );
};
