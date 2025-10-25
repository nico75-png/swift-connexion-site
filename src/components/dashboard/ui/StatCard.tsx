import type { ComponentType, ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardTrend {
  label?: string;
  value: number | string;
  isPositive?: boolean;
}

export interface StatCardProps {
  title: string;
  value: ReactNode;
  description?: string;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  trend?: StatCardTrend;
  isLoading?: boolean;
  className?: string;
}

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  isLoading = false,
  className,
}: StatCardProps) => {
  const TrendIcon = trend?.isPositive ? ArrowUpRight : ArrowDownRight;
  const showTrend = trend && trend.value !== undefined && trend.value !== null;

  return (
    <section
      className={cn(
        "group flex h-full flex-col justify-between gap-[var(--space-3)] rounded-[var(--radius-md)] bg-[color:var(--bg-surface)] p-[var(--space-6)] shadow-[var(--elevation-1)] transition-shadow duration-200 hover:shadow-[var(--elevation-2)] focus-within:shadow-[var(--elevation-2)]",
        className,
      )}
      tabIndex={-1}
      aria-live="polite"
      role="status"
    >
      <div className="flex items-start justify-between gap-[var(--space-3)]">
        <div className="flex flex-col gap-[var(--space-1)]">
          <p className="text-[13px] font-medium uppercase tracking-wide text-[color:var(--text-muted)]">
            {title}
          </p>
          <div className="flex items-baseline gap-[var(--space-2)]">
            <span className="text-[28px] font-semibold leading-tight text-[color:var(--text-primary)]">
              {isLoading ? (
                <span className="inline-flex h-8 w-24 animate-pulse rounded-[var(--radius-sm)] bg-[color:var(--bg-subtle)]" />
              ) : (
                value
              )}
            </span>
            {showTrend && typeof trend?.value === "string" && (
              <span className="text-sm font-medium text-[color:var(--text-secondary)]">{trend.value}</span>
            )}
          </div>
        </div>
        {Icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[color:var(--bg-subtle)] text-[color:var(--brand-primary)]">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        ) : null}
      </div>

      <div className="flex items-end justify-between gap-[var(--space-2)]">
        {description ? (
          <p className="text-sm text-[color:var(--text-secondary)]">{description}</p>
        ) : (
          <span className="sr-only">Valeur actuelle : {value}</span>
        )}
        {showTrend && typeof trend?.value === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-[var(--space-1)] rounded-[var(--radius-pill)] px-[var(--space-2)] py-[var(--space-1)] text-xs font-semibold",
              trend.isPositive
                ? "bg-[color:rgba(15,157,88,0.12)] text-[color:var(--brand-success)]"
                : "bg-[color:rgba(220,38,38,0.12)] text-[color:#dc2626]",
            )}
            aria-live="polite"
          >
            <TrendIcon className="h-4 w-4" aria-hidden />
            <span>{trend.value}%</span>
            {trend.label ? <span className="font-normal text-[color:var(--text-muted)]">{trend.label}</span> : null}
          </span>
        )}
      </div>
    </section>
  );
};

export default StatCard;
