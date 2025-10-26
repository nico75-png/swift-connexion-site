import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays, subMonths, subWeeks } from "date-fns";
import { fr } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PeriodKey = "semaine" | "mois" | "trimestre";

type ActivityPoint = {
  label: string;
  commandes: number;
  livraisons: number;
};

type ClientActivityChartProps = {
  className?: string;
};

const PERIOD_OPTIONS: { key: PeriodKey; label: string; helper: string }[] = [
  { key: "semaine", label: "Semaine", helper: "7 derniers jours" },
  { key: "mois", label: "Mois", helper: "4 dernières semaines" },
  { key: "trimestre", label: "Trimestre", helper: "3 derniers mois" },
];

const generateMockActivity = (period: PeriodKey): ActivityPoint[] => {
  const today = new Date();

  const randomInRange = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1) + min);

  if (period === "semaine") {
    return Array.from({ length: 7 }, (_, index) => {
      const date = subDays(today, 6 - index);
      const commandes = randomInRange(60, 140);
      const livraisons = Math.max(40, Math.min(commandes, randomInRange(45, commandes)));

      return {
        label: format(date, "EEE", { locale: fr }),
        commandes,
        livraisons,
      };
    });
  }

  if (period === "mois") {
    return Array.from({ length: 4 }, (_, index) => {
      const date = subWeeks(today, 3 - index);
      const commandes = randomInRange(220, 420);
      const livraisons = Math.max(180, Math.min(commandes, randomInRange(190, commandes)));

      return {
        label: `Sem. ${format(date, "w", { locale: fr })}`,
        commandes,
        livraisons,
      };
    });
  }

  return Array.from({ length: 3 }, (_, index) => {
    const date = subMonths(today, 2 - index);
    const commandes = randomInRange(800, 1100);
    const livraisons = Math.max(700, Math.min(commandes, randomInRange(720, commandes)));

    return {
      label: format(date, "MMM", { locale: fr }),
      commandes,
      livraisons,
    };
  });
};

const MotionTabsTrigger = motion(TabsTrigger);

const ClientActivityChart = ({ className }: ClientActivityChartProps) => {
  const [activePeriod, setActivePeriod] = useState<PeriodKey>("mois");

  const activityData = useMemo(() => generateMockActivity(activePeriod), [activePeriod]);

  const totals = useMemo(() => {
    return activityData.reduce(
      (acc, point) => {
        acc.commandes += point.commandes;
        acc.livraisons += point.livraisons;
        return acc;
      },
      { commandes: 0, livraisons: 0 }
    );
  }, [activityData]);

  const livraisonsRatio = totals.commandes
    ? Math.round((totals.livraisons / totals.commandes) * 100)
    : 0;

  return (
    <Card className={cn("lg:col-span-2", className)}>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Activité mensuelle
            </CardTitle>
            <p className="mt-1 text-sm text-slate-600">
              Commandes et livraisons sur la période sélectionnée.
            </p>
          </div>

          <Tabs
            value={activePeriod}
            onValueChange={(value) => setActivePeriod(value as PeriodKey)}
            className="w-full max-w-xs self-start lg:self-auto"
          >
            <TabsList className="grid grid-cols-3 rounded-lg bg-slate-100 p-1 shadow-inner transition-all duration-300 ease-out">
              {PERIOD_OPTIONS.map((option) => (
                <MotionTabsTrigger
                  key={option.key}
                  value={option.key}
                  className="text-xs sm:text-sm transition-all duration-300 ease-out data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  {option.label}
                </MotionTabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fondu croisé du graphique à chaque changement de période */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePeriod}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="h-64"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCommandes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="colorLivraisons" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#475569", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#475569", fontSize: 12 }}
                  width={48}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    borderRadius: "0.75rem",
                    borderColor: "#cbd5f5",
                    boxShadow: "0 20px 25px -15px rgba(30, 41, 59, 0.25)",
                  }}
                  formatter={(value: number) => [`${value.toLocaleString("fr-FR")} colis`, ""]}
                  labelFormatter={(label) => `Période : ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="commandes"
                  stroke="#3b82f6"
                  strokeWidth={2.4}
                  fill="url(#colorCommandes)"
                  name="Commandes"
                  activeDot={{ r: 6 }}
                />
                <Area
                  type="monotone"
                  dataKey="livraisons"
                  stroke="#22c55e"
                  strokeWidth={2.4}
                  fill="url(#colorLivraisons)"
                  name="Livraisons"
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>

        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryTile
            title="Commandes"
            value={totals.commandes.toLocaleString("fr-FR")}
            trendLabel="Volume total"
            accent="bg-blue-100 text-blue-700"
          />
          <SummaryTile
            title="Livraisons"
            value={totals.livraisons.toLocaleString("fr-FR")}
            trendLabel="Complétées"
            accent="bg-emerald-100 text-emerald-700"
          />
          <SummaryTile
            title="Taux de réussite"
            value={`${livraisonsRatio}%`}
            trendLabel="Livraisons / commandes"
            accent="bg-slate-100 text-slate-700"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          {PERIOD_OPTIONS.map((option) => (
            <Badge
              key={option.key}
              variant={option.key === activePeriod ? "default" : "outline"}
              className={cn(
                "rounded-full border border-slate-200 bg-slate-100/60 px-3 py-1 text-[11px] font-medium uppercase tracking-wide",
                option.key === activePeriod
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {option.helper}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const SummaryTile = ({
  title,
  value,
  trendLabel,
  accent,
}: {
  title: string;
  value: string;
  trendLabel: string;
  accent: string;
}) => {
  return (
    <motion.div
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_18px_35px_-30px_rgba(30,41,59,0.45)] transition-all duration-300 ease-out hover:shadow-[0_18px_30px_-20px_rgba(30,41,59,0.35)]"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", accent)}>Live</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] text-slate-500">{trendLabel}</p>
    </motion.div>
  );
};

export default ClientActivityChart;
