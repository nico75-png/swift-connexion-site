"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageSquare,
  Package,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Tableau de bord", href: "/", icon: LayoutDashboard },
  { name: "Commandes", href: "/commandes", icon: Package },
  { name: "Suivi", href: "/suivi", icon: MapPin },
  { name: "Factures", href: "/factures", icon: FileText },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Paramètres", href: "/parametres", icon: Settings },
  { name: "Aide", href: "/aide", icon: HelpCircle },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const normalizedPathname = useMemo(() => {
    if (!pathname) {
      return "/";
    }

    if (pathname === "/") {
      return pathname;
    }

    return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  }, [pathname]);

  return (
    <div className="flex h-full flex-col justify-between bg-[#0B1437] text-white">
      <div>
        <div className="flex items-center gap-3 px-6 pb-8 pt-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-lg font-bold">
            CS
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
              Connexion Swift
            </p>
            <p className="text-xs text-white/60">Dashboard client</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-4" aria-label="Navigation principale">
          {navItems.map(({ name, href, icon: Icon }) => {
            const active = normalizedPathname === href;

            return (
              <Link
                key={name}
                href={href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-white/10 text-white font-medium"
                    : "text-gray-300 hover:bg-white/5 hover:text-white",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="px-6 pb-6">
        <div className="rounded-lg bg-white/5 p-4 text-xs text-white/70">
          <p className="font-semibold text-white">Support 24/7</p>
          <p className="mt-1 leading-relaxed">
            Besoin d'aide ? Notre équipe est disponible à tout moment pour vous
            accompagner.
          </p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="w-0 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed left-4 top-4 z-50 h-10 w-10 rounded-full bg-[#0B1437] text-white shadow md:hidden"
              aria-label="Ouvrir la navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-72 border-none bg-[#0B1437] p-0 text-white"
          >
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden min-h-screen w-64 shrink-0 border-r border-white/10 bg-[#0B1437] md:block">
        <SidebarContent />
      </aside>
    </>
  );
}

export default Sidebar;
