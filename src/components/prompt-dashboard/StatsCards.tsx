import { useMemo } from "react";
import {
  PackageCheck,
  GaugeCircle,
  Euro,
  TimerReset,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StatsCards = () => {
  const stats = useMemo(
    () => [
      {
        label: "Commandes sur 30 jours",
        value: "128",
        change: "+12% vs. période précédente",
        icon: PackageCheck,
        accent: "bg-amber-100 text-amber-600",
      },
      {
        label: "Taux de livraison",
        value: "98%",
        change: "Stabilité enregistrée",
        icon: GaugeCircle,
        accent: "bg-green-100 text-green-600",
      },
      {
        label: "Montant consommé",
        value: "8 450 €",
        change: "Budget maîtrisé",
        icon: Euro,
        accent: "bg-blue-100 text-blue-600",
      },
      {
        label: "Délai moyen",
        value: "1,8 jour",
        change: "-0,4 j par rapport à la moyenne",
        icon: TimerReset,
        accent: "bg-purple-100 text-purple-600",
      },
    ],
    [],
  );

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="rounded-3xl border border-slate-200/70 bg-white/95 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{stat.label}</CardTitle>
              <span className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.accent}`}>
                <Icon className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardContent className="space-y-2 pb-6">
              <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
              <p className="text-xs font-medium text-slate-500">{stat.change}</p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
};

export default StatsCards;
