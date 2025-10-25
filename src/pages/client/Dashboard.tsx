import { useMemo } from "react";
import { Link } from "react-router-dom";
import { format, subDays } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  Activity,
  BellRing,
  CircleAlert,
  CreditCard,
  Package,
  TrendingUp,
  Truck,
  Wallet,
} from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/stores/auth.store";

const createActivityData = () => {
  const reference = [0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2];
  const today = new Date();

  return reference.map((value, index) => {
    const day = subDays(today, reference.length - index - 1);

    return {
      label: format(day, "dd MMM"),
      commandes: value,
      livraisons: Math.max(0, value - (index % 2 === 0 ? 0 : 0.5)),
    };
  });
};

const ClientDashboard = () => {
  const { currentUser, currentClient } = useAuth();
  const displayName = currentUser?.name ?? "Utilisateur";
  const firstName = displayName.split(" ")[0] || displayName;

  const activityData = useMemo(() => createActivityData(), []);

  const stats = useMemo(
    () => [
      {
        label: "Commandes sur 30 jours",
        value: "0",
        icon: Package,
        accent: "text-amber-500",
      },
      {
        label: "Taux de livraison",
        value: "0 %",
        icon: Activity,
        accent: "text-green-500",
      },
      {
        label: "Montant consommé",
        value: "0,00 €",
        icon: Wallet,
        accent: "text-blue-500",
      },
      {
        label: "Délai moyen",
        value: "0 j",
        icon: TrendingUp,
        accent: "text-purple-500",
      },
    ],
    [],
  );

  const quickActions = useMemo(
    () => [
      {
        label: "Suivre une commande",
        description: "Visualisez les étapes en temps réel",
        href: "/suivi",
        icon: Truck,
      },
      {
        label: "Consulter vos factures",
        description: "Retrouvez et téléchargez vos factures",
        href: "/factures",
        icon: CreditCard,
      },
      {
        label: "Messagerie",
        description: "Échangez avec notre équipe support",
        href: "/messages",
        icon: BellRing,
      },
    ],
    [],
  );

  const profileCompletion = useMemo(() => {
    const requiredFields = ["company", "contactName", "siret"] as const;

    if (!currentClient) {
      return { completed: false, missingCount: requiredFields.length };
    }

    const missingCount = requiredFields.reduce((count, field) => {
      return currentClient[field] ? count : count + 1;
    }, 0);

    return {
      completed: missingCount === 0,
      missingCount,
    };
  }, [currentClient]);

  return (
    <DashboardLayout sidebar={<ClientSidebar />}>
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,204,0,0.18),_transparent_55%)]" />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Badge variant="secondary" className="w-fit bg-white/10 text-white backdrop-blur">
                Tableau de bord client
              </Badge>
              <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
                Bienvenue, {firstName}
              </h1>
              <p className="max-w-2xl text-sm text-white/80 md:text-base">
                Centralisez vos commandes, suivez vos livraisons et accédez rapidement à toutes vos informations clés.
              </p>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Alert className="flex-1 border-white/20 bg-white/10 text-white">
                <CircleAlert className="h-4 w-4 text-amber-300" />
                <AlertTitle className="flex items-center gap-2 text-sm font-semibold">
                  {profileCompletion.completed ? "Profil complet" : "Complétez votre profil"}
                  {!profileCompletion.completed && (
                    <Badge className="bg-amber-500 text-slate-900">Prioritaire</Badge>
                  )}
                </AlertTitle>
                <AlertDescription className="text-xs text-white/80 md:text-sm">
                  {!profileCompletion.completed
                    ? `Il vous reste ${profileCompletion.missingCount} champ(s) à renseigner pour sécuriser vos expéditions.`
                    : "Toutes vos informations sont à jour. Merci !"}
                </AlertDescription>
              </Alert>

              <Button
                asChild
                size="lg"
                className="h-12 min-w-[200px] rounded-full bg-amber-400 px-6 text-base font-semibold text-slate-900 shadow-lg shadow-amber-500/30 transition hover:bg-amber-300"
              >
                <Link to="/commandes/nouvelle">Créer une commande</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border border-slate-200/60 bg-white shadow-sm">
              <CardContent className="flex items-center justify-between gap-4 p-6">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                  <stat.icon className={`h-6 w-6 ${stat.accent}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
          <Card className="border border-slate-200/60 bg-white shadow-sm">
            <CardHeader className="flex flex-col gap-2 border-b border-slate-100/80 bg-slate-50/60">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Activité des 30 derniers jours
              </CardTitle>
              <p className="text-sm text-slate-500">
                Données simulées pour visualiser vos futures performances.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData} margin={{ top: 16, right: 16, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "4 4" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 12px 40px rgba(15,23,42,0.08)",
                      }}
                      labelStyle={{ fontWeight: 600, color: "#0f172a" }}
                    />
                    <Area type="monotone" dataKey="commandes" stroke="#f59e0b" strokeWidth={2} fill="url(#colorOrders)" />
                    <Area type="monotone" dataKey="livraisons" stroke="#0f172a" strokeWidth={2} fill="url(#colorDeliveries)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/60 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100/80 bg-slate-50/60">
              <CardTitle className="text-lg font-semibold text-slate-900">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-6">
              {quickActions.map((action) => (
                <div key={action.label} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <Link to={action.href} className="text-sm font-semibold text-slate-900 hover:text-amber-500">
                      {action.label}
                    </Link>
                    <p className="text-xs text-slate-500 md:text-sm">{action.description}</p>
                  </div>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-700">
                Anticipez vos besoins logistiques en programmant vos futures expéditions dès aujourd'hui.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
