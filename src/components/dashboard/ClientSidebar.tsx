import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, FileText, MessageSquare, Settings, LogOut, Menu, X, ChevronLeft, ChevronRight, Truck, PhoneCall, HelpCircle, Sun, Moon } from "lucide-react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuthProfile } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
const SIDEBAR_BG = "bg-[rgba(11,45,85,0.35)]";
const SIDEBAR_BORDER = "border-white/10";
const ClientSidebar = () => {
  const navigate = useNavigate();
  const {
    resolvedDisplayName,
    fallbackEmail
  } = useAuthProfile();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia("(min-width: 768px)").matches;
  });
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const sidebarName = resolvedDisplayName ?? fallbackEmail ?? "Profil client";
  const firstName = useMemo(() => sidebarName?.split(" ")[0] ?? "", [sidebarName]);
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const root = document.documentElement;
    setTheme(root.classList.contains("dark") ? "dark" : "light");
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateIsDesktop = () => setIsDesktop(mediaQuery.matches);
    updateIsDesktop();
    mediaQuery.addEventListener("change", updateIsDesktop);
    return () => mediaQuery.removeEventListener("change", updateIsDesktop);
  }, []);
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);
  const handleLogout = async () => {
    const {
      error
    } = await supabase.auth.signOut();
    if (error) {
      console.error("Erreur lors de la déconnexion", error);
      return;
    }
    setIsMobileOpen(false);
    navigate("/login");
  };
  const toggleMobileSidebar = () => setIsMobileOpen(value => !value);
  const closeMobileSidebar = () => setIsMobileOpen(false);
  const toggleCollapse = () => setIsCollapsed(value => !value);
  const toggleTheme = () => setTheme(value => value === "light" ? "dark" : "light");
  const primaryNavigation = [{
    icon: LayoutDashboard,
    label: "Tableau de bord",
    path: "/dashboard-client"
  }, {
    icon: Package,
    label: "Mes commandes",
    path: "/dashboard-client?tab=commandes"
  }, {
    icon: Truck,
    label: "Suivi en temps réel",
    path: "/dashboard-client?tab=suivi"
  }, {
    icon: FileText,
    label: "Mes factures",
    path: "/dashboard-client?tab=factures"
  }, {
    icon: MessageSquare,
    label: "Messages",
    path: "/dashboard-client?tab=messages"
  }, {
    icon: Settings,
    label: "Paramètres",
    path: "/dashboard-client?tab=parametres"
  }];
  const secondaryNavigation = [{
    icon: PhoneCall,
    label: "Client d'assistance",
    path: "/contact"
  }, {
    icon: HelpCircle,
    label: "Centre d'aide",
    path: "/faq"
  }];
  const {
    scrollYProgress
  } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 12]);
  return <>
      <button type="button" onClick={toggleMobileSidebar} className="fixed left-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#0B2D55] text-white shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-[#0a274b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00] md:hidden" aria-label="Ouvrir la navigation">
        <Menu className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {isMobileOpen && <motion.div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={closeMobileSidebar} />}
      </AnimatePresence>

      <TooltipProvider delayDuration={0}>
        <AnimatePresence>
          {isMobileOpen || isDesktop}
        </AnimatePresence>
      </TooltipProvider>
    </>;
};
export default ClientSidebar;