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
const StatsCard = ({ label, value, icon: Icon, color = "text-primary", trend }: StatsCardProps) => {
  return (
    <Card className="border-none shadow-soft">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <p className={`text-xs mt-2 ${trend.isPositive ? "text-success" : "text-destructive"}`}>
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
