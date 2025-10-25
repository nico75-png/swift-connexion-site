import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AdminDataProvider } from "@/providers/AdminDataProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { AppRoutes } from "./routes/AppRoutes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AdminDataProvider>
        <AuthProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL || "/"}>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </AdminDataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
