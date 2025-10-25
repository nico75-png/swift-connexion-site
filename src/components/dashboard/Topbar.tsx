import { Bell, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthProfile } from "@/providers/AuthProvider";

interface TopbarProps {
  userName?: string;
  title?: string;
  notifications?: Array<{
    id: string;
    message: string;
    time: string;
    read: boolean;
  }>;
}

/**
 * Topbar avec notifications, thème et profil utilisateur
 */
const Topbar = ({ userName, title, notifications = [] }: TopbarProps) => {
  const [darkMode, setDarkMode] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const { resolvedDisplayName, fallbackEmail } = useAuthProfile();
  const finalName = userName ?? resolvedDisplayName ?? fallbackEmail ?? "Utilisateur";

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header
      className="safe-area sticky top-0 z-[var(--z-sticky)] flex w-full flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-card/95 px-4 py-3 shadow-[0_4px_12px_rgba(11,45,85,0.08)] backdrop-blur supports-[backdrop-filter]:bg-card/80 md:flex-nowrap md:px-8"
      style={{ minHeight: "var(--dashboard-topbar-height)" }}
    >
      {/* Titre de page ou breadcrumb */}
      <div className="minw0">
        <h2 className="wrap-any text-lg font-semibold text-foreground md:text-xl">
          {title || `Bienvenue, ${finalName}`}
        </h2>
      </div>

      {/* Actions */}
      <div className="minw0 flex flex-wrap items-center gap-3 md:justify-end">
        {/* Toggle thème */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Changer le thème"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-3 border-b">
              <h3 className="font-semibold">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Aucune notification
                </div>
              ) : (
                notifications.map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    className={`p-3 cursor-pointer ${!notif.read ? "bg-primary/5" : ""}`}
                  >
                    <div>
                      <p className="text-sm">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profil */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mon profil</DropdownMenuItem>
            <DropdownMenuItem>Préférences</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Déconnexion</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Topbar;
