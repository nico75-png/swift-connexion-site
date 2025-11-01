import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ArrowUpRight, Clock3, ShieldAlert, Truck, UsersRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AnimatedCounter from "@/components/dashboard-client/AnimatedCounter";

interface TableauDeBordProps {
  onOpenOrderForm?: () => void;
}

const monthlyPerformance = [
  { month: "Jan", commandes: 320, revenus: 42_000 },
  { month: "Fév", commandes: 365, revenus: 45_600 },
  { month: "Mar", commandes: 410, revenus: 50_200 },
  { month: "Avr", commandes: 390, revenus: 48_100 },
  { month: "Mai", commandes: 452, revenus: 56_400 },
  { month: "Juin", commandes: 470, revenus: 59_300 },
  { month: "Juil", commandes: 498, revenus: 62_700 },
  { month: "Août", commandes: 462, revenus: 58_900 },
  { month: "Sep", commandes: 505, revenus: 64_200 },
  { month: "Oct", commandes: 526, revenus: 67_800 },
  { month: "Nov", commandes: 542, revenus: 70_100 },
  { month: "Déc", commandes: 568, revenus: 72_400 },
];

const systemAlerts = [
  {
    id: "1",
    label: "Retard critique",
    description: "3 livraisons express dépassent le délai de 20 min",
    level: "alert",
    actionLabel: "Contacter le dispatch",
  },
  {
    id: "2",
    label: "Maintenance planifiée",
    description: "Mise à jour du module facturation dimanche 06:00",
    level: "info",
    actionLabel: "Consulter la note",
  },
  {
    id: "3",
    label: "Taux d'incident",
    description: "2 signalements chauffeur à analyser",
    level: "warning",
    actionLabel: "Ouvrir le rapport",
  },
];

const summaryMetrics = [
  {
    id: "orders",
    title: "Commandes du mois",
    numericValue: 568,
    decimals: 0,
    suffix: "",
    delta: "+18% vs mois dernier",
    accent: "bg-[#2563EB]/15 text-[#2563EB]",
    ring: "ring-[#2563EB]/30",
  },
  {
    id: "clients",
    title: "Nouveaux clients",
    numericValue: 42,
    decimals: 0,
    suffix: "",
    delta: "+12 inscrits",
    accent: "bg-[#10B981]/15 text-[#047857]",
    ring: "ring-[#10B981]/30",
  },
  {
    id: "drivers",
    title: "Chauffeurs actifs",
    numericValue: 128,
    decimals: 0,
    suffix: "",
    delta: "94% disponibilité",
    accent: "bg-[#F59E0B]/15 text-[#B45309]",
    ring: "ring-[#F59E0B]/30",
  },
  {
    id: "revenue",
    title: "Revenus",
    numericValue: 72.4,
    decimals: 1,
    suffix: " k€",
    delta: "+6,8%",
    accent: "bg-[#6366F1]/15 text-[#4338CA]",
    ring: "ring-[#6366F1]/30",
  },
];

const activityHighlights = [
  {
    id: "express",
    title: "Express",
    value: "212 livraisons",
    detail: "+22%",
    tone: "bg-[#2563EB]/10 text-[#1D4ED8]",
  },
  {
    id: "last-mile",
    title: "Dernier km",
    value: "156 livraisons",
    detail: "94% à l'heure",
    tone: "bg-[#10B981]/10 text-[#047857]",
  },
  {
    id: "international",
    title: "International",
    value: "68 colis",
    detail: "2 retards",
    tone: "bg-[#F97316]/10 text-[#B45309]",
  },
];

