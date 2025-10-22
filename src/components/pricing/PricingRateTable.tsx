import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrencyEUR } from "@/lib/reorder";
import { EXAMPLES_KM, PLANS, estimate } from "@/lib/pricing/rates";

const formatAmount = (value: number) => formatCurrencyEUR(value);
// Brancher ici un autre formateur de monnaie si la logique globale évolue.

export const PricingRateTable = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <header className="mb-8 text-center md:mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Formules par service
            </h2>
          </header>

          <Card className="border-none shadow-soft">
            <CardContent className="p-6 md:p-8">
              <Table className="text-base">
                <TableCaption className="sr-only">
                  Tarifs des formules Standard, Express et Flash Express avec exemples à 5, 15 et 27 kilomètres.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col" className="min-w-[160px] font-semibold text-foreground">
                      Service
                    </TableHead>
                    <TableHead scope="col" className="min-w-[220px] font-semibold text-foreground">
                      Formule
                    </TableHead>
                    <TableHead scope="col" className="min-w-[120px] font-semibold text-foreground">
                      Délai
                    </TableHead>
                    {EXAMPLES_KM.map((distance) => (
                      <TableHead
                        key={distance}
                        scope="col"
                        className="whitespace-nowrap font-semibold text-foreground"
                      >
                        {distance} km
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PLANS.map((plan) => (
                    <TableRow key={plan.id} className="align-top">
                      <TableHead scope="row" className="font-semibold text-foreground">
                        {plan.name}
                      </TableHead>
                      <TableCell className="text-muted-foreground">
                        0–10 km = {formatAmount(plan.base)} puis + {formatAmount(plan.perKm)} /km
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{plan.sla}</TableCell>
                      {EXAMPLES_KM.map((distance) => (
                        <TableCell key={`${plan.id}-${distance}`} className="font-medium text-foreground">
                          {formatAmount(estimate(plan, distance))}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <p className="mt-6 text-sm text-muted-foreground">Suivi GPS et assurance inclus.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
