import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FileText,
  TrendingUp,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  LifeBuoy,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthProfile } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Sidebar pour l'espace client
 * Navigation principale avec icônes et labels
 */
const ClientSidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { resolvedDisplayName, fallbackEmail } = useAuthProfile();
  const sidebarName = resolvedDisplayName ?? fallbackEmail ?? "Profil client";

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erreur lors de la déconnexion", error);
      return;
    }

    closeMobileSidebar();
    navigate("/connexion");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Tableau de bord", path: "/espace-client" },
    { icon: Package, label: "Mes commandes", path: "/espace-client/commandes" },
    { icon: FileText, label: "Factures", path: "/espace-client/factures" },
    { icon: TrendingUp, label: "Dépenses", path: "/espace-client/depenses" },
    { icon: MessageSquare, label: "Messages", path: "/espace-client/messages" },
    { icon: User, label: "Profil", path: "/espace-client/profil" }
  ];

  const projectItems = [
    { name: "Campagne Q4", color: "bg-success" },
    { name: "Refonte Site", color: "bg-secondary" },
    { name: "Activation CRM", color: "bg-info" }
  ];

  const footerItems = [
    { icon: Settings, label: "Paramètres", path: "/espace-client/preferences" },
    { icon: FileText, label: "Reçus", path: "/espace-client/factures", badge: "8" },
    { icon: LifeBuoy, label: "Aide & support", path: "/contact" }
  ];

  return (
    <>
      {!isMobileOpen && (
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="fixed left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors duration-200 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-ring md:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      <TooltipProvider delayDuration={0}>
        <aside
          data-collapsed={isCollapsed}
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] shadow-large transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 md:overflow-y-auto md:bg-[hsl(var(--sidebar-primary))]",
            isCollapsed ? "md:w-[72px]" : "md:w-[260px]",
            isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <div className="flex h-20 items-center justify-between border-b border-[hsl(var(--sidebar-border))] px-6">
            <div className={cn("min-w-0", isCollapsed && "md:hidden")}>
              <h1 className="font-sans text-lg font-semibold text-[hsl(var(--sidebar-primary-foreground))]">One Connexion</h1>
              <p className="mt-1 text-xs text-[hsl(var(--sidebar-primary-foreground))]/70">Espace Client</p>
              <div className="mt-3 space-y-0.5">
                <p className="truncate text-sm font-medium text-[hsl(var(--sidebar-primary-foreground))]">{sidebarName}</p>
                {fallbackEmail && (
                  <p className="truncate text-xs text-[hsl(var(--sidebar-primary-foreground))]/70">{fallbackEmail}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
              onClick={toggleCollapse}
              className="hidden h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))] transition-colors duration-200 hover:bg-[hsl(var(--sidebar-accent))]/80 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-ring))] md:flex"
              aria-label={isCollapsed ? "Étendre la barre latérale" : "Réduire la barre latérale"}
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={closeMobileSidebar}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary-foreground))] transition-colors duration-200 hover:bg-[hsl(var(--sidebar-accent))]/80 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-ring))] md:hidden"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-6">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const link = (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/espace-client"}
                    aria-label={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--sidebar-ring))]",
                        isActive
                          ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                          : "text-[hsl(var(--sidebar-foreground))]/70 hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-primary-foreground))]",
                        isCollapsed && "md:justify-center md:px-0"
                      )
                    }
                    onClick={closeMobileSidebar}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span
                      className={cn(
                        "truncate transition-opacity duration-200",
                        isCollapsed && "md:hidden"
                      )}
                    >
                      {item.label}
                    </span>
                  </NavLink>
                );

                if (!isCollapsed) {
                  return <li key={item.path}>{link}</li>;
                }

                return (
                  <li key={item.path}>
                    <Tooltip>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-[hsl(var(--sidebar-border))] px-5 py-5">
            <div
              className={cn(
                "flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-primary-foreground))]/60",
                isCollapsed && "md:justify-center"
              )}
            >
              <span className={cn(isCollapsed && "md:hidden")}>Projets</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))] transition-colors duration-200 hover:bg-[hsl(var(--sidebar-accent))]/80 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-ring))]"
                    aria-label="Créer un projet"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Nouveau projet</TooltipContent>
              </Tooltip>
            </div>
            <ul className="mt-4 space-y-3">
              {projectItems.map((project) => {
                const projectContent = (
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[hsl(var(--sidebar-primary-foreground))]/80 transition-colors duration-200",
                      "hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-primary-foreground))]",
                      isCollapsed && "md:justify-center md:gap-0 md:px-0"
                    )}
                  >
                    <span className={cn("h-2.5 w-2.5 rounded-full", project.color)} />
                    <span className={cn("truncate", isCollapsed && "md:hidden")}>{project.name}</span>
                  </div>
                );

                if (!isCollapsed) {
                  return <li key={project.name}>{projectContent}</li>;
                }

                return (
                  <li key={project.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>{projectContent}</TooltipTrigger>
                      <TooltipContent side="right">{project.name}</TooltipContent>
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </div>

        <div className="mt-auto border-t border-[hsl(var(--sidebar-border))] px-5 py-5">
          <ul className="space-y-2">
            {footerItems.map((item) => {
              const content = (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-[hsl(var(--sidebar-foreground))]/70 transition-colors duration-200 hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-primary-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--sidebar-ring))]",
                      isCollapsed && "md:justify-center md:px-0",
                      isActive && "text-[hsl(var(--sidebar-primary-foreground))]"
                    )
                  }
                  aria-label={isCollapsed ? item.label : undefined}
                  onClick={closeMobileSidebar}
                >
                  <item.icon className="h-5 w-5" />
                  <span className={cn("flex-1 truncate", isCollapsed && "md:hidden")}>{item.label}</span>
                  {item.badge && !isCollapsed && (
                    <span className="rounded-full bg-[hsl(var(--primary))] px-2 py-0.5 text-xs font-semibold text-[hsl(var(--primary-foreground))]">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );

              if (!isCollapsed) {
                return <li key={item.label}>{content}</li>;
              }

              return (
                <li key={item.label}>
                  <Tooltip>
                    <TooltipTrigger asChild>{content}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
          </ul>

          <button
            className={cn(
              "mt-4 flex w-full items-center gap-3 rounded-2xl bg-[hsl(var(--sidebar-accent))]/40 px-3 py-2 text-sm font-medium text-[hsl(var(--sidebar-primary-foreground))] transition-colors duration-200 hover:bg-[hsl(var(--sidebar-accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-ring))]",
              isCollapsed && "md:justify-center md:px-0"
            )}
            type="button"
            onClick={handleLogout}
            aria-label={isCollapsed ? "Déconnexion" : undefined}
          >
            <LogOut className="h-5 w-5" />
            <span className={cn("truncate", isCollapsed && "md:hidden")}>Déconnexion</span>
          </button>
        </div>
      </aside>
    </TooltipProvider>
    </>
  );
};

export default ClientSidebar;
