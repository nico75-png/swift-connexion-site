import { useMemo } from "react";

import CreateOrderForm from "@/components/orders/CreateOrderForm";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/stores/auth.store";

const CreateOrder = () => {
  const { currentUser, currentClient } = useAuth();

  const customer = useMemo(() => {
    if (currentClient) {
      return currentClient;
    }

    return {
      id: currentUser?.id ?? "client-temp",
      contactName: currentUser?.name ?? "Client connecté",
      company: currentUser?.name ?? "Client",
      defaultPickupAddress: "",
      defaultDeliveryAddress: "",
    };
  }, [currentClient, currentUser]);

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={<Topbar userName={currentUser?.name} />}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader className="gap-3 border-b bg-muted/40 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-semibold">Créer une commande</CardTitle>
                <CardDescription>
                  Renseignez les informations de votre transport. Les champs marqués d&apos;une * sont obligatoires.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="shrink-0 rounded-full px-3 py-1 text-xs font-medium">
                N° —
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 py-6">
            <CreateOrderForm customer={customer} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateOrder;
