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
        <div>
          <h1 className="text-3xl font-bold mb-2">Créer une commande pour un client</h1>
          <p className="text-muted-foreground">
            Vous créez une commande pour {customer.company}. Vos informations client sont préremplies.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Informations de livraison</CardTitle>
                <CardDescription>
                  Indiquez les détails du transport. Les champs marqués d&apos;une * sont obligatoires.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="shrink-0 text-xs font-medium">
                N° —
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <CreateOrderForm customer={customer} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateOrder;
