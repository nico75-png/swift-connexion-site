import { lazy, Suspense, type LazyExoticComponent, type ReactNode } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ErrorBoundary, type FallbackProps } from "./ErrorBoundary";

import { useAuth, type UserRole } from "@/lib/stores/auth.store";
import { useAuthProfile } from "@/providers/AuthProvider";

// Pages publiques
const Home = lazy(() => import("@/pages/public"));
const Expertises = lazy(() => import("@/pages/public/expertises"));
const Tarifs = lazy(() => import("@/pages/public/Tarifs"));
const FAQ = lazy(() => import("@/pages/public/FAQ"));
const Contact = lazy(() => import("@/pages/public/Contact"));
const CommandeSansCompte = lazy(() => import("@/pages/public/CommandeSansCompte"));
const Login = lazy(() => import("@/pages/public/Login"));
const Register = lazy(() => import("@/pages/public/Register"));
const ForgotPassword = lazy(() => import("@/pages/public/ForgotPassword"));
const MentionsLegales = lazy(() => import("@/pages/public/MentionsLegales"));
const CGV = lazy(() => import("@/pages/public/CGV"));
const Cookies = lazy(() => import("@/pages/public/Cookies"));
const NotFound = lazy(() => import("@/pages/public/NotFound"));

// Pages Espace Client
const DashboardClient = lazy(() => import("@/pages/dashboard-client"));
const DashboardClientCommandes = lazy(() => import("@/pages/dashboard-client/commandes"));
const DashboardClientCommandeNouvelle = lazy(() => import("@/pages/dashboard-client/commandes/nouvelle"));
const DashboardClientCommandeDetails = lazy(() => import("@/pages/dashboard-client/commandes/details"));
const DashboardClientSuivi = lazy(() => import("@/pages/dashboard-client/suivi"));
const DashboardClientFactures = lazy(() => import("@/pages/dashboard-client/factures"));
const DashboardClientFactureDetails = lazy(() => import("@/pages/dashboard-client/factures/details"));
const DashboardClientMessages = lazy(() => import("@/pages/dashboard-client/messages"));
const DashboardClientMessageDetails = lazy(() => import("@/pages/dashboard-client/messages/details"));
const DashboardClientProfil = lazy(() => import("@/pages/dashboard-client/profil"));
const DashboardClientParametres = lazy(() => import("@/pages/dashboard-client/parametres"));

// Pages Espace Admin
const DashboardAdmin = lazy(() => import("@/pages/dashboard-admin"));
const DashboardAdminCommandes = lazy(() => import("@/pages/dashboard-admin/commandes"));
const DashboardAdminCommandeDetails = lazy(() => import("@/pages/dashboard-admin/commandes/details"));
const DashboardAdminChauffeurs = lazy(() => import("@/pages/dashboard-admin/chauffeurs"));
const DashboardAdminClients = lazy(() => import("@/pages/dashboard-admin/clients"));
const DashboardAdminClientDetails = lazy(() => import("@/pages/dashboard-admin/clients/details"));
const DashboardAdminFactures = lazy(() => import("@/pages/dashboard-admin/factures"));
const DashboardAdminStatistiques = lazy(() => import("@/pages/dashboard-admin/statistiques"));
const DashboardAdminMessages = lazy(() => import("@/pages/dashboard-admin/messages"));
const DashboardAdminParametres = lazy(() => import("@/pages/dashboard-admin/parametres"));

const Layout = () => <Outlet />;

const Loader = () => (
  <div className="flex flex-col items-center justify-center gap-3 py-16" role="status" aria-live="polite">
    <span className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" aria-hidden="true" />
    <p className="text-sm text-muted-foreground">Chargement…</p>
  </div>
);

const RouteError = ({ error, resetErrorBoundary }: FallbackProps) => (
  <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
    <h2 className="text-xl font-semibold text-foreground">Oups…</h2>
    <p className="max-w-md text-sm text-muted-foreground">{String(error?.message ?? error)}</p>
    <button
      type="button"
      onClick={resetErrorBoundary}
      className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
    >
      Réessayer
    </button>
  </div>
);

interface GuardOptions {
  requiresAuth?: boolean;
  roles?: UserRole[];
}

type LazyRouteComponent = LazyExoticComponent<() => JSX.Element>;

