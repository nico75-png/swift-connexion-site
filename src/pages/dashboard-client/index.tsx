"use client";

import { type ComponentType } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  MapPin,
  Receipt,
  MessageSquare,
  Settings,
  HelpCircle,
  Bell,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

const KPI_CARDS = [
  { label: "Commandes", value: "128", trend: "+12 %", tone: "text-[#2563eb]" },
  { label: "Livraisons réussies", value: "92 %", trend: "+4 pts", tone: "text-[#16a34a]" },
  { label: "Montant simulé", value: "32 450 €", trend: "—", tone: "text-[#8b5cf6]" },
  { label: "Délai moyen", value: "31 min", trend: "-3 min", tone: "text-[#2563eb]" },
];

const QUICK_ACTIONS = [
  { label: "Suivi", color: "bg-[#2563eb]" },
  { label: "Factures", color: "bg-[#8b5cf6]" },
  { label: "Messagerie", color: "bg-[#16a34a]" },
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

const SUMMARY_CARDS = [
  {
    title: "Taux de satisfaction",
    accent: "text-[#2563eb]",
    background: "bg-[#2563eb]/10",
    value: "4.7 / 5",
    detail: "Moyenne des 30 derniers avis.",
  },
  {
    title: "Livraisons express",
    accent: "text-[#16a34a]",
    background: "bg-[#16a34a]/10",
    value: "68 %",
    detail: "+6 pts vs. le mois dernier.",
  },
  {
    title: "Nouvelles demandes",
    accent: "text-[#8b5cf6]",
    background: "bg-[#8b5cf6]/10",
    value: "24",
    detail: "En attente d’affectation.",
  },
  {
    title: "Centre d’assistance",
    accent: "text-slate-700",
    background: "bg-slate-100",
    value: "5",
    detail: "Tickets à traiter aujourd’hui.",
  },
];

const DashboardClient = () => {
  const totalLivrees = 74;
  const totalEnAttente = 18;
  const total = totalLivrees + totalEnAttente;
  const donutRadius = 42;
  const circumference = 2 * Math.PI * donutRadius;
  const donutDasharray = circumference;
  const donutDashoffset = circumference * (1 - totalLivrees / total);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fb] text-slate-900">
      <aside className="hidden h-full w-72 flex-col border-r border-slate-200 bg-slate-900/95 px-6 py-8 text-slate-100 shadow-xl lg:flex">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563eb] text-lg font-semibold">SC</div>
          <div>
            <p className="text-[clamp(11px,0.75vw,13px)] text-slate-400">Swift Connexion</p>
            <p className="text-[clamp(16px,1.2vw,20px)] font-semibold text-white">Tableau de bord</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {SIDEBAR_ITEMS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[clamp(12px,0.85vw,15px)] font-medium transition",
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
          <p className="text-[clamp(12px,0.85vw,15px)] font-semibold text-white">Assistance premium</p>
          <p className="mt-1 text-[clamp(11px,0.75vw,13px)] text-slate-300">
            Notre équipe répond en moins de 10 minutes pour les clients Pro.
          </p>
          <Button className="mt-4 w-full bg-[#8b5cf6] text-white hover:bg-[#7c3aed]">Contacter</Button>
        </div>
      </aside>

      <main className="flex flex-1 overflow-hidden">
        <div className="grid h-full w-full grid-rows-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-4 bg-white/30 p-6">
          <section className="grid grid-cols-1 gap-4 overflow-hidden rounded-3xl bg-white/80 p-5 shadow-sm backdrop-blur lg:grid-cols-[1.4fr_0.9fr]">
            <div className="flex h-full flex-col justify-between gap-4 overflow-hidden">
              <header className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-[clamp(12px,0.8vw,14px)] uppercase tracking-[0.18em] text-slate-400">Bienvenue</p>
                  <h1 className="text-[clamp(22px,2vw,32px)] font-semibold text-slate-900">Bonjour, Clara Dupont 👋</h1>
                  <p className="text-[clamp(13px,1vw,16px)] text-slate-500">
                    Suivez vos commandes et optimisez vos livraisons en temps réel.
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                  <Button
                    type="button"
                    variant="outline"
                    className="relative h-10 w-10 rounded-xl border-slate-200 bg-white text-slate-600 hover:border-[#2563eb] hover:text-[#2563eb]"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#2563eb]" aria-hidden />
                  </Button>
                  <Avatar className="h-10 w-10 border-2 border-[#2563eb]/20">
                    <AvatarImage src="https://i.pravatar.cc/100?img=48" alt="Clara Dupont" />
                    <AvatarFallback>CD</AvatarFallback>
                  </Avatar>
                </div>
              </header>

              <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4">
                {KPI_CARDS.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white/90 p-3 text-center shadow-sm"
                  >
                    <p className="text-[clamp(13px,0.9vw,16px)] text-slate-500">{item.label}</p>
                    <p className="text-[clamp(24px,2vw,32px)] font-bold text-slate-900">{item.value}</p>
                    <span className={cn("text-[clamp(11px,0.75vw,14px)] font-semibold", item.tone)}>{item.trend}</span>
                  </div>
                ))}
              </div>

              <div className="grid h-32 grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white/90 p-4 md:grid-cols-[1.7fr_1fr]">
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between text-[clamp(12px,0.8vw,14px)] text-slate-500">
                    <p className="font-medium text-slate-700">Activité mensuelle</p>
                    <span>Mois en cours</span>
                  </div>
                  <svg viewBox="0 0 160 60" className="h-full w-full overflow-visible">
                    <defs>
                      <linearGradient id="activity-line" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 42 L20 36 L40 32 L60 28 L80 22 L100 25 L120 18 L140 20 L160 14"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0 42 L20 36 L40 32 L60 28 L80 22 L100 25 L120 18 L140 20 L160 14 L160 60 L0 60 Z"
                      fill="url(#activity-line)"
                    />
                  </svg>
                </div>
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <div className="relative flex h-24 w-24 items-center justify-center">
                    <svg viewBox="0 0 120 120" className="h-full w-full">
                      <circle cx="60" cy="60" r="42" fill="none" stroke="#e2e8f0" strokeWidth="16" />
                      <circle
                        cx="60"
                        cy="60"
                        r="42"
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="16"
                        strokeDasharray={`${donutDasharray} ${donutDasharray}`}
                        strokeDashoffset={donutDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <p className="text-[clamp(12px,0.8vw,14px)] text-slate-500">Livrées</p>
                      <p className="text-[clamp(18px,1.5vw,26px)] font-semibold text-slate-900">{totalLivrees}</p>
                    </div>
                  </div>
                  <p className="text-[clamp(11px,0.75vw,14px)] text-slate-500">En attente : {totalEnAttente}</p>
                </div>
              </div>
            </div>

            <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-white/70 p-5">
              <div className="space-y-2">
                <h2 className="text-[clamp(16px,1.3vw,22px)] font-semibold text-slate-900">Actions rapides</h2>
                <p className="text-[clamp(12px,0.8vw,14px)] text-slate-500">
                  Accédez immédiatement aux fonctionnalités clés.
                </p>
              </div>
              <div className="flex flex-1 items-center justify-between gap-3">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className={cn(
                      "flex h-24 flex-1 items-center justify-center rounded-2xl text-[clamp(13px,0.9vw,16px)] font-semibold text-white shadow-lg transition hover:brightness-110",
                      action.color
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 overflow-hidden rounded-3xl bg-white/70 p-5 shadow-sm lg:grid-cols-2">
            <div className="flex flex-col justify-between gap-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-[clamp(16px,1.3vw,22px)] font-semibold text-slate-900">Activités récentes</h2>
                <Button variant="outline" className="h-9 rounded-full border-slate-200 px-4 text-[clamp(11px,0.75vw,14px)] text-slate-600">
                  Voir plus
                </Button>
              </div>
              <p className="text-[clamp(12px,0.8vw,14px)] text-slate-500">
                Un aperçu instantané des dernières interactions.
              </p>
              <div className="grid flex-1 grid-cols-1 gap-3 pt-2 md:grid-cols-3">
                {RECENT_ACTIVITIES.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-white/90 p-3 text-left shadow-sm"
                  >
                    <p className="text-[clamp(13px,0.9vw,16px)] font-semibold text-slate-900">{activity.title}</p>
                    <p className="text-[clamp(11px,0.75vw,14px)] text-slate-500">{activity.description}</p>
                    <p className="text-[clamp(10px,0.7vw,12px)] font-medium text-slate-400">{activity.time}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[clamp(12px,0.8vw,14px)] text-slate-600">
              {SUMMARY_CARDS.map((card) => (
                <div key={card.title} className={cn("flex flex-col justify-between gap-2 rounded-2xl p-4", card.background)}>
                  <p className={cn("font-semibold", card.accent)}>{card.title}</p>
                  <p className="text-[clamp(18px,1.5vw,26px)] font-bold text-slate-900">{card.value}</p>
                  <p className="text-[clamp(11px,0.75vw,14px)] text-slate-500">{card.detail}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardClient;