const TableauDeBord = ({ onOpenOrderForm }: TableauDeBordProps) => (
  <div className="space-y-8">
    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {summaryMetrics.map((metric, index) => (
        <motion.div
          key={metric.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, type: "spring", stiffness: 140, damping: 20 }}
        >
          <Card
            className={cn(
              "group rounded-3xl border-none bg-white/85 p-6 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.45)] ring-1 transition hover:-translate-y-1 hover:shadow-[0_32px_65px_-30px_rgba(37,99,235,0.35)]",
              metric.ring,
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{metric.title}</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <AnimatedCounter
                    value={metric.numericValue}
                    decimals={metric.decimals}
                    className="text-3xl font-bold text-slate-900"
                    suffix={metric.suffix}
                  />
                </div>
                <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#10B981]">
                  <ArrowUpRight className="h-4 w-4" />
                  {metric.delta}
                </p>
              </div>
              <div className={cn("rounded-2xl px-3 py-2 text-xs font-semibold", metric.accent)}>Focus</div>
            </div>
          </Card>
        </motion.div>
      ))}
    </section>

    <section className="grid gap-6 xl:grid-cols-3">
      <Card className="rounded-3xl border-none bg-white/90 shadow-md xl:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Performances mensuelles</CardTitle>
            <CardDescription>Suivi des commandes et revenus consolidés</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="rounded-2xl bg-[#2563EB]/10 px-3 py-1 text-[#2563EB]">Mise à jour 5 min</Badge>
            <Button
              variant="outline"
              className="rounded-2xl border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:border-[#2563EB]/40 hover:text-[#2563EB]"
              onClick={onOpenOrderForm}
            >
              Planifier une course
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[280px] w-full">
            <ResponsiveContainer>
              <AreaChart data={monthlyPerformance} margin={{ left: 0, right: 0 }}>
                <defs>
                  <linearGradient id="colorCommandes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickMargin={12} />
                <Tooltip
                  cursor={{ stroke: "#CBD5E1" }}
                  contentStyle={{
                    borderRadius: 16,
                    borderColor: "#E2E8F0",
                    boxShadow: "0 18px 32px -24px rgba(15,23,42,0.25)",
                  }}
                  formatter={(value: number, name) =>
                    name === "revenus" ? [`${value.toLocaleString("fr-FR")} €`, "Revenus"] : [value, "Commandes"]
                  }
                />
                <Area
                  dataKey="commandes"
                  stroke="#2563EB"
                  fill="url(#colorCommandes)"
                  strokeWidth={3}
                  type="monotone"
                  name="Commandes"
                />
                <Area
                  dataKey="revenus"
                  stroke="#10B981"
                  fill="url(#colorRevenus)"
                  strokeWidth={3}
                  type="monotone"
                  name="Revenus"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Revenus</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">72 400 €</p>
              <p className="text-xs text-slate-500">Projection fin de mois</p>
            </div>
            <div className="rounded-2xl bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Panier moyen</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">128 €</p>
              <p className="text-xs text-slate-500">+6 € vs dernier mois</p>
            </div>
            <div className="rounded-2xl bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Satisfaction client</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">4,8 / 5</p>
              <p className="text-xs text-slate-500">Basé sur 328 avis</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-none bg-white/90 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Alertes système</CardTitle>
          <CardDescription>Retards, incidents et anomalies à surveiller</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {systemAlerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-2xl",
                      alert.level === "alert" && "bg-rose-100 text-rose-600",
                      alert.level === "warning" && "bg-amber-100 text-amber-600",
                      alert.level === "info" && "bg-sky-100 text-sky-600",
                    )}
                  >
                    <ShieldAlert className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{alert.label}</p>
                    <p className="text-xs text-slate-500">{alert.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-[#2563EB] shadow-sm hover:border-[#2563EB]/30 hover:bg-[#2563EB]/10"
                >
                  {alert.actionLabel}
                </Button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-3xl bg-[#2563EB]/10 px-4 py-3 text-sm text-[#1D4ED8]">
            <span>Activer les alertes temps réel</span>
            <Button className="rounded-2xl bg-[#2563EB] px-3 py-1 text-xs font-semibold text-white hover:bg-[#1D4ED8]">
              Paramétrer
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>

    <section className="grid gap-6 lg:grid-cols-3">
      <Card className="rounded-3xl border-none bg-white/90 shadow-md lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Activité des équipes</CardTitle>
            <CardDescription>Livraisons et niveau de charge des équipes terrain</CardDescription>
          </div>
          <Badge className="rounded-2xl bg-[#10B981]/10 px-3 py-1 text-[#047857]">Flux stable</Badge>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Livraisons express</p>
                <p className="text-xs text-slate-500">Moyenne 42 min</p>
              </div>
            </div>
            <ul className="mt-5 space-y-3">
              {activityHighlights.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.value}</p>
                  </div>
                  <span className={cn("rounded-2xl px-3 py-1 text-xs font-semibold", item.tone)}>{item.detail}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6366F1]/15 text-[#4338CA]">
                <UsersRound className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Disponibilité chauffeurs</p>
                <p className="text-xs text-slate-500">Mise à jour en temps réel</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {[
                { name: "Île-de-France", value: "47 chauffeurs", status: "94% disponibles" },
                { name: "Auvergne-Rhône-Alpes", value: "32 chauffeurs", status: "88% disponibles" },
                { name: "PACA", value: "21 chauffeurs", status: "91% disponibles" },
              ].map((region) => (
                <div key={region.name} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                    <span>{region.name}</span>
                    <span>{region.value}</span>
                  </div>
                  <p className="text-xs text-slate-500">{region.status}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-none bg-white/90 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Temps forts du jour</CardTitle>
          <CardDescription>Suivi des points opérationnels essentiels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm font-semibold text-slate-900">Incident résolu</p>
            <p className="text-xs text-slate-500">Retard plateforme Nord normalisé</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-[#10B981]">
              <ArrowUpRight className="h-4 w-4" />
              KPI ponctualité +4 pts
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Sessions à confirmer</p>
            <ul className="mt-3 space-y-2 text-xs text-slate-500">
              <li className="flex items-center justify-between">
                <span>Formation sécurité chauffeurs</span>
                <span className="rounded-full bg-[#2563EB]/10 px-2 py-0.5 text-[#2563EB]">Demain</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Audit qualité grands comptes</span>
                <span className="rounded-full bg-[#F97316]/10 px-2 py-0.5 text-[#B45309]">Vendredi</span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Temps moyen de prise en charge</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">18</span>
              <span className="text-sm text-slate-500">minutes</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-[#2563EB]">
              <Clock3 className="h-4 w-4" />
              4 minutes de mieux qu'hier
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  </div>
);

export default TableauDeBord;
