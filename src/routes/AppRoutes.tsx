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

// Pages Espace Client (une seule page principale)
const DashboardClient = lazy(() => import("@/pages/dashboard-client"));

// Pages Espace Admin (une seule page principale)
const DashboardAdmin = lazy(() => import("@/pages/dashboard-admin"));

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
        <Route path="se-connecter" element={<Navigate to="/login" replace />} />
        <Route path="register" element={withGuards(Register)} />
        <Route path="registre" element={<Navigate to="/register" replace />} />
        <Route path="forgot-password" element={withGuards(ForgotPassword)} />
        <Route path="mot-de-passe-oublie" element={<Navigate to="/forgot-password" replace />} />
        <Route path="mentions-legales" element={withGuards(MentionsLegales)} />
        <Route path="cgv" element={withGuards(CGV)} />
        <Route path="cookies" element={withGuards(Cookies)} />

        {/* B - ESPACE CLIENT */}
        <Route path="dashboard-client" element={withGuards(DashboardClient, { requiresAuth: true })} />

        {/* C - ESPACE ADMIN */}
        <Route path="dashboard-admin" element={withGuards(DashboardAdmin, { requiresAuth: true, roles: ["admin"] })} />
        <Route path="admin" element={<Navigate to="/dashboard-admin" replace />} />

        {/* 404 */}
        <Route path="404" element={withGuards(NotFound)} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}
