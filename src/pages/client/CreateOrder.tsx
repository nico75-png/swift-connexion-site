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
      siret: "000 000 000 00000",
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
          <CardHeader className="border-b bg-muted/40 py-6">
            <CardTitle className="text-2xl font-semibold">Créer une commande</CardTitle>
            <CardDescription>
              Renseignez les informations de votre transport. Les champs marqués d&apos;un astérisque sont obligatoires.
            </CardDescription>
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
