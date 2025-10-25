import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
}: EmptyStateProps) => {
  const ActionTag = actionHref ? "a" : "button";
  const actionProps = actionHref ? { href: actionHref } : { type: "button" as const };

  return (
    <div
      role="status"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-dashed border-[color:var(--border-strong)] bg-[color:var(--bg-subtle)] px-[var(--space-7)] py-[var(--space-8)] text-center",
        className,
      )}
      aria-live="polite"
    >
      {icon ? <div className="text-[color:var(--brand-primary)]" aria-hidden>{icon}</div> : null}
      <div className="max-w-xl space-y-[var(--space-2)]">
        <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">{title}</h3>
        <p className="text-sm text-[color:var(--text-secondary)]">{description}</p>
      </div>
      {actionLabel ? (
        <ActionTag
          {...actionProps}
          onClick={onAction}
          className="inline-flex min-h-[44px] items-center justify-center gap-[var(--space-2)] rounded-[var(--radius-sm)] border border-[color:var(--brand-primary)] px-[var(--space-4)] py-[var(--space-2)] text-sm font-medium text-[color:var(--brand-primary)] transition-colors duration-200 hover:bg-[color:rgba(11,45,99,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-accent)]"
        >
          {actionLabel}
        </ActionTag>
      ) : null}
    </div>
  );
};

export default EmptyState;
