import { useEffect, useMemo, useState } from "react";

import CreateOrderForm from "@/components/orders/CreateOrderForm";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/stores/auth.store";
import { previewNextOrderNumber } from "@/lib/orderSequence";

const CreateOrder = () => {
  const { currentUser, currentClient } = useAuth();
  const [orderPreview, setOrderPreview] = useState<string | null>(null);

  useEffect(() => {
    try {
      const preview = previewNextOrderNumber();
      if (preview) {
        setOrderPreview(preview);
      }
    } catch (error) {
      console.warn("Impossible de prévisualiser le numéro de commande", error);
    }
  }, []);

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
          <h1 className="text-3xl font-bold mb-2">Créer une commande</h1>
          <p className="text-muted-foreground">
            Vous créez une commande pour {customer.company}. Vos informations client sont préremplies.
          </p>
        </div>

        <Card className="relative">
          <div
            className="absolute top-6 right-6 text-right text-sm text-muted-foreground select-none pointer-events-none"
            aria-hidden="true"
          >
            <p className="uppercase tracking-wide text-xs">N° de commande</p>
            <p className="text-base font-semibold text-foreground">#{orderPreview ?? "—"}</p>
          </div>
          <CardHeader className="pr-36">
            <CardTitle>Informations de livraison</CardTitle>
            <CardDescription>
              Indiquez les détails du transport. Les champs marqués d&apos;une * sont obligatoires.
            </CardDescription>
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
