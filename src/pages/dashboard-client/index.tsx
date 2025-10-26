"use client";

import { useMemo, useState, type ComponentType } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  MapPin,
  Receipt,
  MessageSquare,
  Settings,
  HelpCircle,
  Bell,
  TrendingUp,
  TrendingDown,
  FileText,
  MessageCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ActivityPoint = {
  label: string;
  commandes: number;
  livraisons: number;
};

type RecentActivity = {
  id: number;
  title: string;
  description: string;
  time: string;
};

type SidebarItem = {
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: "Tableau de bord", icon: LayoutDashboard },
  { label: "Commandes", icon: ShoppingBag },
  { label: "Suivi", icon: MapPin },
  { label: "Factures", icon: Receipt },
  { label: "Messages", icon: MessageSquare },
  { label: "Paramètres", icon: Settings },
  { label: "Aide", icon: HelpCircle },
];

const KPI_SPARKLINE = [
  { name: "S1", value: 32 },
  { name: "S2", value: 44 },
  { name: "S3", value: 38 },
  { name: "S4", value: 52 },
  { name: "S5", value: 61 },
  { name: "S6", value: 58 },
  { name: "S7", value: 72 },
];

const RECENT_ACTIVITIES: RecentActivity[] = [
  {
    id: 1,
    title: "Commande #SC-2048",
    description: "Livrée à temps avec signature électronique confirmée.",
    time: "Il y a 12 minutes",
  },
  {
    id: 2,
    title: "Nouvelle facture disponible",
    description: "Facture de mars générée et envoyée par email.",
    time: "Il y a 2 heures",
  },
  {
    id: 3,
    title: "Message de Laura Martin",
    description: "Question concernant la prise en charge express.",
    time: "Il y a 5 heures",
  },
];

const FILTERS = ["semaine", "mois", "trimestre"] as const;

type FilterValue = (typeof FILTERS)[number];

