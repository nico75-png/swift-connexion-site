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
import { useAuth } from "@/providers/AuthProvider";

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
  const { resolvedDisplayName, fallbackEmail } = useAuth();
  const finalName = userName ?? resolvedDisplayName ?? fallbackEmail ?? "Utilisateur";

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 md:px-10">
      {/* Titre de page ou breadcrumb */}
      <div>
        <h2 className="text-lg font-semibold">{title || `Bienvenue, ${finalName}`}</h2>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
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
