import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users } from "lucide-react";

const activityData = {
  semaine: [
    { label: "Lun", commandes: 62, satisfaction: 4.6 },
    { label: "Mar", commandes: 74, satisfaction: 4.7 },
    { label: "Mer", commandes: 80, satisfaction: 4.8 },
    { label: "Jeu", commandes: 92, satisfaction: 4.9 },
    { label: "Ven", commandes: 88, satisfaction: 4.7 },
    { label: "Sam", commandes: 64, satisfaction: 4.5 },
    { label: "Dim", commandes: 54, satisfaction: 4.4 },
  ],
  mois: [
    { label: "S1", commandes: 340, satisfaction: 4.7 },
    { label: "S2", commandes: 356, satisfaction: 4.8 },
    { label: "S3", commandes: 372, satisfaction: 4.8 },
    { label: "S4", commandes: 348, satisfaction: 4.6 },
  ],
  trimestre: [
    { label: "Oct", commandes: 986, satisfaction: 4.6 },
    { label: "Nov", commandes: 1042, satisfaction: 4.7 },
    { label: "Déc", commandes: 1124, satisfaction: 4.9 },
  ],
};

const Statistiques = () => {
  const [period, setPeriod] = useState<"semaine" | "mois" | "trimestre">("mois");

  const dataset = activityData[period];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-[#2563EB] via-[#4338CA] to-[#0F172A] p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Analytics</p>
          <h1 className="mt-2 font-['Inter'] text-3xl font-semibold">Pilotage des indicateurs clés</h1>
          <p className="mt-2 text-sm text-white/70">Comparez vos performances et ajustez vos objectifs opérationnels.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white/10 p-1">
          {(
            [
              { id: "semaine", label: "Semaine" },
              { id: "mois", label: "Mois" },
              { id: "trimestre", label: "Trimestre" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPeriod(item.id)}
              className={`rounded-2xl px-4 py-2 text-xs font-semibold transition ${
                period === item.id ? "bg-white text-[#2563EB] shadow" : "text-white/80 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-3xl border-none bg-white/95 shadow-lg xl:col-span-2">
          <CardHeader className="flex flex-col gap-4 border-b border-slate-200/70 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl">Trafic & satisfaction</CardTitle>
              <CardDescription>Volumes de commandes et ressenti client sur la période sélectionnée</CardDescription>
            </div>
            <Badge className="rounded-2xl bg-[#10B981]/10 px-3 py-1 text-[#047857]">Tendance positive</Badge>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer>
                <AreaChart data={dataset} margin={{ left: 0, right: 0 }}>
                  <defs>
                    <linearGradient id="statCommandes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="statSatisfaction" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F97316" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#F97316" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" />
                  <XAxis dataKey="label" stroke="#94A3B8" fontSize={12} tickMargin={12} />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={12}
                    yAxisId="left"
                    tickFormatter={(value) => `${value}`}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={12}
                    orientation="right"
                    yAxisId="right"
                    tickFormatter={(value) => `${value.toFixed(1)}★`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      borderColor: "#E2E8F0",
                      boxShadow: "0 18px 32px -24px rgba(15,23,42,0.25)",
                    }}
                    formatter={(value: number, name) =>
                      name === "satisfaction"
                        ? [`${value.toFixed(1)} / 5`, "Satisfaction"]
                        : [value, "Commandes"]
                    }
                  />
                  <Legend iconType="circle" />
                  <Area
                    dataKey="commandes"
                    name="Commandes"
                    yAxisId="left"
                    stroke="#2563EB"
                    fill="url(#statCommandes)"
                    strokeWidth={3}
                    type="monotone"
                  />
                  <Area
                    dataKey="satisfaction"
                    name="Satisfaction"
                    yAxisId="right"
                    stroke="#F97316"
                    fill="url(#statSatisfaction)"
                    strokeWidth={2}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Commandes</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {dataset.reduce((total, point) => total + point.commandes, 0)}
                </p>
                <p className="text-xs text-slate-500">Volume total sur la période</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Satisfaction</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {(
                    dataset.reduce((total, point) => total + point.satisfaction, 0) /
                    dataset.length
                  ).toFixed(1)}
                  /5
                </p>
                <p className="text-xs text-slate-500">Note moyenne clients</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Délai moyen</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">32 min</p>
                <p className="text-xs text-slate-500">Temps moyen de livraison</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-3xl border-none bg-white/95 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Indicateurs clés</CardTitle>
              <CardDescription>Focus opérations & relation client</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center gap-3 rounded-3xl bg-slate-50/90 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Taux de croissance</p>
                  <p className="text-xs text-slate-500">+18% sur les 30 derniers jours</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-3xl bg-slate-50/90 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#10B981]/10 text-[#047857]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Nouveaux clients</p>
                  <p className="text-xs text-slate-500">42 comptes ajoutés ce mois-ci</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-3xl bg-slate-50/90 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F97316]/10 text-[#B45309]">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Rentabilité par tournée</p>
                  <p className="text-xs text-slate-500">128 € de panier moyen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none bg-white/95 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Qualité de service</CardTitle>
              <CardDescription>Indice de performance globale</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl bg-gradient-to-br from-[#2563EB]/10 via-[#4338CA]/10 to-[#2563EB]/5 p-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2563EB]">Score Swift</p>
                <p className="mt-3 text-4xl font-bold text-slate-900">92%</p>
                <p className="mt-1 text-xs text-slate-500">Objectif trimestriel 88%</p>
              </div>
              <div className="grid gap-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Taux de recommandation</span>
                  <span className="font-semibold text-[#2563EB]">87%</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Taux de livraison à l'heure</span>
                  <span className="font-semibold text-[#10B981]">94%</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Incidents résolus 24h</span>
                  <span className="font-semibold text-[#F97316]">92%</span>
                </div>
              </div>
              <Button className="w-full rounded-2xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1D4ED8]">
                Télécharger le rapport complet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Statistiques;
