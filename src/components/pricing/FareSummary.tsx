import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

import type { FareEstimate } from "@/lib/pricing/pricingEngine";

const bullets = [
  "Base forfaitaire incluse sur les 10 premiers kilomètres.",
  "Majoration automatique selon l'heure et les jours fériés.",
  "Délai estimé en fonction du service sélectionné.",
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(amount);

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins.toString().padStart(2, "0")} min`;
  }

  if (mins === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${mins.toString().padStart(2, "0")} min`;
};

interface FareSummaryProps {
  estimate: FareEstimate | null;
}

const FareSummary = ({ estimate }: FareSummaryProps) => {
  return (
    <Card className="relative h-full overflow-hidden rounded-[2.25rem] border border-border/60 bg-background/95 shadow-soft supports-[backdrop-filter]:bg-background/80">
      <span className="pointer-events-none absolute inset-0 rounded-[2.25rem] bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent" />
      <CardHeader className="relative space-y-4 pb-0 text-left">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-semibold text-foreground">Récapitulatif de votre course</CardTitle>
          <p className="text-sm text-muted-foreground">
            Visualisez les éléments inclus avant de lancer votre estimation.
          </p>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-6 pt-8">
        <div className="rounded-2xl bg-muted px-5 py-4">
          <p className="text-sm font-semibold text-foreground">Préparez votre estimation</p>
          <p className="text-sm text-muted-foreground">
            Complétez le formulaire pour obtenir une estimation personnalisée selon votre service choisi.
          </p>
        </div>

        <ul className="space-y-4">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        {estimate && (
          <div className="space-y-4 rounded-2xl border border-primary/30 bg-primary/5 p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold uppercase tracking-wide text-primary">Résultat</span>
              <Badge variant="outline" className="rounded-full border-primary/40 text-primary">
                {estimate.serviceLabel}
              </Badge>
            </div>
            <dl className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between gap-3">
                <dt>Distance estimée</dt>
                <dd className="font-medium text-foreground">{estimate.distanceKm.toLocaleString("fr-FR", { minimumFractionDigits: 1 })} km</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt>Durée estimée</dt>
                <dd className="font-medium text-foreground">{formatDuration(estimate.durationMinutes)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt>Base forfaitaire</dt>
                <dd className="font-medium text-foreground">{formatCurrency(estimate.breakdown.baseFare)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt>Distance supplémentaire</dt>
                <dd className="font-medium text-foreground">{formatCurrency(estimate.breakdown.distanceFare)}</dd>
              </div>
              {estimate.breakdown.surchargeAmount > 0 && (
                <div className="flex items-center justify-between gap-3">
                  <dt>Majoration</dt>
                  <dd className="font-medium text-foreground">{formatCurrency(estimate.breakdown.surchargeAmount)}</dd>
                </div>
              )}
            </dl>
            <div className="flex items-end justify-between">
              <span className="text-sm font-medium text-muted-foreground">Tarif indicatif</span>
              <span className="text-3xl font-semibold text-primary">{formatCurrency(estimate.total)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FareSummary;