const withGuards = (Component: LazyRouteComponent, options?: GuardOptions) => {
  const element = (
    <ErrorBoundary FallbackComponent={RouteError}>
      <Suspense fallback={<Loader />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );

  if (!options?.requiresAuth) {
    return element;
  }

  return (
    <RequireAuth roles={options.roles}>
      {element}
    </RequireAuth>
  );
};

const RequireAuth = ({ children, roles }: { children: ReactNode; roles?: UserRole[] }) => {
  const { isLoading } = useAuthProfile();
  const { currentUser } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* A - PAGES PUBLIQUES */}
        <Route index element={withGuards(Home)} />
        <Route path="expertises" element={withGuards(Expertises)} />
        <Route path="tarifs" element={withGuards(Tarifs)} />
        <Route path="faq" element={withGuards(FAQ)} />
        <Route path="contact" element={withGuards(Contact)} />
        <Route path="commande-sans-compte" element={withGuards(CommandeSansCompte)} />
        <Route path="login" element={withGuards(Login)} />
        <Route path="register" element={withGuards(Register)} />
        <Route path="forgot-password" element={withGuards(ForgotPassword)} />
        <Route path="mentions-legales" element={withGuards(MentionsLegales)} />
        <Route path="cgv" element={withGuards(CGV)} />
        <Route path="cookies" element={withGuards(Cookies)} />

        {/* B - ESPACE CLIENT */}
        <Route path="dashboard-client" element={withGuards(DashboardClient, { requiresAuth: true })} />
        <Route path="dashboard-client/commandes" element={withGuards(DashboardClientCommandes, { requiresAuth: true })} />
        <Route path="dashboard-client/commandes/nouvelle" element={withGuards(DashboardClientCommandeNouvelle, { requiresAuth: true })} />
        <Route path="dashboard-client/commandes/:id" element={withGuards(DashboardClientCommandeDetails, { requiresAuth: true })} />
        <Route path="dashboard-client/suivi/:id" element={withGuards(DashboardClientSuivi, { requiresAuth: true })} />
        <Route path="dashboard-client/factures" element={withGuards(DashboardClientFactures, { requiresAuth: true })} />
        <Route path="dashboard-client/factures/:id" element={withGuards(DashboardClientFactureDetails, { requiresAuth: true })} />
        <Route path="dashboard-client/messages" element={withGuards(DashboardClientMessages, { requiresAuth: true })} />
        <Route path="dashboard-client/messages/:id" element={withGuards(DashboardClientMessageDetails, { requiresAuth: true })} />
        <Route path="dashboard-client/profil" element={withGuards(DashboardClientProfil, { requiresAuth: true })} />
        <Route path="dashboard-client/parametres" element={withGuards(DashboardClientParametres, { requiresAuth: true })} />

        {/* C - ESPACE ADMIN */}
        <Route path="dashboard-admin" element={withGuards(DashboardAdmin, { requiresAuth: true, roles: ["admin"] })} />
        <Route path="dashboard-admin/commandes" element={withGuards(DashboardAdminCommandes, { requiresAuth: true, roles: ["admin"] })} />
        <Route
          path="dashboard-admin/commandes/:id"
          element={withGuards(DashboardAdminCommandeDetails, { requiresAuth: true, roles: ["admin"] })}
        />
        <Route path="dashboard-admin/chauffeurs" element={withGuards(DashboardAdminChauffeurs, { requiresAuth: true, roles: ["admin"] })} />
        <Route path="dashboard-admin/clients" element={withGuards(DashboardAdminClients, { requiresAuth: true, roles: ["admin"] })} />
        <Route
          path="dashboard-admin/clients/:id"
          element={withGuards(DashboardAdminClientDetails, { requiresAuth: true, roles: ["admin"] })}
        />
        <Route path="dashboard-admin/factures" element={withGuards(DashboardAdminFactures, { requiresAuth: true, roles: ["admin"] })} />
        <Route path="dashboard-admin/statistiques" element={withGuards(DashboardAdminStatistiques, { requiresAuth: true, roles: ["admin"] })} />
        <Route path="dashboard-admin/messages" element={withGuards(DashboardAdminMessages, { requiresAuth: true, roles: ["admin"] })} />
        <Route path="dashboard-admin/parametres" element={withGuards(DashboardAdminParametres, { requiresAuth: true, roles: ["admin"] })} />

        {/* 404 */}
        <Route path="404" element={withGuards(NotFound)} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}
