import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";

import Sidebar, { navigationItems } from "./Sidebar";

interface MainLayoutProps {
  userEmail: string;
  children: ReactNode;
}

const MainLayout = ({ userEmail, children }: MainLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-slate-50">
      <Sidebar
        userEmail={userEmail}
        isDarkMode={isDarkMode}
        onToggleDarkMode={setIsDarkMode}
        onLogout={() => undefined}
      />

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-slate-900/60"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative z-50">
            <Sidebar
              variant="mobile"
              userEmail={userEmail}
              isDarkMode={isDarkMode}
              onToggleDarkMode={setIsDarkMode}
              onLogout={() => undefined}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-h-screen w-full flex-col lg:ml-[6cm] lg:pl-0">
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <nav className="flex items-center gap-3">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-slate-500 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600"
                    aria-label={item.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </nav>
          </div>
        </div>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
