/* eslint-disable react-refresh/only-export-components */
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  topbar: ReactNode;
  showProfileReminder?: boolean;
}

export interface DashboardDrawerOptions {
  labelledBy?: string;
  describedBy?: string;
  initialFocus?: string;
  onClose?: () => void;
}

interface DrawerState {
  isOpen: boolean;
  content: ReactNode | null;
  labelledBy?: string;
  describedBy?: string;
  initialFocus?: string;
}

interface DashboardDrawerContextValue {
  isOpen: boolean;
  openDrawer: (content: ReactNode, options?: DashboardDrawerOptions) => void;
  closeDrawer: () => void;
}

const DashboardDrawerContext = createContext<DashboardDrawerContextValue | null>(null);

export const useDashboardDrawer = () => {
  const context = useContext(DashboardDrawerContext);
  if (!context) {
    throw new Error("useDashboardDrawer must be used within a DashboardLayout");
  }
  return context;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const getFocusableElements = (container: HTMLElement | null) => {
  if (!container) {
    return [];
  }
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true",
  );
};

/**
 * Layout principal pour les dashboards (client & admin)
 * Sidebar fixe à gauche + Topbar + contenu principal + tiroir contextuel
 */
const DashboardLayout = ({ children, sidebar, topbar, showProfileReminder = false }: DashboardLayoutProps) => {
  const { isProfileComplete, fallbackEmail } = useAuth();
  const shouldShowReminder = showProfileReminder && !isProfileComplete && fallbackEmail;

  const [drawerState, setDrawerState] = useState<DrawerState>({ isOpen: false, content: null });
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef<(() => void) | null>(null);

  const closeDrawer = useCallback(() => {
    setDrawerState((previous) => (previous.isOpen ? { ...previous, isOpen: false } : previous));
    if (onCloseRef.current) {
      onCloseRef.current();
      onCloseRef.current = null;
    }
  }, []);

  const openDrawer = useCallback((content: ReactNode, options?: DashboardDrawerOptions) => {
    onCloseRef.current = options?.onClose ?? null;
    setDrawerState({
      isOpen: true,
      content,
      labelledBy: options?.labelledBy,
      describedBy: options?.describedBy,
      initialFocus: options?.initialFocus,
    });
  }, []);

  useEffect(() => {
    if (!drawerState.isOpen) {
      if (previouslyFocusedRef.current) {
        previouslyFocusedRef.current.focus({ preventScroll: true });
        previouslyFocusedRef.current = null;
      }
      document.body.style.removeProperty("overflow");
      return;
    }

    const previousOverflow = document.body.style.overflow;
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";

    const focusDrawer = () => {
      if (!drawerRef.current) {
        return;
      }

      let focusTarget: HTMLElement | null = null;

      if (drawerState.initialFocus) {
        try {
          focusTarget = drawerRef.current.querySelector<HTMLElement>(drawerState.initialFocus) ?? null;
        } catch (error) {
          console.warn("Invalid initial focus selector", drawerState.initialFocus, error);
          focusTarget = null;
        }
      }

      if (!focusTarget) {
        const focusable = getFocusableElements(drawerRef.current);
        focusTarget = focusable[0] ?? drawerRef.current;
      }

      focusTarget?.focus({ preventScroll: true });
    };

    const frame = window.requestAnimationFrame(focusDrawer);

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerState.initialFocus, drawerState.isOpen]);

  useEffect(() => {
    if (!drawerState.isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer();
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) {
        return;
      }

      const focusable = getFocusableElements(drawerRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        drawerRef.current.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeDrawer, drawerState.isOpen]);

  const contextValue = useMemo<DashboardDrawerContextValue>(
    () => ({
      isOpen: drawerState.isOpen,
      openDrawer,
      closeDrawer,
    }),
    [closeDrawer, drawerState.isOpen, openDrawer],
  );

  return (
    <DashboardDrawerContext.Provider value={contextValue}>
      <div className={cn("app", drawerState.isOpen && "drawer-open")}>        
        <aside className="sidebar">{sidebar}</aside>
        <div className="content">
          {topbar}
          <div className="content-inner">
            {shouldShowReminder && (
              <Alert className="mb-6 border-amber-300 bg-amber-50 text-amber-900">
                <Info className="h-4 w-4 text-amber-500" />
                <AlertTitle>Complétez votre profil</AlertTitle>
                <AlertDescription>
                  Nous affichons temporairement votre email ({fallbackEmail}). Ajoutez vos nom et prénom pour personnaliser votre
                  compte.
                </AlertDescription>
              </Alert>
            )}
            {children}
          </div>
        </div>
        <aside
          ref={drawerRef}
          className="drawer"
          role="dialog"
          aria-modal="true"
          aria-hidden={drawerState.isOpen ? undefined : true}
          aria-labelledby={drawerState.labelledBy}
          aria-describedby={drawerState.describedBy}
          tabIndex={-1}
        >
          {drawerState.content}
        </aside>
        {drawerState.isOpen && (
          <button
            type="button"
            className="drawer-overlay"
            aria-hidden="true"
            tabIndex={-1}
            onClick={closeDrawer}
          />
        )}
      </div>
    </DashboardDrawerContext.Provider>
  );
};

export default DashboardLayout;
