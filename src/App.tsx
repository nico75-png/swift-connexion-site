import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import ClientExpenses from "./pages/client/Expenses";
import ClientMessages from "./pages/client/Messages";
import ClientProfile from "./pages/client/Profile";
import ClientPreferences from "./pages/client/Preferences";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/expertises" element={<Expertises />} />
          <Route path="/tarifs" element={<Tarifs />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/commande-sans-compte" element={<CommandeSansCompte />} />
          <Route path="/espace-client" element={<ClientDashboard />} />
          <Route path="/espace-client/commandes" element={<ClientOrders />} />
          <Route path="/espace-client/commandes/:id" element={<ClientOrderDetail />} />
          <Route path="/espace-client/creer-commande" element={<CreateOrder />} />
          <Route path="/espace-client/factures" element={<ClientInvoices />} />
          <Route path="/espace-client/depenses" element={<ClientExpenses />} />
          <Route path="/espace-client/messages" element={<ClientMessages />} />
          <Route path="/espace-client/profil" element={<ClientProfile />} />
          <Route path="/espace-client/preferences" element={<ClientPreferences />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/cgv" element={<CGV />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
