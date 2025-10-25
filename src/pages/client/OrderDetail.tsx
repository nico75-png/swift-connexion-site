import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Download,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  RotateCcw,
  Info,
} from "lucide-react";

import OrderCancelModal from "@/components/dashboard/OrderCancelModal";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Timeline from "@/components/dashboard/Timeline";
import Topbar from "@/components/dashboard/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ClientOrder } from "@/lib/reorder";
import {
  ensureOrdersDataShape,
  formatCurrencyEUR,
  formatDateTime,
} from "@/lib/reorder";
import {
  getOrderStatusDisplayLabel,
  isOrderCancelableStatus,
  isOrderCancellationForbiddenStatus,
  resolveOrderStatus,
} from "@/lib/orders/status";
import { ORDER_CANCELLATION_REASON_LABELS } from "@/lib/orders/cancellation";
import { useAuth } from "@/lib/stores/auth.store";

const ClientOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<ClientOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const loadOrder = useCallback(() => {
    if (!id) {
      setError("Identifiant de commande manquant");
      setOrder(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const orders = ensureOrdersDataShape();
      const found = orders.find((entry) => entry.id === id);
      if (!found) {
        setError("Cette commande est introuvable.");
        setOrder(null);
      } else {
        setError(null);
        setOrder(found);
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Erreur lors du chargement.";
      setError(message);
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === "oc_orders") {
        loadOrder();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [loadOrder]);

  const normalizedStatus = order ? resolveOrderStatus(order.status) : "";
  const statusLabel = order ? getOrderStatusDisplayLabel(order.status) : "—";

  const canCancel = order ? isOrderCancelableStatus(order.status) : false;
  const cancellationForbidden = order ? isOrderCancellationForbiddenStatus(order.status) : false;
  const shouldRenderCancelButton = order ? canCancel || cancellationForbidden : false;

  const cancelTooltip = useMemo(() => {
    if (!order) return "";
    if (cancellationForbidden) {
      return normalizedStatus === "LIVREE"
        ? "Impossible d’annuler une commande livrée."
        : "Cette commande est déjà annulée.";
    }
    return "Annuler la commande";
  }, [cancellationForbidden, normalizedStatus, order]);

  const timelineSteps = useMemo(() => {
    if (!order) return [];

    const baseFromHistory = order.history?.map((entry, index, array) => {
      const isLast = index === array.length - 1;
      const status = isLast
        ? normalizedStatus === "ANNULEE"
          ? "cancelled"
          : normalizedStatus === "LIVREE"
            ? "done"
            : "current"
        : "done";
      return {
        label: entry.label,
        time: formatDateTime(entry.at) ?? entry.at,
        status,
      } as const;
    });

    if (baseFromHistory && baseFromHistory.length > 0) {
      return baseFromHistory;
    }

    const steps: Array<{
      label: string;
      time: string;
      status: "done" | "current" | "pending" | "cancelled";
    }> = [
      {
        label: "Commande créée",
        time: formatDateTime(order.createdAt) ?? "—",
        status: "done",
      },
      {
        label: "Affectation chauffeur",
        time: formatDateTime(order.pickupAt) ?? "—",
        status: "pending",
      },
      {
        label: "Enlèvement",
        time: formatDateTime(order.pickupAt) ?? "—",
        status: "pending",
      },
      {
        label: "Livraison",
        time: formatDateTime(order.dropoffEta) ?? "—",
        status: "pending",
      },
    ];

    switch (normalizedStatus) {
      case "EN_ATTENTE_AFFECTATION":
        steps[0].status = "current";
        break;
      case "EN_ATTENTE_ENLEVEMENT":
        steps[0].status = "done";
        steps[1].status = "current";
        break;
      case "EN_COURS":
        steps[0].status = "done";
        steps[1].status = "done";
        steps[2].status = "current";
        break;
      case "LIVREE":
        steps.forEach((step) => {
          step.status = "done";
        });
        break;
      case "ANNULEE":
        steps[0].status = "done";
        steps[1].status = "pending";
        steps[2].status = "pending";
        steps[3].status = "pending";
        break;
      default:
        break;
    }

    if (normalizedStatus === "ANNULEE") {
      steps.push({
        label: "Commande annulée",
        time: formatDateTime(order.cancellation?.at) ?? "—",
        status: "cancelled",
      });
    }

    return steps;
  }, [normalizedStatus, order]);

  const driverName = order?.driver?.name ?? "Non assigné";
  const driverPhone = order?.driver?.phone ?? "";
  const canContactDriver = driverPhone && normalizedStatus === "EN_COURS";

  const fromAddress = order?.from?.address ?? "Adresse non renseignée";
  const toAddress = order?.to?.address ?? "Adresse non renseignée";

  const priceBreakdown = order?.price?.breakdown;
  const priceTotal = order?.price?.total ?? 0;

  const handleCancelSuccess = useCallback(
    (updated: ClientOrder) => {
      setOrder(updated);
      setIsCancelModalOpen(false);
    },
    [],
  );

  const openCancelModal = () => setIsCancelModalOpen(true);
  const closeCancelModal = () => setIsCancelModalOpen(false);

  const showLoader = isLoading;

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={<Topbar userName={currentUser?.name ?? undefined} />}
      showProfileReminder
    >
      {showLoader ? (
        <div className="flex h-full min-h-[400px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error || !order ? (
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Commande</h1>
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {error ?? "Impossible d’afficher cette commande."}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Commande {order.id}</h1>
              <p className="text-muted-foreground">
                {order.type} • {formatDateTime(order.createdAt) ?? "Date inconnue"}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {shouldRenderCancelButton && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          variant="destructive"
                          onClick={openCancelModal}
                          disabled={!canCancel}
                        >
                          Annuler la commande
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{cancelTooltip}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Recommander
              </Button>
              <Button variant="cta">
                <Download className="mr-2 h-4 w-4" />
                Télécharger PDF
              </Button>
            </div>
          </div>

          <Card className="border-2 border-info/20">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Statut actuel</p>
                  <Badge className="border-info/20 bg-info/10 text-info text-base px-4 py-2">
                    {statusLabel}
                  </Badge>
                </div>
                <div className="text-left sm:text-right">
                  <p className="mb-1 text-sm text-muted-foreground">Livraison estimée</p>
                  <p className="text-xl font-bold">
                    {formatDateTime(order.dropoffEta) ?? "—"}
                  </p>
                </div>
              </div>
              {order.cancellation && (
                <p className="mt-4 text-sm text-destructive">
                  Annulée le {formatDateTime(order.cancellation.at) ?? "—"} —
                  {" "}
                  {ORDER_CANCELLATION_REASON_LABELS[order.cancellation.reason]}
                  {order.cancellation.comment ? ` : ${order.cancellation.comment}` : ""}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Timeline de livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline steps={timelineSteps} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Itinéraire</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex h-80 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="mx-auto mb-2 h-12 w-12" />
                    <p className="text-sm">Carte interactive</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="mb-1 text-sm font-medium text-success">📍 Départ</p>
                    <p className="text-sm text-muted-foreground">{fromAddress}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-primary">📍 Arrivée</p>
                    <p className="text-sm text-muted-foreground">{toAddress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Chauffeur assigné</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Nom</p>
                  <p className="font-medium">{driverName}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Identifiant chauffeur</p>
                  <p className="font-medium">{order.driver?.id ?? order.driverId ?? "—"}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Téléphone</p>
                  {driverPhone ? (
                    <a
                      href={`tel:${driverPhone}`}
                      className="flex items-center gap-2 font-medium text-primary hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      {driverPhone}
                    </a>
                  ) : (
                    <span className="font-medium text-muted-foreground">Non disponible</span>
                  )}
                </div>
                <Button variant="cta" className="w-full" asChild disabled={!canContactDriver}>
                  <Link to={canContactDriver ? `/messages?driver=${order.driver?.id}` : "#"}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contacter le chauffeur
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Détail tarifaire</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert className="border-primary/40 bg-primary/5">
                  <AlertDescription className="flex items-start gap-2 text-sm text-primary">
                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <span>
                      💡 Le tarif est calculé au kilomètre entre l&apos;adresse d&apos;enlèvement et l&apos;adresse de livraison. Le poids et
                      le volume servent uniquement à préparer la logistique.
                    </span>
                  </AlertDescription>
                </Alert>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarif de base</span>
                  <span className="font-medium">
                    {priceBreakdown?.base !== undefined
                      ? formatCurrencyEUR(priceBreakdown.base)
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="font-medium">
                    {priceBreakdown?.km !== undefined
                      ? formatCurrencyEUR(priceBreakdown.km)
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Option express</span>
                  <span className="font-medium">{priceBreakdown?.express ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Option fragile</span>
                  <span className="font-medium">{priceBreakdown?.fragile ?? "—"}</span>
                </div>
                <div className="flex justify-between border-t pt-3 text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">{formatCurrencyEUR(priceTotal)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Bon de commande (PDF)
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <Download className="mr-2 h-4 w-4" />
                Preuve de livraison (disponible après livraison)
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {order && (
        <OrderCancelModal
          orderId={order.id}
          open={isCancelModalOpen}
          onClose={closeCancelModal}
          onSuccess={handleCancelSuccess}
        />
      )}
    </DashboardLayout>
  );
};

export default ClientOrderDetail;
