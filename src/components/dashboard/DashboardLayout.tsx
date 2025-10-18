import { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useAuthProfile } from "@/providers/AuthProvider";

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  topbar: ReactNode;
  showProfileReminder?: boolean;
}

/**
 * Layout principal pour les dashboards (client & admin)
 * Sidebar fixe à gauche + Topbar + contenu principal
 */
const DashboardLayout = ({ children, sidebar, topbar, showProfileReminder = false }: DashboardLayoutProps) => {
  const { isProfileComplete, fallbackEmail } = useAuthProfile();
  const shouldShowReminder = showProfileReminder && !isProfileComplete && fallbackEmail;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar fixe */}
      {sidebar}

      {/* Zone principale avec topbar + contenu */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        {topbar}

        {/* Contenu principal scrollable */}
        <main className="flex-1 overflow-y-auto p-6">
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
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
