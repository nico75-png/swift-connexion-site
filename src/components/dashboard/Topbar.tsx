import {
  Bell,
  CalendarClock,
  CircleHelp,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

interface TopbarProps {
  userName?: string;
  title?: string;
  notifications?: Array<{
    id: string;
    message: string;
    time: string;
    read: boolean;
  }>;
  avatarUrl?: string | null;
  onCreateOrder?: () => void;
  onScheduleReview?: () => void;
  className?: string;
}

/**
 * Topbar avec notifications, thème et profil utilisateur
 */
const Topbar = ({
  userName,
  title,
  notifications = [],
  avatarUrl,
  onCreateOrder,
  onScheduleReview,
  className,
}: TopbarProps) => {
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const { resolvedDisplayName, fallbackEmail } = useAuth();
  const finalName = userName ?? resolvedDisplayName ?? fallbackEmail ?? "Utilisateur";

  const initials = useMemo(() => {
    if (!finalName) {
      return "US";
    }
    const parts = finalName.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }, [finalName]);

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-20 items-center justify-between gap-6 border-b border-slate-200/70 bg-white/80 px-6 backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex flex-1 items-center gap-6">
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">{`Espace admin`}</p>
          <h2 className="truncate font-['Inter'] text-2xl font-semibold text-slate-900">
            {title || `Bienvenue, ${finalName}`}
          </h2>
        </div>
        <div className="hidden flex-1 items-center rounded-2xl bg-slate-100/70 px-4 py-3 shadow-inner transition focus-within:ring-2 focus-within:ring-[#2563EB]/40 md:flex">
          <Search className="mr-3 h-5 w-5 text-slate-400" aria-hidden="true" />
          <Input
            className="h-6 border-0 bg-transparent p-0 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:ring-0"
            placeholder="Rechercher une commande, un client ou un chauffeur"
            aria-label="Rechercher dans le tableau de bord"
          />
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-3">
        <Button
          variant="outline"
          className="hidden items-center gap-2 rounded-2xl border-[#2563EB]/20 bg-[#2563EB]/10 px-4 py-2 text-sm font-semibold text-[#2563EB] shadow-sm transition hover:border-[#2563EB]/40 hover:bg-[#2563EB]/20 md:inline-flex"
          onClick={onScheduleReview}
        >
          <CalendarClock className="h-4 w-4" />
          Planifier un suivi
        </Button>
        <Button
          className="inline-flex items-center gap-2 rounded-2xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#1D4ED8]"
          onClick={onCreateOrder}
        >
          <Plus className="h-4 w-4" />
          Nouvelle commande
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-2xl border border-transparent bg-slate-100 text-slate-500 transition hover:border-[#2563EB]/30 hover:bg-[#2563EB]/10 hover:text-[#2563EB]"
              aria-label="Ouvrir les notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#EF4444] p-0 text-[11px] font-semibold">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-2xl border border-slate-200/80 bg-white p-0 shadow-lg">
            <div className="border-b border-slate-200/80 px-4 py-3">
              <h3 className="text-base font-semibold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500">Suivez les dernières activités de la plateforme</p>
            </div>
            <div className="max-h-[320px] space-y-1 overflow-y-auto p-2">
              {notifications.length === 0 ? (
                <div className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  Aucune notification pour le moment
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 rounded-xl px-3 py-3 text-sm text-slate-600 transition focus:bg-[#2563EB]/10",
                      notification.read ? "bg-white" : "bg-[#2563EB]/5",
                    )}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                      <Bell className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{notification.message}</p>
                      <p className="text-xs text-slate-500">{notification.time}</p>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-[#2563EB]/40 hover:shadow-md"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatarUrl ?? undefined} alt={finalName} />
                <AvatarFallback className="bg-[#2563EB]/10 text-sm font-semibold text-[#2563EB]">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-slate-900">{finalName}</p>
                <p className="text-xs text-slate-500">Administrateur principal</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xl">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatarUrl ?? undefined} alt={finalName} />
                <AvatarFallback className="bg-[#2563EB]/10 text-sm font-semibold text-[#2563EB]">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-slate-900">{finalName}</p>
                <p className="text-xs text-slate-500">Administration générale</p>
              </div>
            </div>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600">
              <UserRound className="h-4 w-4 text-[#2563EB]" /> Profil administrateur
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600">
              <Settings className="h-4 w-4 text-[#2563EB]" /> Préférences
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600">
              <ShieldCheck className="h-4 w-4 text-[#2563EB]" /> Sécurité
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-600">
              <LogOut className="h-4 w-4" /> Déconnexion
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-500">
              <CircleHelp className="h-4 w-4 text-[#2563EB]" /> Besoin d'aide ? Contact support
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hidden rounded-2xl border border-transparent bg-slate-100 text-slate-500 transition hover:border-[#2563EB]/30 hover:bg-[#2563EB]/10 hover:text-[#2563EB] lg:flex"
              aria-label="Ouvrir le centre de messages"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 rounded-2xl border border-slate-200/80 bg-white p-0 shadow-lg">
            <div className="px-4 py-3">
              <h3 className="text-base font-semibold text-slate-900">Messages rapides</h3>
              <p className="text-xs text-slate-500">Derniers échanges avec les équipes</p>
            </div>
            <div className="space-y-2 px-3 pb-3">
              <div className="rounded-2xl bg-[#2563EB]/10 px-4 py-3 text-sm text-[#2563EB]">
                Point logistique avec l'équipe express à 16:00
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Brief chauffeurs du matin confirmé ✅
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Topbar;
