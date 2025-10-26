import { ComponentType, FC, ReactNode } from "react";
import {
  Bell,
  Eye,
  FileText,
  Headset,
  HelpCircle,
  LayoutDashboard,
  MessageCircle,
  Package,
  PhoneCall,
  Radar,
  Settings,
  Share2,
  SquarePen,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type IconType = ComponentType<{ className?: string }>;

const SIDEBAR_SECTIONS: Array<{
  label: string;
  icon: IconType;
  children?: Array<{ label: string; icon?: IconType }>;
}> = [
  { label: "Tableau de bord", icon: LayoutDashboard },
  {
    label: "Mes commandes",
    icon: Package,
    children: [
      { label: "Créer", icon: SquarePen },
      { label: "Voir", icon: Eye },
      { label: "Recommander", icon: Share2 },
      { label: "Contacter le chauffeur", icon: PhoneCall },
    ],
  },
  { label: "Suivi en temps réel", icon: Radar },
  { label: "Factures", icon: FileText },
  { label: "Messages", icon: MessageCircle },
  { label: "Paramètres", icon: Settings },
  { label: "Soutien", icon: Headset },
  { label: "Centre d’aide", icon: HelpCircle },
];

const DISTRIBUTION_SEGMENTS = [
  { label: "Shopping", description: "Suivi des achats" },
  { label: "Housing", description: "Logement" },
  { label: "Transportation", description: "Déplacements" },
  { label: "Food & Drink", description: "Repas" },
  { label: "Entertainment", description: "Divertissement" },
];

const PLACEHOLDER_ACTIVITIES = Array.from({ length: 5 });

const DashboardClient: FC = () => {
  return (
    <div className="w-full rounded-[32px] bg-muted/30 p-4 sm:p-6 lg:p-8">
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-[28px] bg-zinc-950 text-zinc-50 shadow-xl ring-1 ring-black/20">
          <div className="flex flex-col gap-8 p-6">
            <header className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border border-white/10">
                <AvatarFallback className="bg-white/10 text-sm font-semibold uppercase tracking-wide">
                  CF
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-base font-semibold">Client Farhan</p>
                <p className="text-xs text-white/60">client@email.com</p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="ml-auto h-9 w-9 rounded-full bg-white/5 text-white hover:bg-white/10"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
              </Button>
            </header>

            <nav aria-label="Navigation du tableau de bord" className="space-y-4">
              {SIDEBAR_SECTIONS.map((section, index) => (
                <div key={section.label} className="space-y-2">
                  <SidebarItem
                    icon={<section.icon className="h-4 w-4" aria-hidden="true" />}
                    active={index === 0}
                  >
                    {section.label}
                  </SidebarItem>

                  {section.children && (
                    <div className="ml-10 space-y-1">
                      {section.children.map((child) => (
                        <SidebarItem
                          key={child.label}
                          icon={
                            child.icon ? (
                              <child.icon className="h-4 w-4" aria-hidden="true" />
                            ) : undefined
                          }
                          variant="sub"
                        >
                          {child.label}
                        </SidebarItem>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <section className="grid gap-6 rounded-[28px] bg-background p-6 shadow-lg ring-1 ring-black/10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Dépenses
              </h1>
              <p className="text-sm text-muted-foreground">
                Résumé client et aperçu instantané de votre activité financière.
              </p>
            </header>

            <Card className="border-none bg-muted/30 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-base font-semibold text-muted-foreground">
                  Graphique des dépenses
                </CardTitle>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-full bg-white text-zinc-900 hover:bg-white/80"
                >
                  <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
                  Exporter
                </Button>
              </CardHeader>
              <CardContent>
                <div
                  aria-hidden="true"
                  className="h-48 rounded-3xl border-2 border-dashed border-muted-foreground/40 bg-gradient-to-br from-muted/30 to-transparent"
                />
              </CardContent>
            </Card>

            <Card className="border-none bg-muted/20 shadow-none">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-muted-foreground">
                  Activité récente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {PLACEHOLDER_ACTIVITIES.map((_, index) => (
                  <div key={`activity-${index}`} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full bg-muted" />
                    <div className="flex flex-1 flex-col gap-2">
                      <Skeleton className="h-3 w-2/3 rounded-full bg-muted" />
                      <Skeleton className="h-3 w-1/3 rounded-full bg-muted/80" />
                    </div>
                    <Skeleton className="h-3 w-12 rounded-full bg-muted" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <aside className="flex flex-col gap-6">
            <Card className="border-none bg-muted/20 shadow-none">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-muted-foreground">
                  Répartition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {DISTRIBUTION_SEGMENTS.map((segment) => (
                  <div key={segment.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium text-foreground">
                      <span>{segment.label}</span>
                      <span className="text-xs text-muted-foreground">0 %</span>
                    </div>
                    <Progress value={0} className="h-2 rounded-full bg-muted" />
                    <p className="text-xs text-muted-foreground">{segment.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none bg-zinc-900 text-zinc-100 shadow-md">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium uppercase tracking-wide text-white/70">
                    Assistance dédiée
                  </p>
                  <h2 className="text-xl font-semibold">Besoin d’aide ?</h2>
                  <p className="text-sm text-white/60">
                    Contactez notre équipe pour obtenir un accompagnement personnalisé.
                  </p>
                </div>
                <Button
                  type="button"
                  className="mt-2 w-full rounded-full bg-white text-zinc-900 hover:bg-white/90"
                >
                  <PhoneCall className="mr-2 h-4 w-4" aria-hidden="true" />
                  Planifier un appel
                </Button>
              </CardContent>
            </Card>
          </aside>
        </section>
      </div>
    </div>
  );
};

interface SidebarItemProps {
  icon?: ReactNode;
  children: ReactNode;
  variant?: "default" | "sub";
  active?: boolean;
}

const SidebarItem: FC<SidebarItemProps> = ({ icon, children, variant = "default", active = false }) => {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
        variant === "sub"
          ? "text-white/60 hover:text-white"
          : active
            ? "bg-white text-zinc-900 shadow-lg"
            : "text-white/75 hover:bg-white/10"
      )}
      aria-current={active ? "page" : undefined}
    >
      {icon && (
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-2xl",
            variant === "sub"
              ? "bg-transparent text-white/50"
              : active
                ? "bg-zinc-900/5 text-zinc-900"
                : "bg-white/10 text-white"
          )}
        >
          {icon}
        </span>
      )}
      <span>{children}</span>
    </button>
  );
};

export default DashboardClient;
