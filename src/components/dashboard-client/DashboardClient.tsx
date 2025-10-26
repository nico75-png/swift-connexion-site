"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LineChart,
  MessageSquare,
  PlusCircle,
  Receipt,
  Search,
  Settings,
  ShoppingBag,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type DashboardClientProps = {
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
};

const NAVIGATION_ITEMS = [
  { label: "Tableau de bord", icon: LayoutDashboard, value: "dashboard" },
  { label: "Commandes", icon: ShoppingBag, value: "orders" },
  { label: "Factures", icon: Receipt, value: "invoices" },
  { label: "Suivi", icon: LineChart, value: "tracking" },
  { label: "Messages", icon: MessageSquare, value: "messages" },
  { label: "Paramètres", icon: Settings, value: "settings" },
] as const;

type DashboardSection = (typeof NAVIGATION_ITEMS)[number]["value"];

type TabItem = {
  value: DashboardSection;
  label: string;
  description: string;
};

const TAB_ITEMS: TabItem[] = [
  { value: "dashboard", label: "Tableau de bord", description: "Vue synthétique de vos dépenses." },
  { value: "orders", label: "Commandes", description: "Historique des achats en ligne et en boutique." },
  { value: "invoices", label: "Factures", description: "Factures fournisseurs et documents à suivre." },
  { value: "tracking", label: "Suivi", description: "Suivi de vos objectifs financiers et d'épargne." },
  { value: "messages", label: "Messages", description: "Conversations et notifications récentes." },
  { value: "settings", label: "Paramètres", description: "Configuration de votre espace personnel." },
];

const CATEGORY_PLACEHOLDERS = [
  "Logement",
  "Transport",
  "Alimentation",
  "Loisirs",
  "Épargne",
];

const EXPENSE_PLACEHOLDER_COUNT = 5;

const DashboardClient = ({
  userName,
  userEmail,
  avatarUrl,
}: DashboardClientProps) => {
  const [activeSection, setActiveSection] = useState<DashboardSection>("dashboard");

  const expenseSkeletons = useMemo(
    () => Array.from({ length: EXPENSE_PLACEHOLDER_COUNT }, (_, index) => index),
    [],
  );

  const displayName = userName || userEmail || "Client";

  const initials = useMemo(() => {
    if (displayName.trim().length === 0) {
      return "CL";
    }

    const parts = displayName.split(" ");
    const first = parts.at(0)?.charAt(0) ?? "C";
    const last = parts.at(-1)?.charAt(0) ?? "L";

    return `${first}${last}`.toUpperCase();
  }, [displayName]);

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-muted/10 p-4 text-foreground md:p-6 lg:p-10">
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_320px] xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="flex flex-col gap-6 rounded-3xl border border-border/40 bg-background/80 p-6 backdrop-blur">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border border-border/60">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={displayName} />
              ) : (
                <AvatarFallback>{initials}</AvatarFallback>
              )}
            </Avatar>
            <div className="space-y-1">
              <p className="text-base font-semibold leading-tight">{displayName}</p>
              <p className="text-sm text-muted-foreground">
                {userEmail || "email.indisponible@example.com"}
              </p>
            </div>
          </div>

          <nav aria-label="Navigation principale" className="flex flex-col gap-1">
            {NAVIGATION_ITEMS.map(({ label, icon: Icon, value }) => {
              const isActive = activeSection === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveSection(value)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isActive
                      ? "bg-primary/10 text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/70",
                  )}
                  aria-current={isActive ? "page" : undefined}
                  aria-pressed={isActive}
                >
                  <Icon
                    className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")}
                    aria-hidden="true"
                  />
                  <span className={cn("flex-1", isActive ? "text-foreground" : "text-muted-foreground")}>{label}</span>
                </button>
              );
            })}
          </nav>

          <Card className="border-border/40 bg-muted/50">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Synchronisation</CardTitle>
              <CardDescription>Connectez vos comptes bancaires</CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" variant="secondary" className="w-full rounded-2xl">
                <CreditCard className="mr-2 h-4 w-4" aria-hidden="true" />
                Ajouter un compte
              </Button>
            </CardContent>
          </Card>
        </aside>

        <section className="flex flex-col gap-6">
          <header className="flex flex-col gap-4 rounded-3xl border border-border/40 bg-background/80 p-6 backdrop-blur md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Bienvenue sur votre espace financier</p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Dépenses et suivi
              </h1>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <div className="relative w-full sm:w-64">
                <Input
                  type="search"
                  placeholder="Rechercher une dépense"
                  className="rounded-2xl border-border/40 pr-10"
                  aria-label="Rechercher une dépense"
                />
                <Search
                  className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <Button type="button" className="rounded-2xl">
                <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                Nouvelle dépense
              </Button>
            </div>
          </header>

          <Card className="rounded-3xl border border-border/40 bg-background/80">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl">Évolution des dépenses</CardTitle>
                <CardDescription>Visualisation des tendances</CardDescription>
              </div>
              <Button type="button" variant="outline" className="rounded-2xl">
                Voir les rapports
              </Button>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-72 w-full rounded-3xl" aria-hidden="true" />
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-border/40 bg-background/80">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Dernières dépenses</CardTitle>
                <CardDescription>Suivi détaillé de vos transactions</CardDescription>
              </div>
              <Button type="button" variant="ghost" size="sm" className="rounded-full">
                Voir tout
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {expenseSkeletons.map(index => (
                <div
                  key={`expense-skeleton-${index}`}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-border/60 bg-muted/30 p-4"
                >
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" aria-hidden="true" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" aria-hidden="true" />
                      <Skeleton className="h-3 w-24" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-20" aria-hidden="true" />
                    <Skeleton className="h-8 w-24 rounded-full" aria-hidden="true" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <aside className="flex flex-col gap-6 rounded-3xl border border-border/40 bg-background/80 p-6 backdrop-blur">
          <Card className="border-none bg-transparent shadow-none">
            <CardHeader>
              <CardTitle className="text-lg">Répartition</CardTitle>
              <CardDescription>Vision par catégories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {CATEGORY_PLACEHOLDERS.map(category => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                    <span>{category}</span>
                    <span className="text-xs text-muted-foreground">0%</span>
                  </div>
                  <Progress value={0} className="h-2 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-muted/40">
            <CardHeader>
              <CardTitle className="text-base">Conseils budgétaires</CardTitle>
              <CardDescription>Optimisez vos dépenses à venir</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <LineChart className="mt-1 h-4 w-4 text-primary" aria-hidden="true" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" aria-hidden="true" />
                  <Skeleton className="h-3 w-32" aria-hidden="true" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BarChart3 className="mt-1 h-4 w-4 text-primary" aria-hidden="true" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" aria-hidden="true" />
                  <Skeleton className="h-3 w-28" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Card className="rounded-3xl border border-border/40 bg-background/80">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl">Sections</CardTitle>
          <CardDescription>Accédez rapidement à vos modules</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
            <TabsList className="flex w-full flex-wrap justify-start gap-2 rounded-2xl bg-muted/50 p-2">
              {TAB_ITEMS.map(({ value, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="rounded-2xl px-4 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            {TAB_ITEMS.map(({ value, label, description }) => (
              <TabsContent key={value} value={value} className="m-0">
                <Card className="border-border/40 bg-muted/40">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-lg">{label}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 p-6">
                    <Skeleton className="h-4 w-48" aria-hidden="true" />
                    <Skeleton className="h-3 w-64" aria-hidden="true" />
                    <Skeleton className="h-3 w-56" aria-hidden="true" />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardClient;
