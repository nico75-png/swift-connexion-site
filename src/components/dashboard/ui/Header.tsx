import { useEffect, useState } from "react";
import { Bell, Moon, Sun, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface HeaderNotification {
  id: string;
  message: string;
  time: string;
  read?: boolean;
}

export interface HeaderProps {
  title: string;
  subtitle?: string;
  userName?: string;
  userEmail?: string;
  notifications?: HeaderNotification[];
  cta?: React.ReactNode;
  actions?: React.ReactNode;
}

const Header = ({
  title,
  subtitle,
  userName,
  userEmail,
  notifications = [],
  cta,
  actions,
}: HeaderProps) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const prefersDark =
      typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const current = document.body.dataset.theme as "light" | "dark" | undefined;
    const resolved = current ?? (prefersDark ? "dark" : "light");
    document.body.dataset.theme = resolved;
    setTheme(resolved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.body.dataset.theme = next;
    setTheme(next);
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <header className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] bg-[color:var(--bg-surface)] px-[var(--space-6)] py-[var(--space-5)] shadow-[var(--elevation-1)]">
      <div className="flex flex-col gap-[var(--space-3)] md:flex-row md:items-center md:justify-between">
        <div className="space-y-[var(--space-1)]">
          <h1 className="text-[24px] font-semibold text-[color:var(--text-primary)]">{title}</h1>
          {subtitle ? <p className="text-sm text-[color:var(--text-secondary)]">{subtitle}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-[var(--space-2)] md:justify-end">
          {actions}
          {cta}
        </div>
      </div>
      <div className="flex flex-col gap-[var(--space-2)] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-[var(--space-3)]">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--border-subtle)] bg-[color:var(--bg-subtle)] text-[color:var(--text-secondary)] transition-colors duration-150 hover:bg-[color:var(--bg-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-accent)]"
            aria-label="Basculer le thème clair ou sombre"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-sm)] text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-subtle)] focus-visible:ring-2 focus-visible:ring-[color:var(--brand-accent)]"
                aria-label="Ouvrir les notifications"
              >
                <Bell className="h-5 w-5" aria-hidden />
                {unreadCount > 0 ? (
                  <Badge className="absolute right-1 top-1 h-5 min-w-[20px] px-1 text-xs">{unreadCount}</Badge>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 space-y-[var(--space-2)] p-[var(--space-3)]">
              <DropdownMenuLabel className="text-sm font-semibold text-[color:var(--text-primary)]">
                Notifications
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <p className="px-[var(--space-2)] py-[var(--space-4)] text-sm text-[color:var(--text-muted)]">
                  Aucune notification pour le moment.
                </p>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-[var(--space-1)] py-[var(--space-2)]">
                    <span className="text-sm text-[color:var(--text-secondary)]">{notification.message}</span>
                    <span className="text-xs text-[color:var(--text-muted)]">{notification.time}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] border border-[color:var(--border-subtle)] bg-[color:var(--bg-subtle)] px-[var(--space-3)] py-[var(--space-2)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--brand-primary)] text-[color:var(--text-inverse)]">
            <User2 className="h-5 w-5" aria-hidden />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-[color:var(--text-primary)]">{userName ?? "Utilisateur"}</span>
            {userEmail ? <span className="text-xs text-[color:var(--text-muted)]">{userEmail}</span> : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
