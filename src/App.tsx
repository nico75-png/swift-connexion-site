import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminDataProvider } from "@/providers/AdminDataProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import Home from "./pages/Home";
import Expertises from "./pages/Expertises";
import Tarifs from "./pages/Tarifs";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Inscription from "./pages/Inscription";
import Connexion from "./pages/Connexion";
import CommandeSansCompte from "./pages/CommandeSansCompte";
import EspaceClient from "./pages/EspaceClient";
import Admin from "./pages/Admin";
import MentionsLegales from "./pages/MentionsLegales";
import CGV from "./pages/CGV";
import Cookies from "./pages/Cookies";
import NotFound from "./pages/NotFound";
import ClientDashboard from "./pages/client/Dashboard";
import ClientOrders from "./pages/client/Orders";
import ClientOrderDetail from "./pages/client/OrderDetail";
import CreateOrder from "./pages/client/CreateOrder";
import ClientInvoices from "./pages/client/Invoices";
import ClientInvoicePayment from "./pages/client/InvoicePayment";
import ClientExpenses from "./pages/client/Expenses";
import ClientMessages from "./pages/client/Messages";
import ClientProfile from "./pages/client/Profile";
import ClientPreferences from "./pages/client/Preferences";
import AdminOrders from "./pages/admin/Orders";
import AdminOrderDetail from "./pages/admin/OrderDetail";
import AdminClients from "./pages/admin/Clients";
import AdminClientProfile from "./pages/admin/ClientProfile";
import AdminDrivers from "./pages/admin/Drivers";
import AdminInvoices from "./pages/admin/Invoices";
import AdminStats from "./pages/admin/Stats";
import AdminMessages from "./pages/admin/Messages";
import AdminSettings from "./pages/admin/Settings";
import OnboardingExpertise from "./pages/onboarding/Expertise";
import OnboardingDeliveryObjects from "./pages/onboarding/DeliveryObjects";
import OnboardingAddress from "./pages/onboarding/Address";
import ClientTracking from "./pages/client/Tracking";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AdminDataProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/expertises" element={<Expertises />} />
              <Route path="/expertises/:slug" element={<Expertises />} />
              <Route path="/tarifs" element={<Tarifs />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/support" element={<Contact />} />
              <Route path="/aide" element={<FAQ />} />
              <Route path="/inscription" element={<Inscription />} />
              <Route path="/auth" element={<Connexion />} />
              <Route path="/connexion" element={<Navigate to="/auth" replace />} />
              <Route path="/commande-sans-compte" element={<CommandeSansCompte />} />
              <Route path="/onboarding/expertise" element={<OnboardingExpertise />} />
              <Route path="/onboarding/delivery-objects" element={<OnboardingDeliveryObjects />} />
              <Route path="/onboarding/address" element={<OnboardingAddress />} />
              <Route path="/espace-client" element={<ClientDashboard />} />
              <Route path="/dashboard" element={<ClientDashboard />} />
              <Route path="/espace-client/commandes" element={<ClientOrders />} />
              <Route path="/commandes" element={<ClientOrders />} />
              <Route path="/espace-client/creer-commande" element={<CreateOrder />} />
              <Route path="/commandes/nouvelle" element={<CreateOrder />} />
              <Route path="/espace-client/commandes/:id" element={<ClientOrderDetail />} />
              <Route path="/commandes/:id" element={<ClientOrderDetail />} />
              <Route path="/suivi" element={<ClientTracking />} />
              <Route path="/suivi/:orderId" element={<ClientTracking />} />
              <Route path="/espace-client/factures" element={<ClientInvoices />} />
              <Route path="/factures" element={<ClientInvoices />} />
              <Route path="/espace-client/factures/:invoiceId/paiement" element={<ClientInvoicePayment />} />
              <Route path="/factures/:invoiceId" element={<ClientInvoicePayment />} />
              <Route path="/espace-client/depenses" element={<ClientExpenses />} />
              <Route path="/espace-client/messages" element={<ClientMessages />} />
              <Route path="/messages" element={<ClientMessages />} />
              <Route path="/messages/nouveau" element={<ClientMessages />} />
              <Route path="/espace-client/messages/:threadId" element={<ClientMessages />} />
              <Route path="/messages/:threadId" element={<ClientMessages />} />
              <Route path="/espace-client/profil" element={<ClientProfile />} />
              <Route path="/espace-client/preferences" element={<ClientPreferences />} />
              <Route path="/parametres" element={<ClientPreferences />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/commandes" element={<AdminOrders />} />
              <Route path="/admin/commandes/:id" element={<AdminOrderDetail />} />
              <Route path="/admin/clients" element={<AdminClients />} />
              <Route path="/admin/clients/:id" element={<AdminClientProfile />} />
              <Route path="/admin/chauffeurs" element={<AdminDrivers />} />
              <Route path="/admin/factures" element={<AdminInvoices />} />
              <Route path="/admin/statistiques" element={<AdminStats />} />
              <Route path="/admin/messages" element={<AdminMessages />} />
              <Route path="/admin/parametres" element={<AdminSettings />} />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route path="/cgv" element={<CGV />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/client/espace" element={<Navigate to="/espace-client" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AdminDataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
