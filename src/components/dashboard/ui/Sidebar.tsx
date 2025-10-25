import { type ReactNode, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: string;
  end?: boolean;
  ariaLabel?: string;
}

export interface SidebarProps {
  title: string;
  subtitle?: string;
  items: SidebarItem[];
  secondaryItems?: SidebarItem[];
  footer?: ReactNode;
  collapsed?: boolean;
  onToggleCollapse?: (next: boolean) => void;
  onNavigate?: () => void;
}

const Sidebar = ({
  title,
  subtitle,
  items,
  secondaryItems = [],
  footer,
  collapsed = false,
  onToggleCollapse,
  onNavigate,
}: SidebarProps) => {
  const isCollapsible = Boolean(onToggleCollapse);
  const collapseLabel = collapsed ? "Développer la navigation" : "Réduire la navigation";

  const renderItems = useMemo(
    () =>
      [
        { id: "primary", label: "Navigation principale", entries: items },
        { id: "secondary", label: "Raccourcis", entries: secondaryItems },
      ].filter((section) => section.entries.length > 0),
    [items, secondaryItems],
  );

  return (
    <div
      data-collapsed={collapsed || undefined}
      className={cn(
        "relative flex h-full w-full max-w-[var(--sidebar-w)] flex-col gap-[var(--space-4)] border-r border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] px-[var(--space-4)] py-[var(--space-6)] transition-[max-width] duration-200",
        collapsed && "max-w-[96px] px-[var(--space-3)]",
      )}
    >
      <header className="flex items-center justify-between gap-[var(--space-2)]">
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-semibold text-[color:var(--brand-primary)]">{title}</span>
          {subtitle ? (
            <span className="text-xs text-[color:var(--text-muted)]" aria-hidden={collapsed}>
              {subtitle}
            </span>
          ) : null}
        </div>
        {isCollapsible ? (
          <button
            type="button"
            onClick={() => onToggleCollapse?.(!collapsed)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--border-subtle)] bg-[color:var(--bg-subtle)] text-[color:var(--text-secondary)] transition-colors duration-150 hover:bg-[color:var(--bg-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-accent)]"
            aria-label={collapseLabel}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" aria-hidden /> : <ChevronLeft className="h-4 w-4" aria-hidden />}
          </button>
        ) : null}
      </header>

      <nav className="flex flex-1 flex-col gap-[var(--space-6)]" aria-label="Navigation du tableau de bord">
        {renderItems.map((section) => (
          <div key={section.id} className="flex flex-col gap-[var(--space-2)]">
            {section.entries.length > 0 ? (
              <p
                className={cn(
                  "px-[var(--space-2)] text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]",
                  collapsed && "sr-only",
                )}
              >
                {section.label}
              </p>
            ) : null}
            <ul className="flex flex-col gap-[var(--space-1)]">
              {section.entries.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "group flex w-full items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-3)] py-[var(--space-2)] text-sm font-medium text-[color:var(--text-secondary)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-accent)]",
                        isActive
                          ? "bg-[color:rgba(11,45,99,0.12)] text-[color:var(--brand-primary)] shadow-[var(--elevation-1)]"
                          : "hover:bg-[color:var(--bg-subtle)]",
                        collapsed && "justify-center px-[var(--space-2)]",
                      )
                    }
                    onClick={() => onNavigate?.()}
                    aria-label={collapsed ? item.ariaLabel ?? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden />
                    <span className={cn("truncate", collapsed && "sr-only")}>{item.label}</span>
                    {item.badge ? (
                      <span className={cn(
                        "ml-auto inline-flex min-w-[2rem] items-center justify-center rounded-[var(--radius-pill)] bg-[color:rgba(37,99,235,0.12)] px-[var(--space-2)] py-[2px] text-xs font-semibold text-[color:var(--brand-primary)]",
                        collapsed && "sr-only",
                      )}>
                        {item.badge}
                      </span>
                    ) : null}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {footer ? (
        <footer className={cn("mt-auto pt-[var(--space-4)]", collapsed && "flex items-center justify-center")}>{footer}</footer>
      ) : null}
    </div>
  );
};

export default Sidebar;
