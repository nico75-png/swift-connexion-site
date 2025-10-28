import { useMemo } from "react";
import {
  Bell,
  CalendarClock,
  CreditCard,
  Home,
  Layers3,
  LineChart,
  Settings,
  Users,
  Wallet,
  Youtube,
  Instagram,
  Twitter,
} from "lucide-react";

import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const PRIMARY_NAVIGATION = [
  { label: "Maison", icon: Home },
  { label: "Planifier des publications", icon: CalendarClock },
  { label: "Utilisateurs", icon: Users },
  { label: "Revenu", icon: Wallet },
  { label: "Facturation", icon: CreditCard },
  { label: "Paramètres", icon: Settings },
];

const PLATFORM_SUMMARY = [
  { label: "Instagram", icon: Instagram },
  { label: "YouTube", icon: Youtube },
  { label: "Twitter", icon: Twitter },
];

const ACTIVITY_METRICS = [
  { label: "Abonnés", caption: "Total" },
  { label: "Vues quotidiennes", caption: "Moyenne" },
  { label: "Jours actifs", caption: "Sur 30 jours" },
];

const PLANNED_EVENTS = [
  { title: "Campagne de printemps", date: "15 mars", platform: "Instagram" },
  { title: "Live produit", date: "22 mars", platform: "YouTube" },
  { title: "Annonce communautaire", date: "28 mars", platform: "Twitter" },
];

const ACCOUNT_PROGRESS = [
  { label: "Progression du compte", value: 76 },
  { label: "Objectif vues", value: 54 },
  { label: "Taux d'engagement", value: 68 },
];

const TableauDeBord = () => {
  const { resolvedDisplayName, fallbackEmail } = useAuth();

  const displayName = resolvedDisplayName ?? fallbackEmail ?? "Client";
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  return (
    <div className="rounded-3xl border border-border/40 bg-muted/10 p-6 shadow-sm backdrop-blur-xl lg:p-8">
      <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_320px] xl:items-start">
        <aside className="hidden xl:block">
          <nav aria-label="Navigation principale" className="space-y-2">
            {PRIMARY_NAVIGATION.map((item, index) => (
              <button
                key={item.label}
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  index === 0
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted/60",
                )}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-4 rounded-3xl bg-background/80 p-6 shadow-sm ring-1 ring-black/5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {greeting} {displayName}
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                Tableau de bord client
              </h1>
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <Select defaultValue="instagram">
                <SelectTrigger className="w-full min-w-[220px] rounded-2xl border-muted-foreground/20 bg-muted/40">
                  <SelectValue placeholder="Sélectionner un compte" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="instagram">Compte Instagram</SelectItem>
                  <SelectItem value="youtube">Chaîne YouTube</SelectItem>
                  <SelectItem value="twitter">Profil Twitter</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full border border-transparent bg-muted/40 text-muted-foreground hover:bg-muted"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" aria-hidden="true" />
                </Button>
                <Avatar className="h-12 w-12 border border-muted-foreground/20">
                  <AvatarFallback className="text-sm font-medium uppercase text-muted-foreground">
                    {displayName.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <Card className="rounded-3xl border-none bg-background/80 shadow-sm ring-1 ring-black/5">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Instagram Subscribers</CardTitle>
                <CardDescription>Performance globale des abonnés</CardDescription>
              </div>
              <Button type="button" variant="ghost" size="sm" className="rounded-full">
                <LineChart className="mr-2 h-4 w-4" aria-hidden="true" />
                Vue détaillée
              </Button>
            </CardHeader>
            <CardContent>
              <div
                aria-hidden="true"
                className="h-48 rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-gradient-to-br from-muted/40 to-muted/20"
              />
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="rounded-3xl border-none bg-background/80 shadow-sm ring-1 ring-black/5">
              <CardHeader>
                <CardTitle className="text-xl">Résumé des performances par plateforme</CardTitle>
                <CardDescription>Vue d'ensemble des canaux clés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  {PLATFORM_SUMMARY.map(platform => (
                    <div
                      key={platform.label}
                      className="flex flex-col gap-2 rounded-2xl border border-muted-foreground/20 bg-muted/20 p-4 text-sm"
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <platform.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                        {platform.label}
                      </div>
                      <p className="text-xs text-muted-foreground">Statistiques principales</p>
                      <div className="mt-3 h-20 rounded-xl border border-dashed border-muted-foreground/30 bg-background/70" aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none bg-background/80 shadow-sm ring-1 ring-black/5">
              <CardHeader>
                <CardTitle className="text-xl">Récapitulatif des vues et abonnés</CardTitle>
                <CardDescription>Aperçu synthétique des indicateurs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  {ACTIVITY_METRICS.map(metric => (
                    <div
                      key={metric.label}
                      className="flex flex-col gap-1 rounded-2xl border border-muted-foreground/20 bg-muted/10 p-4"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {metric.caption}
                      </span>
                      <span className="text-lg font-semibold text-foreground">--</span>
                      <span className="text-sm text-muted-foreground">{metric.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-3xl border-none bg-background/80 shadow-sm ring-1 ring-black/5">
            <CardHeader>
              <CardTitle className="text-xl">Événements planifiés</CardTitle>
              <CardDescription>Prochaines actions programmées</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {PLANNED_EVENTS.map(event => (
                  <li key={event.title} className="flex items-center justify-between gap-4 rounded-2xl border border-muted-foreground/20 bg-muted/10 p-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.platform}</p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{event.date}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="rounded-3xl border-none bg-background/80 shadow-sm ring-1 ring-black/5">
            <CardHeader>
              <CardTitle className="text-xl">Sommaire du compte</CardTitle>
              <CardDescription>Progression générale</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {ACCOUNT_PROGRESS.map(item => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium text-foreground">
                    <span>{item.label}</span>
                    <span className="text-muted-foreground">{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-2 rounded-full bg-muted/60" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none bg-background/80 shadow-sm ring-1 ring-black/5">
            <CardHeader>
              <CardTitle className="text-xl">Paiements</CardTitle>
              <CardDescription>Revenus et dépenses moyennes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-muted-foreground/20 bg-emerald-500/10 p-4 text-sm">
                <div className="flex items-center gap-2 font-semibold text-emerald-600">
                  <Wallet className="h-4 w-4" aria-hidden="true" />
                  Revenus
                </div>
                <span className="font-medium text-emerald-600">+00%</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-muted-foreground/20 bg-rose-500/10 p-4 text-sm">
                <div className="flex items-center gap-2 font-semibold text-rose-600">
                  <Layers3 className="h-4 w-4" aria-hidden="true" />
                  Dépenses
                </div>
                <span className="font-medium text-rose-600">-00%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Les pourcentages indiquent l'évolution moyenne hebdomadaire.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default TableauDeBord;
