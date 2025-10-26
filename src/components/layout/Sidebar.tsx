import { type ComponentPropsWithoutRef, type ElementType, type FC } from "react";
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

type SidebarItemBaseProps = {
  icon: ElementType;
  label: string;
  active?: boolean;
  hasArrow?: boolean;
};

type SidebarItemButtonProps = SidebarItemBaseProps &
  Omit<ComponentPropsWithoutRef<"button">, "type"> & { href?: undefined };

type SidebarItemLinkProps = SidebarItemBaseProps &
  ComponentPropsWithoutRef<"a"> & { href: string };

export type SidebarItemProps = SidebarItemButtonProps | SidebarItemLinkProps;

export const SidebarItem: FC<SidebarItemProps> = (props) => {
  const { icon: Icon, label, active = false, hasArrow } = props;

  const baseClassName = cn(
    "flex w-full items-center justify-center rounded-lg px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
    "cursor-pointer hover:bg-slate-50",
    hasArrow ? "md:justify-between" : "md:justify-start",
    active ? "bg-slate-100" : "bg-transparent",
  );

  const content = (
    <>
      <span className="flex items-center gap-3">
        <Icon aria-hidden className={cn("h-5 w-5", active ? "text-slate-600" : "text-slate-500")} />
        <span
          className={cn(
            "hidden text-sm font-medium text-slate-700 md:inline",
            active ? "font-semibold text-slate-900" : "text-slate-700",
          )}
        >
          {label}
        </span>
      </span>
      {hasArrow ? (
        <ChevronRight aria-hidden className="hidden h-4 w-4 text-slate-400 md:inline" />
      ) : null}
    </>
  );

  if ("href" in props && typeof props.href === "string") {
    const { href, className, ...rest } = props;

    return (
      <a
        href={href}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className={cn(baseClassName, className)}
        {...rest}
      >
        {content}
      </a>
    );
  }

  const { href: _href, type, className, ...rest } = props;

  return (
    <button
      type={type ?? "button"}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(baseClassName, className)}
      {...rest}
    >
      {content}
    </button>
  );
};

export const Sidebar: FC = () => {
  return (
    <nav
      aria-label="Navigation latérale"
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
    </nav>
  );
};

export default Sidebar;
