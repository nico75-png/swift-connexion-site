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
    <Card className="minw0 border border-border bg-card shadow-soft" data-testid="stats-card">
      <CardContent className="flex min-h-[160px] flex-col justify-between gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="minw0 space-y-2">
            <p className="wrap-any text-sm text-muted-foreground">{label}</p>
            <p className="wrap-any text-3xl font-bold leading-tight text-foreground">{value}</p>
            {trend && (
              <p className={`wrap-any text-xs ${trend.isPositive ? "text-success" : "text-destructive"}`}>
                {trend.isPositive ? "+" : ""}
                {trend.value}% vs mois dernier
              </p>
            )}
          </div>
          <Icon className={`h-10 w-10 shrink-0 ${color}`} aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
