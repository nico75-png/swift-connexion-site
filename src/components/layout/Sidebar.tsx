import { type ElementType, type FC } from "react";
import {
  ChevronRight,
  FileText,
  Headphones,
  HelpCircle,
  Home,
  MapPin,
  MessageSquare,
  Package,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";

type SidebarItemProps = {
  icon: ElementType;
  label: string;
  active?: boolean;
  hasArrow?: boolean;
};

export const SidebarItem: FC<SidebarItemProps> = ({ icon: Icon, label, active = false, hasArrow }) => {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex w-full items-center justify-center rounded-lg px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "cursor-pointer hover:bg-slate-50",
        "md:justify-between",
        active ? "bg-slate-100" : "bg-transparent",
      )}
    >
      <span className="flex items-center gap-3">
        <Icon aria-hidden className={cn("h-5 w-5", active ? "text-slate-600" : "text-slate-500")} />
        <span
          className={cn(
            "hidden text-sm font-medium md:inline",
            active ? "font-semibold text-slate-900" : "text-slate-700",
          )}
        >
          {label}
        </span>
      </span>
      {hasArrow ? (
        <ChevronRight aria-hidden className="hidden h-4 w-4 text-slate-400 md:inline" />
      ) : null}
    </button>
  );
};

export const Sidebar: FC = () => {
  return (
    <div
      className="fixed left-0 top-0 flex h-screen w-20 flex-col gap-2 rounded-r-2xl bg-white p-4 text-slate-800 shadow-sm md:w-[260px]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <SidebarItem icon={Home} label="Mon espace" active />
      <SidebarItem icon={Package} label="Commandes" />
      <SidebarItem icon={MapPin} label="Suivi" />
      <SidebarItem icon={FileText} label="Factures" />
      <SidebarItem icon={MessageSquare} label="Messages" hasArrow />
      <SidebarItem icon={User} label="Mon compte" hasArrow />
      <SidebarItem icon={Headphones} label="Service client" hasArrow />
      <SidebarItem icon={HelpCircle} label="Centre d'aide" />
    </div>
  );
};

export default Sidebar;
