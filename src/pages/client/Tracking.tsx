import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MapPin, Navigation, RefreshCcw, Truck } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/stores/auth.store";
import {
  type ClientOrderListItem,
  listOrdersByClient,
} from "@/lib/stores/clientOrders.store";
import { cn } from "@/lib/utils";

const STATUS_VARIANTS: Record<string, string> = {
  en_cours: "bg-primary/10 text-primary border-primary/20",
  livre: "bg-success/10 text-success border-success/20",
  collecte: "bg-warning/10 text-warning border-warning/20",
};

const formatStatus = (status: string) => {
  const normalized = status.trim().toLowerCase();
  if (normalized.includes("livr")) return "Livrée";
  if (normalized.includes("collect")) return "Collecte";
  if (normalized.includes("annul")) return "Annulée";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const resolveVariant = (status: string) => {
  const normalized = status.trim().toLowerCase();
  if (normalized.includes("livr")) return STATUS_VARIANTS.livre;
  if (normalized.includes("collect")) return STATUS_VARIANTS.collecte;
  return STATUS_VARIANTS.en_cours;
};

const ClientTracking = () => {
  const { orderId } = useParams<{ orderId?: string }>();
  const navigate = useNavigate();
  const { currentClient, currentUser } = useAuth();
  const [orders, setOrders] = useState<ClientOrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      try {
        setIsLoading(true);
        if (!currentClient?.id) {
          setOrders([]);
          return;
        }

        const list = await listOrdersByClient(currentClient.id);
        if (!mounted) return;
        setOrders(list);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      mounted = false;
    };
  }, [currentClient?.id]);

  const selectedOrder = useMemo(() => {
    if (!orderId) return null;
    return orders.find((order) => order.id === orderId || order.orderNumber === orderId) ?? null;
  }, [orderId, orders]);

  useEffect(() => {
    if (!isLoading && orderId && !selectedOrder && orders.length > 0) {
      navigate("/suivi", { replace: true });
    }
  }, [isLoading, orderId, selectedOrder, orders.length, navigate]);

  const handleRefresh = () => {
    navigate(0);
  };

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={<Topbar userName={currentUser?.name ?? undefined} />}
      showProfileReminder
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold">Suivi en temps réel</h1>
              <p className="text-muted-foreground">
                Consultez l'état de vos livraisons et ouvrez la cartographie GPS dédiée.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleRefresh} className="gap-2">
                <RefreshCcw className="h-4 w-4" /> Actualiser
              </Button>
              <Button asChild variant="cta">
                <Link to="/commandes">Voir toutes les commandes</Link>
              </Button>
            </div>
          </header>

          <Card className="border-none shadow-soft">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                Carte de suivi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col gap-3 p-6">
                  <Skeleton className="h-48 w-full rounded-2xl" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : selectedOrder ? (
                <div className="space-y-5 p-6">
                  <div className="h-64 w-full overflow-hidden rounded-2xl border border-dashed border-primary/30 bg-primary/5">
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-primary">
                      <Navigation className="h-10 w-10 animate-pulse" />
                      <p className="text-sm font-medium">
                        Carte GPS simulée pour la commande {selectedOrder.orderNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Intégrez ici votre composant de cartographie en production.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border/50 bg-muted/40 p-4">
                      <p className="text-xs uppercase text-muted-foreground">Collecte</p>
                      <div className="mt-2 flex items-start gap-2 text-sm">
                        <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{selectedOrder.pickupAddress?.line ?? "Adresse non renseignée"}</span>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border/50 bg-muted/40 p-4">
                      <p className="text-xs uppercase text-muted-foreground">Livraison</p>
                      <div className="mt-2 flex items-start gap-2 text-sm">
                        <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{selectedOrder.deliveryAddress?.line ?? "Adresse non renseignée"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className={cn("border", resolveVariant(selectedOrder.status))}>
                      {formatStatus(selectedOrder.status)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Course #{selectedOrder.orderNumber} – montant estimé {selectedOrder.amountTTC ?? "—"}€
                    </span>
                  </div>

                  <Button asChild variant="outline" className="gap-2">
                    <Link to={`/commandes/${selectedOrder.id}`}>
                      <Truck className="h-4 w-4" /> Détails de la commande
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 p-6 text-center">
                  <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium">Aucune commande sélectionnée</p>
                  <p className="text-sm text-muted-foreground">
                    Choisissez une commande dans la liste ci-contre pour afficher son suivi GPS.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <aside className="rounded-2xl border border-border/40 bg-card shadow-soft">
          <div className="border-b border-border/40 p-5">
            <h2 className="text-lg font-semibold">Commandes récentes</h2>
            <p className="text-sm text-muted-foreground">
              Sélectionnez une course pour ouvrir la vue GPS correspondante.
            </p>
          </div>
          <ScrollArea className="max-h-[540px]">
            <div className="space-y-2 p-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2 rounded-xl border border-dashed border-border/40 p-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))
              ) : orders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/40 p-6 text-center text-sm text-muted-foreground">
                  Aucune commande disponible pour le moment.
                </div>
              ) : (
                orders.map((order) => {
                  const isActive = order.id === orderId || order.orderNumber === orderId;
                  return (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => navigate(`/suivi/${order.id}`)}
                      className={cn(
                        "w-full rounded-xl border p-4 text-left transition-all",
                        isActive
                          ? "border-primary bg-primary/10 shadow-medium"
                          : "border-border/40 bg-card hover:border-primary/30 hover:bg-muted/40"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">#{order.orderNumber}</span>
                        <Badge className={cn("border", resolveVariant(order.status))}>
                          {formatStatus(order.status)}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {order.pickupAddress?.city ?? "Adresse"} → {order.deliveryAddress?.city ?? "Destination"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Montant estimé {order.amountTTC ?? "—"}€ – {order.transportLabel}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </aside>
      </div>
    </DashboardLayout>
  );
};

export default ClientTracking;
