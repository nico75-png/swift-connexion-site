import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FileText,
  TrendingUp,
  MessageSquare,
  User,
  Settings,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sidebar pour l'espace client
 * Navigation principale avec icônes et labels
 */
const ClientSidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: "Tableau de bord", path: "/espace-client" },
    { icon: Package, label: "Mes commandes", path: "/espace-client/commandes" },
    { icon: FileText, label: "Factures", path: "/espace-client/factures" },
    { icon: TrendingUp, label: "Dépenses", path: "/espace-client/depenses" },
    { icon: MessageSquare, label: "Messages", path: "/espace-client/messages" },
    { icon: User, label: "Profil", path: "/espace-client/profil" },
    { icon: Settings, label: "Préférences", path: "/espace-client/preferences" },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary">One Connexion</h1>
        <p className="text-xs text-muted-foreground mt-1">Espace Client</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/espace-client"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-6 py-3 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary border-r-2 border-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Déconnexion */}
      <div className="p-4 border-t border-border">
        <button className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors w-full">
          <LogOut className="h-5 w-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default ClientSidebar;
