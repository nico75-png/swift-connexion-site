import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

/**
 * Carte de statistique réutilisable pour les dashboards
 */
const StatsCard = ({ label, value, icon: Icon, color = "text-[#0B2D55]", trend }: StatsCardProps) => {
  return (
    <Card className="border border-[rgba(0,0,0,0.08)] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-sm text-[#4A4A4A]">{label}</p>
            <p className="text-3xl font-bold text-[#0B0B0B]">{value}</p>
            {trend && (
              <p className={`mt-2 text-xs ${trend.isPositive ? "text-[#00B884]" : "text-[#E84C4C]"}`}>
                {trend.isPositive ? "+" : ""}{trend.value}% vs mois dernier
              </p>
            )}
          </div>
          <Icon className={`h-10 w-10 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
