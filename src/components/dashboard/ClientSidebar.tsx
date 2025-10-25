import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Truck,
  PhoneCall,
  HelpCircle,
  Sun,
  Moon
} from "lucide-react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuthProfile } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

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
    navigate("/auth");
  };

  const toggleMobileSidebar = () => setIsMobileOpen(value => !value);
  const closeMobileSidebar = () => setIsMobileOpen(false);
  const toggleCollapse = () => setIsCollapsed(value => !value);
  const toggleTheme = () => setTheme(value => (value === "light" ? "dark" : "light"));

  const primaryNavigation = [{
    icon: LayoutDashboard,
    label: "Tableau de bord",
    path: "/dashboard"
  }, {
    icon: Package,
    label: "Mes commandes",
    path: "/commandes"
  }, {
    icon: Truck,
    label: "Suivi en temps réel",
    path: "/suivi"
  }, {
    icon: FileText,
    label: "Mes factures",
    path: "/factures"
  }, {
    icon: MessageSquare,
    label: "Messages",
    path: "/messages"
  }, {
    icon: Settings,
    label: "Paramètres",
    path: "/parametres"
  }];

  const secondaryNavigation = [{
    icon: PhoneCall,
    label: "Client d'assistance",
    path: "/support"
  }, {
    icon: HelpCircle,
    label: "Centre d'aide",
    path: "/aide"
  }];

  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 12]);

  return (
    <>
      <button
        type="button"
        onClick={toggleMobileSidebar}
        className="fixed left-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#0B2D55] text-white shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-[#0a274b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00] md:hidden"
        aria-label="Ouvrir la navigation"
      >
        <Menu className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileSidebar}
          />
        )}
      </AnimatePresence>

      <TooltipProvider delayDuration={0}>
        <AnimatePresence>
          {(isMobileOpen || isDesktop) && (
            <motion.aside
              key="client-sidebar"
              initial={{ x: -320, opacity: 0 }}
              animate={{
                x: isMobileOpen || isDesktop ? 0 : -320,
                opacity: 1
              }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              data-collapsed={isCollapsed}
              className={cn(
                "glassmorphic fixed inset-y-0 left-0 z-40 flex h-screen flex-col border border-transparent md:top-4 md:left-4",
                "md:h-[calc(100vh-2rem)]",
                "rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.15)]",
                SIDEBAR_BG,
                SIDEBAR_BORDER,
                "text-[#F2F6FA] backdrop-blur-2xl transition-[width] duration-300",
                isCollapsed ? "w-[88px]" : "w-[216px]"
              )}
            >
              <div className="relative flex h-full flex-col overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                />

                <div className="relative flex items-center justify-between gap-2 px-6 pb-4 pt-6">
                  <div className={cn("flex items-center gap-3", isCollapsed && "md:hidden")}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl font-semibold text-white shadow-inner">
                      OC
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm uppercase tracking-[0.3em] text-white/60">One Connexion</p>
                      <p className="text-lg font-semibold text-white">Bonjour, {firstName}</p>
                      <p className="text-xs text-white/60">Client professionnel</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleCollapse}
                      className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:scale-105 hover:border-[#FFCC00]/60 hover:bg-[#FFCC00]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00] md:flex"
                      aria-label={isCollapsed ? "Déplier la barre latérale" : "Réduire la barre latérale"}
                    >
                      {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    </button>

                    <button
                      type="button"
                      onClick={closeMobileSidebar}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:scale-105 hover:border-[#FFCC00]/60 hover:bg-[#FFCC00]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00] md:hidden"
                      aria-label="Fermer la navigation"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="relative mx-6 mb-4 mt-2 h-px bg-white/20" />

                <motion.nav
                  className="relative flex-1 overflow-y-auto px-3"
                  style={{ y: parallaxY }}
                >
                  <motion.ul
                    className="space-y-2"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { staggerChildren: 0.05, delayChildren: 0.15 }
                      }
                    }}
                  >
                    {primaryNavigation.map(item => {
                      const link = (
                        <NavLink
                          to={item.path}
              end={item.path === "/dashboard"}
                          className={({ isActive }) =>
                            cn(
                              "group flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-white/80 transition-all duration-300",
                              "hover:border-[#FFCC00]/60 hover:bg-[rgba(255,204,0,0.08)] hover:text-white",
                              isCollapsed && "justify-center px-0",
                              isActive && "border-[#FFCC00] bg-[rgba(255,204,0,0.2)] text-white"
                            )
                          }
                          aria-label={isCollapsed ? item.label : undefined}
                          onClick={closeMobileSidebar}
                        >
                          <span
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-all duration-300",
                              "group-hover:border-[#FFCC00] group-hover:bg-[#FFCC00]/20 group-hover:text-[#FFCC00]",
                              isCollapsed && "h-12 w-12",
                              "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                          </span>
                          <span
                            className={cn(
                              "truncate text-base tracking-wide",
                              isCollapsed && "hidden"
                            )}
                          >
                            {item.label}
                          </span>
                        </NavLink>
                      );

                      return (
                        <motion.li
                          key={item.path}
                          variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                          whileHover={{ scale: 1.05, boxShadow: "0 0 12px rgba(255,204,0,0.4)" }}
                        >
                          {isCollapsed ? (
                            <Tooltip>
                              <TooltipTrigger asChild>{link}</TooltipTrigger>
                              <TooltipContent side="right">{item.label}</TooltipContent>
                            </Tooltip>
                          ) : (
                            link
                          )}
                        </motion.li>
                      );
                    })}
                  </motion.ul>

                  <div className="mt-6 mb-4 h-px bg-white/15" />

                  <motion.ul
                    className="space-y-2"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { staggerChildren: 0.05, delayChildren: 0.3 }
                      }
                    }}
                  >
                    {secondaryNavigation.map(item => {
                      const link = (
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            cn(
                              "group flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-white/70 transition-all duration-300",
                              "hover:border-[#FFCC00]/60 hover:bg-[rgba(255,204,0,0.08)] hover:text-white",
                              isCollapsed && "justify-center px-0",
                              isActive && "border-[#FFCC00] bg-[rgba(255,204,0,0.2)] text-white"
                            )
                          }
                          aria-label={isCollapsed ? item.label : undefined}
                          onClick={closeMobileSidebar}
                        >
                          <span
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-all duration-300",
                              "group-hover:border-[#FFCC00] group-hover:bg-[#FFCC00]/20 group-hover:text-[#FFCC00]",
                              isCollapsed && "h-12 w-12"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                          </span>
                          <span className={cn("truncate text-base", isCollapsed && "hidden")}>{item.label}</span>
                        </NavLink>
                      );

                      return (
                        <motion.li
                          key={item.path}
                          variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                          whileHover={{ scale: 1.05, boxShadow: "0 0 12px rgba(255,204,0,0.4)" }}
                        >
                          {isCollapsed ? (
                            <Tooltip>
                              <TooltipTrigger asChild>{link}</TooltipTrigger>
                              <TooltipContent side="right">{item.label}</TooltipContent>
                            </Tooltip>
                          ) : (
                            link
                          )}
                        </motion.li>
                      );
                    })}
                  </motion.ul>
                </motion.nav>

                <div className="relative mt-auto px-4 pb-6 pt-4">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-inner">
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-transparent bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:border-[#FFCC00]/60 hover:bg-[#FFCC00]/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#0B2D55]/60 text-white shadow-inner">
                          {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </span>
                        {!isCollapsed && (
                          <div className="text-left">
                            <p className="text-sm font-semibold">Mode {theme === "light" ? "clair" : "sombre"}</p>
                            <p className="text-xs text-white/60">Ajustez votre ambiance visuelle</p>
                          </div>
                        )}
                      </div>
                      <span className="relative flex h-7 w-12 items-center rounded-full bg-white/20 p-1">
                        <motion.span
                          layout
                          className="h-5 w-5 rounded-full bg-[#FFCC00] shadow-[0_4px_12px_rgba(255,204,0,0.45)]"
                          animate={{ x: theme === "light" ? 0 : 20 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        />
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-transparent bg-[rgba(255,204,0,0.12)] px-4 py-3 text-sm font-semibold text-[#FFCC00] transition-all duration-300 hover:bg-[rgba(255,204,0,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FFCC00]/40 bg-[#FFCC00]/10 text-[#FFCC00]">
                          <LogOut className="h-5 w-5" />
                        </span>
                        {!isCollapsed && <span className="text-base">Déconnexion</span>}
                      </div>
                      {!isCollapsed && <ChevronRight className="h-5 w-5 text-[#FFCC00]" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </TooltipProvider>
    </>
  );
};

export default ClientSidebar;
