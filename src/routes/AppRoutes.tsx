import { lazy, Suspense, type LazyExoticComponent, type ReactNode } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ErrorBoundary, type FallbackProps } from "./ErrorBoundary";

import { useAuth, type UserRole } from "@/lib/stores/auth.store";
import { useAuthProfile } from "@/providers/AuthProvider";

const Home = lazy(() => import("@/pages/Home"));
const Expertises = lazy(() => import("@/pages/Expertises"));
const Tarifs = lazy(() => import("@/pages/Tarifs"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Contact = lazy(() => import("@/pages/Contact"));
const Inscription = lazy(() => import("@/pages/Inscription"));
const Connexion = lazy(() => import("@/pages/Connexion"));
const CommandeSansCompte = lazy(() => import("@/pages/CommandeSansCompte"));
const OnboardingExpertise = lazy(() => import("@/pages/onboarding/Expertise"));
const OnboardingDeliveryObjects = lazy(() => import("@/pages/onboarding/DeliveryObjects"));
const OnboardingAddress = lazy(() => import("@/pages/onboarding/Address"));
const ClientDashboard = lazy(() => import("@/pages/client/Dashboard"));
const ClientOrders = lazy(() => import("@/pages/client/Orders"));
const ClientOrderDetail = lazy(() => import("@/pages/client/OrderDetail"));
const CreateOrder = lazy(() => import("@/pages/client/CreateOrder"));
const ClientInvoices = lazy(() => import("@/pages/client/Invoices"));
const ClientInvoicePayment = lazy(() => import("@/pages/client/InvoicePayment"));
const ClientExpenses = lazy(() => import("@/pages/client/Expenses"));
const ClientMessages = lazy(() => import("@/pages/client/Messages"));
const ClientProfile = lazy(() => import("@/pages/client/Profile"));
const ClientPreferences = lazy(() => import("@/pages/client/Preferences"));
const ClientTracking = lazy(() => import("@/pages/client/Tracking"));
const Admin = lazy(() => import("@/pages/Admin"));
const AdminOrders = lazy(() => import("@/pages/admin/Orders"));
const AdminOrderDetail = lazy(() => import("@/pages/admin/OrderDetail"));
const AdminClients = lazy(() => import("@/pages/admin/Clients"));
const AdminClientProfile = lazy(() => import("@/pages/admin/ClientProfile"));
const AdminDrivers = lazy(() => import("@/pages/admin/Drivers"));
const AdminInvoices = lazy(() => import("@/pages/admin/Invoices"));
const AdminStats = lazy(() => import("@/pages/admin/Stats"));
const AdminMessages = lazy(() => import("@/pages/admin/Messages"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));
const MentionsLegales = lazy(() => import("@/pages/MentionsLegales"));
const CGV = lazy(() => import("@/pages/CGV"));
const Cookies = lazy(() => import("@/pages/Cookies"));
const NotFound = lazy(() => import("@/pages/NotFound"));

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
    return <Navigate to="/auth" replace />;
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
        <Route index element={withGuards(Home)} />
        <Route path="expertises" element={withGuards(Expertises)} />
        <Route path="expertises/:slug" element={withGuards(Expertises)} />
        <Route path="tarifs" element={withGuards(Tarifs)} />
        <Route path="faq" element={withGuards(FAQ)} />
        <Route path="contact" element={withGuards(Contact)} />
        <Route path="support" element={withGuards(Contact)} />
        <Route path="aide" element={withGuards(FAQ)} />
        <Route path="inscription" element={withGuards(Inscription)} />
        <Route path="auth" element={withGuards(Connexion)} />
        <Route path="commande-sans-compte" element={withGuards(CommandeSansCompte)} />
        <Route path="onboarding">
          <Route path="expertise" element={withGuards(OnboardingExpertise, { requiresAuth: true })} />
          <Route path="delivery-objects" element={withGuards(OnboardingDeliveryObjects, { requiresAuth: true })} />
          <Route path="address" element={withGuards(OnboardingAddress, { requiresAuth: true })} />
        </Route>
        <Route path="espace-client" element={withGuards(ClientDashboard, { requiresAuth: true })} />
        <Route path="dashboard" element={withGuards(ClientDashboard, { requiresAuth: true })} />
        <Route path="espace-client/commandes" element={withGuards(ClientOrders, { requiresAuth: true })} />
        <Route path="commandes" element={withGuards(ClientOrders, { requiresAuth: true })} />
        <Route path="espace-client/creer-commande" element={withGuards(CreateOrder, { requiresAuth: true })} />
        <Route path="commandes/nouvelle" element={withGuards(CreateOrder, { requiresAuth: true })} />
        <Route path="espace-client/commandes/:id" element={withGuards(ClientOrderDetail, { requiresAuth: true })} />
        <Route path="commandes/:id" element={withGuards(ClientOrderDetail, { requiresAuth: true })} />
        <Route path="suivi" element={withGuards(ClientTracking, { requiresAuth: true })} />
        <Route path="suivi/:orderId" element={withGuards(ClientTracking, { requiresAuth: true })} />
        <Route path="espace-client/factures" element={withGuards(ClientInvoices, { requiresAuth: true })} />
        <Route path="factures" element={withGuards(ClientInvoices, { requiresAuth: true })} />
        <Route
          path="espace-client/factures/:invoiceId/paiement"
          element={withGuards(ClientInvoicePayment, { requiresAuth: true })}
        />
        <Route path="factures/:invoiceId" element={withGuards(ClientInvoicePayment, { requiresAuth: true })} />
        <Route path="espace-client/depenses" element={withGuards(ClientExpenses, { requiresAuth: true })} />
        <Route path="espace-client/messages" element={withGuards(ClientMessages, { requiresAuth: true })} />
        <Route path="messages" element={withGuards(ClientMessages, { requiresAuth: true })} />
        <Route path="messages/nouveau" element={withGuards(ClientMessages, { requiresAuth: true })} />
        <Route path="espace-client/messages/:threadId" element={withGuards(ClientMessages, { requiresAuth: true })} />
        <Route path="messages/:threadId" element={withGuards(ClientMessages, { requiresAuth: true })} />
        <Route path="espace-client/profil" element={withGuards(ClientProfile, { requiresAuth: true })} />
        <Route path="espace-client/preferences" element={withGuards(ClientPreferences, { requiresAuth: true })} />
        <Route path="parametres" element={withGuards(ClientPreferences, { requiresAuth: true })} />
        <Route path="admin" element={withGuards(Admin, { requiresAuth: true, roles: ["admin"] })} />
        <Route path="admin/commandes" element={withGuards(AdminOrders, { requiresAuth: true, roles: ["admin"] })} />
        <Route path="admin/commandes/:id" element={withGuards(AdminOrderDetail, { requiresAuth: true, roles: ["admin"] })} />
        <Route path="admin/clients" element={withGuards(AdminClients, { requiresAuth: true, roles: ["admin"] })} />
        <Route path="admin/clients/:id" element={withGuards(AdminClientProfile, { requiresAuth: true, roles: ["admin"] })} />
        <Route path="admin/chauffeurs" element={withGuards(AdminDrivers, { requiresAuth: true, roles: ["admin"] })} />
        <Route path="admin/factures" element={withGuards(AdminInvoices, { requiresAuth: true, roles: ["admin"] })} />
        <Route path="admin/statistiques" element={withGuards(AdminStats, { requiresAuth: true, roles: ["admin"] })} />
        <Route path="admin/messages" element={withGuards(AdminMessages, { requiresAuth: true, roles: ["admin"] })} />
        <Route path="admin/parametres" element={withGuards(AdminSettings, { requiresAuth: true, roles: ["admin"] })} />
        <Route path="mentions-legales" element={withGuards(MentionsLegales)} />
        <Route path="cgv" element={withGuards(CGV)} />
        <Route path="cookies" element={withGuards(Cookies)} />
        <Route path="client/espace" element={<Navigate to="/espace-client" replace />} />
        <Route path="connexion" element={<Navigate to="/auth" replace />} />
        <Route path="404" element={withGuards(NotFound)} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}
