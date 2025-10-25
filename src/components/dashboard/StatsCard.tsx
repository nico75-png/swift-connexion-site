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
    <Card className="border border-border bg-card shadow-soft">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <p className={`mt-2 text-xs ${trend.isPositive ? "text-success" : "text-destructive"}`}>
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
