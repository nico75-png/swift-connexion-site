import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  MessageSquare,
  Radar,
  Sun,
  Moon,
  LogOut,
  X,
} from "lucide-react";
import clsx from "clsx";

import { Switch } from "@/components/ui/switch";

interface SidebarProps {
  userEmail: string;
  isDarkMode: boolean;
  onToggleDarkMode: (value: boolean) => void;
  onLogout?: () => void;
  onClose?: () => void;
  variant?: "desktop" | "mobile";
}

export const navigationItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "#dashboard" },
  { label: "Mes commandes", icon: ShoppingBag, href: "#orders" },
  { label: "Suivi en temps réel", icon: Radar, href: "#tracking" },
  { label: "Mes factures", icon: FileText, href: "#invoices" },
  { label: "Messages", icon: MessageSquare, href: "#messages" },
];

const Sidebar = ({
  userEmail,
  isDarkMode,
  onToggleDarkMode,
  onLogout,
  onClose,
  variant = "desktop",
}: SidebarProps) => {
  return (
    <aside
      style={{ width: "6cm", minWidth: "170px", maxWidth: "180px" }}
      className={clsx(
        "relative flex h-full min-h-screen flex-col border-r border-slate-200 bg-white/95 backdrop-blur",
        variant === "desktop" && "sticky top-0 hidden lg:flex",
        variant === "mobile" && "flex lg:hidden",
      )}
    >
      <div className="flex items-center justify-between px-6 pt-6 lg:hidden">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Menu</p>
          <p className="text-sm font-semibold text-slate-900">Navigation</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100"
          aria-label="Fermer le menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-6 px-6 py-8 lg:py-10">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Bonjour,</p>
          <p className="text-sm font-semibold text-slate-900">{userEmail}</p>
          <p className="text-xs text-slate-500">Prêt·e à piloter vos opérations</p>
        </div>

        <nav className="space-y-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === 0;

            return (
              <Link
                key={item.label}
                to={item.href}
                className={clsx(
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <Icon
                  className={clsx(
                    "h-5 w-5 transition",
                    isActive ? "text-amber-300" : "text-slate-400 group-hover:text-amber-500",
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="h-4 w-4 text-slate-900" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-500" />
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Mode {isDarkMode ? "sombre" : "clair"}
                  </p>
                  <p className="text-xs text-slate-500">Ajustez selon votre confort visuel</p>
                </div>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={onToggleDarkMode} aria-label="Basculer le mode" />
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/40 transition hover:from-amber-300 hover:to-orange-300"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