const DashboardClient = () => {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("mois");

  const activityData = useMemo<Record<FilterValue, ActivityPoint[]>>(
    () => ({
      semaine: [
        { label: "Lun", commandes: 22, livraisons: 18 },
        { label: "Mar", commandes: 26, livraisons: 21 },
        { label: "Mer", commandes: 19, livraisons: 17 },
        { label: "Jeu", commandes: 28, livraisons: 24 },
        { label: "Ven", commandes: 34, livraisons: 29 },
        { label: "Sam", commandes: 18, livraisons: 15 },
        { label: "Dim", commandes: 14, livraisons: 12 },
      ],
      mois: [
        { label: "S1", commandes: 85, livraisons: 74 },
        { label: "S2", commandes: 96, livraisons: 81 },
        { label: "S3", commandes: 112, livraisons: 95 },
        { label: "S4", commandes: 104, livraisons: 92 },
      ],
      trimestre: [
        { label: "Jan", commandes: 312, livraisons: 275 },
        { label: "Fév", commandes: 356, livraisons: 318 },
        { label: "Mar", commandes: 402, livraisons: 365 },
      ],
    }),
    []
  );

  const selectedActivity = activityData[activeFilter];
  const totalLivrees = selectedActivity.reduce((sum, point) => sum + point.livraisons, 0);
  const totalEnAttente = selectedActivity.reduce((sum, point) => sum + Math.max(point.commandes - point.livraisons, 0), 0);

  return (
    <div className="flex min-h-screen bg-[#f8f9fb] text-slate-900">
      <aside className="hidden w-72 flex-col border-r border-slate-200 bg-slate-900/95 px-6 py-8 text-slate-100 shadow-xl lg:flex">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563eb] text-lg font-semibold">
            SC
          </div>
          <div>
            <p className="text-sm text-slate-400">Connexion Swift</p>
            <p className="text-lg font-semibold text-white">Tableau de bord</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {SIDEBAR_ITEMS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                label === "Tableau de bord"
                  ? "bg-white/10 text-white shadow-lg"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner">
          <p className="text-sm font-semibold text-white">Assistance premium</p>
          <p className="mt-1 text-xs text-slate-300">
            Notre équipe répond en moins de 10 minutes pour les clients Pro.
          </p>
          <Button className="mt-4 w-full bg-[#8b5cf6] text-white hover:bg-[#7c3aed]">Contacter</Button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex flex-col gap-6 border-b border-slate-200 bg-white/80 px-6 py-6 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-400">Bienvenue</p>
              <h1 className="text-2xl font-semibold text-slate-900">Bonjour, Clara Dupont 👋</h1>
              <p className="text-sm text-slate-500">Suivez vos commandes et optimisez vos livraisons en temps réel.</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="relative h-11 w-11 rounded-xl border-slate-200 bg-white text-slate-600 hover:border-[#2563eb] hover:text-[#2563eb]"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#2563eb]" aria-hidden />
              </Button>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <Avatar className="h-11 w-11 border-2 border-[#2563eb]/20">
                  <AvatarImage src="https://i.pravatar.cc/100?img=48" alt="Clara Dupont" />
                  <AvatarFallback>CD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Clara Dupont</p>
                  <p className="text-xs text-slate-500">clara.dupont@swift.fr</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={72} className="h-2 w-32 bg-slate-100" />
                    <span className="text-xs text-slate-500">Profil 72%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border-none bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Commandes</CardTitle>
                <Badge className="bg-[#2563eb]/10 text-[#2563eb]">Objectif 150</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-slate-900">128</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-[#16a34a]" />
                  <span className="text-[#16a34a]">+12% vs mois dernier</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Taux de livraison</CardTitle>
                <Badge className="bg-[#16a34a]/10 text-[#16a34a]">Cible 95%</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-slate-900">92%</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-[#16a34a]" />
                  <span className="text-[#16a34a]">+4 pts</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Montant consommé</CardTitle>
                <Badge className="bg-[#8b5cf6]/10 text-[#8b5cf6]">Budget 45K€</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-3xl font-semibold text-slate-900">32 450€</p>
                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={KPI_SPARKLINE}>
                      <defs>
                        <linearGradient id="sparkline" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2ff" />
                      <XAxis dataKey="name" hide />
                      <RechartsTooltip cursor={false} />
                      <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="url(#sparkline)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Temps moyen de livraison</CardTitle>
                <Badge className="bg-[#2563eb]/10 text-[#2563eb]">Objectif 28 min</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-slate-900">31 min</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <TrendingDown className="h-4 w-4 text-[#2563eb]" />
                  <span className="text-[#2563eb]">-3 min</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </header>

        <section className="flex-1 space-y-8 px-6 pb-10">
          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <Card className="border-none bg-white shadow-sm">
              <CardHeader className="flex flex-col gap-4 border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">Activité mensuelle</CardTitle>
                    <p className="text-sm text-slate-500">Visualisez les commandes et livraisons selon la période.</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
                    {FILTERS.map((filter) => (
                      <Button
                        key={filter}
                        size="sm"
                        variant="ghost"
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold capitalize transition",
                          activeFilter === filter
                            ? "bg-white text-[#2563eb] shadow"
                            : "text-slate-500 hover:text-[#2563eb]"
                        )}
                        onClick={() => setActiveFilter(filter)}
                      >
                        {filter}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
                      <RechartsTooltip cursor={{ stroke: "#94a3b8", strokeDasharray: "4 4" }} />
                      <Line type="monotone" dataKey="commandes" stroke="#2563eb" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="livraisons" stroke="#16a34a" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col justify-between border-none bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">Livrées vs En attente</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-center gap-6 pt-6">
                <div className="h-64">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={[
                          { name: "Livrées", value: totalLivrees },
                          { name: "En attente", value: totalEnAttente },
                        ]}
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={4}
                      >
                        {["#16a34a", "#2563eb"].map((color) => (
                          <Cell key={color} fill={color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#16a34a]" />
                      <span className="text-sm text-slate-500">Livrées</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{totalLivrees}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#2563eb]" />
                      <span className="text-sm text-slate-500">En attente</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{totalEnAttente}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-none bg-white shadow-lg lg:col-span-2 lg:row-span-1 rounded-3xl">
              <CardHeader className="space-y-1 border-b border-slate-100 pb-5">
                <CardTitle className="text-lg font-semibold text-slate-900">Actions rapides</CardTitle>
                <p className="text-sm text-slate-500">
                  Accédez immédiatement aux fonctionnalités clés pour suivre, facturer et échanger avec vos clients.
                </p>
              </CardHeader>
              <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
                <Button
                  className="group flex h-full w-full flex-col items-start justify-between gap-4 rounded-3xl bg-[#2563eb] p-6 text-left text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white transition group-hover:bg-white/20">
                    <MapPin className="h-6 w-6" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-base font-semibold">Suivi en direct</p>
                    <p className="text-sm text-white/80">Visualiser les déplacements en temps réel</p>
                  </div>
                </Button>
                <Button
                  className="group flex h-full w-full flex-col items-start justify-between gap-4 rounded-3xl bg-[#16a34a] p-6 text-left text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white transition group-hover:bg-white/20">
                    <FileText className="h-6 w-6" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-base font-semibold">Mes factures</p>
                    <p className="text-sm text-white/80">Consulter et télécharger vos documents</p>
                  </div>
                </Button>
                <Button
                  className="group flex h-full w-full flex-col items-start justify-between gap-4 rounded-3xl bg-[#8b5cf6] p-6 text-left text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl md:col-span-2"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white transition group-hover:bg-white/20">
                    <MessageCircle className="h-6 w-6" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-base font-semibold">Messagerie</p>
                    <p className="text-sm text-white/80">Accéder à vos conversations clients</p>
                  </div>
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 bg-[#f9fafb] shadow-sm rounded-3xl">
              <CardHeader className="flex flex-row items-start justify-between gap-3 pb-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">Activités récentes</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">Un aperçu instantané des dernières interactions.</p>
                </div>
                <Badge className="mt-1 bg-[#2563eb]/10 text-xs font-medium text-[#2563eb]">Mis à jour en direct</Badge>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {RECENT_ACTIVITIES.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563eb]/40 hover:bg-white hover:shadow-md"
                  >
                    <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{activity.description}</p>
                    <span className="mt-2 block text-xs font-medium text-slate-400">{activity.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardClient;
