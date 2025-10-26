"use client";

import { FC, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  MapPin,
  Receipt,
  MessageSquare,
  Settings,
  HelpCircle,
  User,
  Search,
  Bell,
  Menu,
  X,
  Package,
  Truck,
  Clock,
  DollarSign,
  Phone,
  Mail,
  Download,
  CreditCard,
  Plus,
  Eye,
  RefreshCw,
  ChevronRight,
  ArrowDown,
  ArrowUp,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";

type Section =
  | "dashboard"
  | "commandes"
  | "suivi"
  | "factures"
  | "messages"
  | "parametres"
  | "aide";

type DashboardSectionProps = {
  setActiveSection: (section: Section) => void;
};

type MonthlyStats = {
  total: number;
  delivered: number;
  pending: number;
  totalAmount: number;
  avgDelay: number;
};

type ActivityPoint = {
  day: string;
  orders: number;
};

const generateActivityData = (): ActivityPoint[] => {
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  return days.map((day) => ({
    day,
    orders: Math.floor(Math.random() * 31) + 10,
  }));
};

const generateMonthlyStats = (): MonthlyStats => {
  const total = Math.floor(Math.random() * 60) + 90;
  const delivered = Math.floor(total * (0.75 + Math.random() * 0.15));
  const pending = Math.max(total - delivered, 0);
  const totalAmount = parseFloat((delivered * (45 + Math.random() * 65)).toFixed(2));
  const avgDelay = parseFloat((25 + Math.random() * 15).toFixed(1));

  return {
    total,
    delivered,
    pending,
    totalAmount,
    avgDelay,
  };
};

const generateSparklineData = () =>
  Array.from({ length: 8 }, () => Math.floor(Math.random() * 70) + 30);

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const NAVIGATION_ITEMS = [
  { label: "Tableau de bord", icon: LayoutDashboard, value: "dashboard" as Section },
  { label: "Commandes", icon: ShoppingBag, value: "commandes" as Section },
  { label: "Suivi", icon: MapPin, value: "suivi" as Section },
  { label: "Factures", icon: Receipt, value: "factures" as Section },
  { label: "Messages", icon: MessageSquare, value: "messages" as Section },
  { label: "Paramètres", icon: Settings, value: "parametres" as Section },
  { label: "Aide", icon: HelpCircle, value: "aide" as Section },
];

const DashboardClient = () => {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-50">
      {/* Sidebar sombre */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-neutral-900 transition-transform duration-300 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo & Close button */}
          <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
            <h1 className="text-xl font-bold text-gray-100">Swift Connexion</h1>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-100 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Profil client */}
          <div className="border-b border-neutral-800 px-6 py-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-neutral-700">
                <AvatarImage src="" alt="Client" />
                <AvatarFallback className="bg-neutral-700 text-gray-100">CL</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-100">Client Swift</p>
                <p className="text-xs text-gray-400">client@swift.com</p>
                <Badge className="mt-1 bg-green-600 text-xs text-white hover:bg-green-700">
                  Connecté
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {NAVIGATION_ITEMS.map(({ label, icon: Icon, value }) => {
                const isActive = activeSection === value;
                return (
                  <button
                    key={value}
                    onClick={() => {
                      setActiveSection(value);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-300 hover:bg-neutral-800 hover:text-gray-100"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer sidebar */}
          <div className="border-t border-neutral-800 px-6 py-4">
            <p className="text-xs text-gray-500">© 2025 Swift Connexion</p>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 border-b border-neutral-200 bg-white px-4 py-3 shadow-sm lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex flex-1 items-center justify-end gap-3">
            <Button variant="ghost" size="icon" className="relative text-neutral-700">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </Button>

            <Avatar className="h-9 w-9 border border-neutral-300">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-neutral-200 text-neutral-700">CL</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content area */}
        <main
          className={cn(
            "flex-1 bg-neutral-50 px-4 py-4 sm:px-6 lg:px-8 lg:py-6",
            activeSection === "dashboard" ? "overflow-hidden" : "overflow-y-auto"
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeSection === "dashboard" && (
                <DashboardSection setActiveSection={setActiveSection} />
              )}
              {activeSection === "commandes" && <CommandesSection />}
              {activeSection === "suivi" && <SuiviSection />}
              {activeSection === "factures" && <FacturesSection />}
              {activeSection === "messages" && <MessagesSection />}
              {activeSection === "parametres" && <ParametresSection />}
              {activeSection === "aide" && <AideSection />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

// 🟣 Tableau de bord Section
const DashboardSection: FC<DashboardSectionProps> = ({ setActiveSection }) => {
  const [loading, setLoading] = useState(true);
  const [ordersTarget] = useState(() => Math.floor(Math.random() * 40) + 85);
  const [ordersTrend] = useState(() => parseFloat((5 + Math.random() * 10).toFixed(1)));
  const [ordersCount, setOrdersCount] = useState(0);
  const [deliveryRate] = useState(() => Math.floor(Math.random() * 21) + 78);
  const [deliveryTrend] = useState(() => parseFloat((Math.random() * 6 - 2).toFixed(1)));
  const [amountConsumed] = useState(() => 2200 + Math.random() * 2200);
  const [sparkline] = useState<number[]>(() => generateSparklineData());
  const [averageDelay] = useState(() => parseFloat((28 + Math.random() * 14).toFixed(1)));
  const [delayVariation] = useState(() => parseFloat((Math.random() * 8 - 4).toFixed(1)));
  const [activityData, setActivityData] = useState<ActivityPoint[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    total: 0,
    delivered: 0,
    pending: 0,
    totalAmount: 0,
    avgDelay: 0,
  });

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    setActivityData(generateActivityData());
  }, []);

  useEffect(() => {
    setMonthlyStats(generateMonthlyStats());
  }, []);

  useEffect(() => {
    if (loading) {
      setOrdersCount(0);
      return;
    }

    let frame = 0;
    const frames = 24;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const animate = () => {
      frame += 1;
      const progress =
        frame >= frames ? ordersTarget : Math.round((ordersTarget / frames) * frame);
      setOrdersCount(progress);

      if (frame < frames) {
        timeoutId = setTimeout(animate, 40);
      }
    };

    timeoutId = setTimeout(animate, 80);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loading, ordersTarget]);

  if (loading) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  return (
    <main className="flex flex-col gap-6 w-full h-full overflow-hidden">
      <ProfileAlert onCompleteProfile={() => setActiveSection("parametres")} />

      <DashboardStats
        orders={{ value: ordersCount, trend: ordersTrend, target: ordersTarget }}
        delivery={{ value: deliveryRate, trend: deliveryTrend }}
        amount={{ value: amountConsumed, sparkline }}
        delay={{ value: averageDelay, variation: delayVariation }}
      />

      <ActivityChart activityData={activityData} monthlyStats={monthlyStats} />

      <QuickActions onNavigate={setActiveSection} className="w-full" />
    </main>
  );
};

type DashboardStatsProps = {
  orders: { value: number; trend: number; target: number };
  delivery: { value: number; trend: number };
  amount: { value: number; sparkline: number[] };
  delay: { value: number; variation: number };
};

const DashboardStats: FC<DashboardStatsProps> = ({ orders, delivery, amount, delay }) => {
  const DelayIcon = delay.variation <= 0 ? ArrowDown : ArrowUp;
  const delayColor = delay.variation <= 0 ? "text-green-600" : "text-red-600";
  const delayLabel = `${delay.variation > 0 ? "+" : ""}${delay.variation.toFixed(1)} min`;
  const deliveryTrendLabel = `${delivery.trend >= 0 ? "+" : ""}${delivery.trend.toFixed(1)}%`;
  const deliveryTrendColor = delivery.trend >= 0 ? "text-green-600" : "text-red-600";
  const deliveryColorClass =
    delivery.value >= 95
      ? "[&>div]:bg-green-500"
      : delivery.value >= 80
      ? "[&>div]:bg-amber-500"
      : "[&>div]:bg-red-500";

  const sparklineMax = Math.max(...amount.sparkline);
  const sparklineMin = Math.min(...amount.sparkline);
  const points = amount.sparkline
    .map((point, index) => {
      const x = (index / Math.max(amount.sparkline.length - 1, 1)) * 100;
      const normalized =
        sparklineMax === sparklineMin
          ? 50
          : ((point - sparklineMin) / (sparklineMax - sparklineMin)) * 100;
      const y = 100 - normalized;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="border-neutral-200 bg-white">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div>
            <CardTitle className="text-sm font-medium text-neutral-600">Commandes</CardTitle>
            <CardDescription className="text-xs text-neutral-500">
              Objectif : {orders.target.toLocaleString("fr-FR")}
            </CardDescription>
          </div>
          <span className="rounded-full bg-blue-100 p-2 text-blue-600">
            <Package className="h-5 w-5" />
          </span>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-semibold text-neutral-900">
            {orders.value.toLocaleString("fr-FR")}
          </div>
          <p className="text-xs font-medium text-blue-600">+{orders.trend.toFixed(1)}% ce mois</p>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 bg-white">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div>
            <CardTitle className="text-sm font-medium text-neutral-600">Taux de livraison</CardTitle>
            <CardDescription className="text-xs text-neutral-500">
              Performances en temps réel
            </CardDescription>
          </div>
          <span className="rounded-full bg-green-100 p-2 text-green-600">
            <Truck className="h-5 w-5" />
          </span>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-neutral-900">{delivery.value}%</span>
            <span className={cn("text-xs font-semibold", deliveryTrendColor)}>
              {deliveryTrendLabel}
            </span>
          </div>
          <Progress
            value={delivery.value}
            className={cn("h-2 bg-neutral-200", deliveryColorClass)}
            max={100}
          />
        </CardContent>
      </Card>

      <Card className="border-neutral-200 bg-white">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div>
            <CardTitle className="text-sm font-medium text-neutral-600">Montant consommé</CardTitle>
            <CardDescription className="text-xs text-neutral-500">
              Total mensuel simulé
            </CardDescription>
          </div>
          <span className="rounded-full bg-amber-100 p-2 text-amber-600">
            <DollarSign className="h-5 w-5" />
          </span>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-semibold text-neutral-900">
            {currencyFormatter.format(Math.round(amount.value))}
          </div>
          <svg viewBox="0 0 100 40" className="h-12 w-full text-blue-500" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              points={points}
            />
          </svg>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 bg-white">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div>
            <CardTitle className="text-sm font-medium text-neutral-600">Délai moyen</CardTitle>
            <CardDescription className="text-xs text-neutral-500">
              Temps estimé de livraison
            </CardDescription>
          </div>
          <span className="rounded-full bg-purple-100 p-2 text-purple-600">
            <Clock className="h-5 w-5" />
          </span>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-semibold text-neutral-900">{delay.value.toFixed(1)} min</div>
          <div className="flex items-center gap-1 text-xs font-semibold">
            <DelayIcon className={cn("h-4 w-4", delayColor)} />
            <span className={delayColor}>{delayLabel}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

type ActivityChartProps = {
  activityData: ActivityPoint[];
  monthlyStats: MonthlyStats;
};

const ActivityChart: FC<ActivityChartProps> = ({ activityData, monthlyStats }) => {
  const successRate = monthlyStats.total
    ? Math.round((monthlyStats.delivered / monthlyStats.total) * 100)
    : 0;
  const barData = [
    { name: "Livrées", value: monthlyStats.delivered, fill: "#16a34a" },
    { name: "En attente", value: monthlyStats.pending, fill: "#f97316" },
  ];

  return (
    <Card className="flex h-full flex-col border-neutral-200 bg-white">
      <CardHeader className="flex flex-col gap-2 pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-neutral-800">Activité mensuelle</CardTitle>
          <CardDescription className="text-xs text-neutral-500">
            Vue d'ensemble des commandes du mois
          </CardDescription>
        </div>
        <Badge className="w-fit rounded-full bg-blue-100 px-3 py-1 text-[11px] font-medium text-blue-600">
          Actualisé en temps réel
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 pt-0">
        <div className="grid flex-1 gap-4 lg:grid-cols-[2fr,1fr]">
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  Commandes totales ce mois
                </p>
                <p className="text-2xl font-semibold text-neutral-900">
                  {monthlyStats.total.toLocaleString("fr-FR")}
                </p>
              </div>
              <div className="text-sm text-neutral-600">
                <span className="font-semibold text-blue-600">{successRate}%</span> de réussite
              </div>
            </div>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={activityData}
                  margin={{ top: 10, left: -10, right: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#9ca3af" tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e5e7eb" }} />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex h-full flex-col justify-between gap-3 rounded-2xl bg-neutral-50 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">Montant total</p>
              <p className="text-lg font-semibold text-neutral-900">
                {currencyFormatter.format(Math.round(monthlyStats.totalAmount))}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">Délai moyen</p>
              <p className="text-lg font-semibold text-neutral-900">
                {monthlyStats.avgDelay.toFixed(1)} min
              </p>
            </div>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e5e7eb" }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {barData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

type QuickActionsProps = {
  onNavigate: (section: Section) => void;
  className?: string;
};

const QuickActions: FC<QuickActionsProps> = ({ onNavigate, className }) => {
  const actions: {
    label: string;
    icon: LucideIcon;
    section: Section;
    className: string;
  }[] = [
    {
      label: "Suivi en direct",
      icon: MapPin,
      section: "suivi",
      className: "bg-blue-600 hover:bg-blue-700",
    },
    {
      label: "Mes factures",
      icon: Receipt,
      section: "factures",
      className: "bg-green-600 hover:bg-green-700",
    },
    {
      label: "Messagerie",
      icon: MessageSquare,
      section: "messages",
      className: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  return (
    <Card className={cn("border-neutral-200 bg-white", className)}>
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-lg font-semibold text-neutral-800">Actions rapides</CardTitle>
        <CardDescription className="text-xs text-neutral-500">
          Accédez immédiatement aux sections clés
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-between">
          {actions.map(({ label, icon: Icon, section, className: actionClassName }) => (
            <Button
              key={section}
              className={cn(
                "h-auto min-w-[140px] flex-1 flex-col gap-2 rounded-2xl py-4 text-sm font-semibold text-white transition-transform duration-150 hover:scale-105",
                actionClassName
              )}
              onClick={() => onNavigate(section)}
            >
              <Icon className="h-6 w-6" />
              <span>{label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

type ProfileAlertProps = {
  onCompleteProfile: () => void;
  className?: string;
};

const ProfileAlert: FC<ProfileAlertProps> = ({ onCompleteProfile, className }) => {
  const completion = 60;

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5",
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex-1">
        <h3 className="text-base font-semibold text-amber-800">Profil incomplet</h3>
        <p className="mt-1 text-sm text-amber-700">
          Complétez votre adresse et vos préférences pour accéder au suivi en temps réel.
        </p>
        <Progress value={completion} className="mt-3 h-2 bg-amber-100 [&>div]:bg-amber-500" />
      </div>
      <Button
        onClick={onCompleteProfile}
        className="w-full rounded-full bg-amber-600 px-6 py-2 text-sm font-semibold text-white hover:bg-amber-700 sm:w-auto"
      >
        Compléter maintenant
      </Button>
    </div>
  );
};

// 🔵 Commandes Section
const CommandesSection = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">Commandes</h1>
        <p className="mt-1 text-sm text-neutral-600">Gérez vos livraisons</p>
      </div>
      <Button className="rounded-2xl bg-blue-600 hover:bg-blue-700">
        <Plus className="mr-2 h-4 w-4" />
        Créer une commande
      </Button>
    </div>

    {/* Filtres */}
    <Card className="border-neutral-200 bg-white">
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center gap-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="rounded-2xl bg-neutral-100">
              <TabsTrigger value="all" className="rounded-xl">Toutes</TabsTrigger>
              <TabsTrigger value="progress" className="rounded-xl">En cours</TabsTrigger>
              <TabsTrigger value="delivered" className="rounded-xl">Livrées</TabsTrigger>
              <TabsTrigger value="pending" className="rounded-xl">En attente</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Rechercher par numéro, trajet..."
              className="rounded-2xl border-neutral-300 pl-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Tableau de commandes */}
    <Card className="border-neutral-200 bg-white">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-200">
              <TableHead>N°</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Trajet</TableHead>
              <TableHead>Chauffeur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i} className="border-neutral-200">
                <TableCell className="font-medium">#CMD{1000 + i}</TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-full">Express</Badge>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Badge className="rounded-full bg-green-100 text-green-700">En cours</Badge>
                </TableCell>
                <TableCell className="font-semibold">
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 rounded-xl">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 rounded-xl">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

// 🟢 Suivi Section
const SuiviSection = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-neutral-800">Suivi en temps réel</h1>
      <p className="mt-1 text-sm text-neutral-600">Suivez vos livraisons en direct</p>
    </div>

    {/* Carte GPS */}
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-800">Position actuelle</CardTitle>
        <CardDescription>Localisation GPS du chauffeur</CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </CardContent>
    </Card>

    {/* Timeline */}
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-800">Chronologie de livraison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <ChevronRight className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="mt-2 h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// 🟠 Factures Section
const FacturesSection = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-neutral-800">Factures</h1>
      <p className="mt-1 text-sm text-neutral-600">Consultez et téléchargez vos factures</p>
    </div>

    <Card className="border-neutral-200 bg-white">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-200">
              <TableHead>N° Facture</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i} className="border-neutral-200">
                <TableCell className="font-medium">#FAC{2000 + i}</TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="font-semibold">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Badge className="rounded-full bg-green-100 text-green-700">Payée</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="rounded-xl">
                      <Download className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-xl">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payer
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Alert className="border-blue-300 bg-blue-50">
      <AlertDescription className="text-blue-800">
        Aucune facture en attente de paiement.
      </AlertDescription>
    </Alert>
  </div>
);

// 🔴 Messages Section
const MessagesSection = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-neutral-800">Messages</h1>
      <p className="mt-1 text-sm text-neutral-600">Communiquez avec nos équipes</p>
    </div>

    <div className="grid gap-6 lg:grid-cols-3">
      {/* Liste conversations */}
      <Card className="border-neutral-200 bg-white lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-neutral-800">Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3 hover:bg-neutral-50"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-neutral-200">S{i}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-1 h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Zone de chat */}
      <Card className="border-neutral-200 bg-white lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-neutral-800">Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-start">
              <div className="max-w-xs rounded-2xl bg-neutral-200 px-4 py-3">
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-xs rounded-2xl bg-blue-600 px-4 py-3">
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-xs rounded-2xl bg-neutral-200 px-4 py-3">
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Input
              placeholder="Écrire un message..."
              className="rounded-2xl border-neutral-300"
              disabled
            />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// ⚙️ Paramètres Section
const ParametresSection = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-neutral-800">Paramètres</h1>
      <p className="mt-1 text-sm text-neutral-600">Gérez votre compte et vos préférences</p>
    </div>

    {/* Profil */}
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-800">Informations personnelles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input id="name" placeholder="Jean Dupont" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="jean@example.com" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" placeholder="+33 6 12 34 56 78" className="rounded-xl" />
          </div>
        </div>
        <Button className="rounded-2xl bg-blue-600 hover:bg-blue-700">
          Modifier le profil
        </Button>
      </CardContent>
    </Card>

    {/* Préférences */}
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-800">Préférences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-neutral-800">Notifications email</p>
            <p className="text-sm text-neutral-500">Recevoir les mises à jour par email</p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-neutral-800">Notifications SMS</p>
            <p className="text-sm text-neutral-500">Recevoir les alertes par SMS</p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-neutral-800">Mode sombre</p>
            <p className="text-sm text-neutral-500">Activer le thème sombre</p>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  </div>
);

// 🧰 Aide Section
const AideSection = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-neutral-800">Aide & Support</h1>
      <p className="mt-1 text-sm text-neutral-600">Besoin d'assistance ? Nous sommes là pour vous aider</p>
    </div>

    {/* Contact support */}
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-800">Contacter le support</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <Button className="h-auto flex-col gap-3 rounded-2xl bg-blue-600 py-8 hover:bg-blue-700">
            <Phone className="h-8 w-8" />
            <div>
              <p className="font-semibold">Par téléphone</p>
              <p className="text-sm">01 23 45 67 89</p>
            </div>
          </Button>
          <Button className="h-auto flex-col gap-3 rounded-2xl bg-green-600 py-8 hover:bg-green-700">
            <Mail className="h-8 w-8" />
            <div>
              <p className="font-semibold">Par email</p>
              <p className="text-sm">support@swift.com</p>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* FAQ */}
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-800">Questions fréquentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-neutral-200 p-4">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default DashboardClient;
