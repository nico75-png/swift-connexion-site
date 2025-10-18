import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Download,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  RefreshCcw,
  Truck,
  User,
  UserPlus,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import Timeline from "@/components/dashboard/Timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import QuickActions from "@/components/admin/orders/QuickActions";
import AssignDriverModal from "@/components/admin/orders/AssignDriverModal";
import OrderDuplicateModal from "@/components/admin/orders/OrderDuplicateModal";
import OrderCancelModal from "@/components/orders/OrderCancelModal";
import ContactClientModal from "@/components/admin/orders/ContactClientModal";
import {
  assignDriver,
  logAdministrativeAction,
  buildTimeline,
  canCancelOrder,
  downloadDocument,
  formatPhoneDisplay,
  getOrderDetail,
  isAssignmentAllowed,
  type AdminOrderDetail,
} from "@/services/orders.service";
import { useNotificationsStore } from "@/providers/AdminDataProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Order as LegacyOrder } from "@/lib/stores/driversOrders.store";
import { useAuth } from "@/lib/stores/auth.store";

const statusBadgeClass: Record<AdminOrderDetail["status"], string> = {
  EN_ATTENTE_AFFECTATION: "border-warning/60 text-warning bg-warning/10",
  EN_ATTENTE_ENLEVEMENT: "border-warning/60 text-warning bg-warning/10",
  ENLEVE: "border-secondary/60 text-secondary bg-secondary/10",
  EN_COURS: "border-info/60 text-info bg-info/10",
  LIVRE: "border-success/60 text-success bg-success/10",
  ANNULEE: "border-destructive/60 text-destructive bg-destructive/10",
  INCIDENT: "border-amber-500/60 text-amber-500 bg-amber-500/10",
};

const formatAddress = (value: string) => value.replace(/,\s*/g, "\n");

const mapStatusToLegacy = (status: AdminOrderDetail["status"]): LegacyOrder["status"] => {
  switch (status) {
    case "EN_ATTENTE_AFFECTATION":
    case "EN_ATTENTE_ENLEVEMENT":
      return "En attente";
    case "ENLEVE":
      return "Enlevé";
    case "EN_COURS":
    case "INCIDENT":
      return "En cours";
    case "LIVRE":
      return "Livré";
    case "ANNULEE":
      return "Annulé";
    default:
      return "En attente";
  }
};

const toLegacyOrder = (order: AdminOrderDetail): LegacyOrder => ({
  id: order.orderNumber,
  client: order.customer.companyName,
  type: order.transportType,
  status: mapStatusToLegacy(order.status),
  amount: order.amountTtc,
  schedule: { start: order.pickupAt, end: order.pickupAt },
  pickupAddress: order.pickupAddress,
  dropoffAddress: order.deliveryAddress,
  zoneRequirement: "INTRA_PARIS",
  volumeRequirement: `${order.volume} m³`,
  weight: `${order.weight} kg`,
  instructions: order.driverInstructions,
  driverId: order.assignedDriver?.id ?? null,
  driverAssignedAt: order.assignedDriver ? order.pickupAt : null,
  sector: "B2B",
});

const AdminOrderDetailPage = () => {
  const { id: routeOrderId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { notifications } = useNotificationsStore();
  const { currentUser } = useAuth();

  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const orderId = routeOrderId ?? "";

  const refreshOrder = useCallback(async () => {
    if (!orderId) {
      return;
    }
    setIsRefreshing(true);
    try {
      const detail = await getOrderDetail(orderId);
      setOrder(detail);
      setError(detail ? null : "Cette commande est introuvable ou a été archivée.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Impossible de charger la commande.";
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    setIsLoading(true);
    refreshOrder();
  }, [refreshOrder]);

  const topbarNotifications = useMemo(
    () =>
      notifications.map((notification) => ({
        id: notification.id,
        message: notification.message,
        time: new Date(notification.createdAt).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: notification.read,
      })),
    [notifications],
  );

  const timelineSteps = useMemo(() => (order ? buildTimeline(order) : []), [order]);

  const legacyOrder = useMemo(() => (order ? toLegacyOrder(order) : null), [order]);

  const adminName = currentUser?.name ?? "Administrateur";
  const canManageAssignment = currentUser?.role === "admin" || currentUser?.role === "dispatch";

  const registerAction = useCallback(
    async (label: string, meta?: Record<string, unknown>) => {
      if (!order) {
        return;
      }
      const updated = await logAdministrativeAction(order.id, { label, meta });
      setOrder(updated);
    },
    [order],
  );

  const handleAssignDriver = async (driverId: string) => {
    if (!order) return;
    const previousDriver = order.assignedDriver;
    try {
      const assignedDetail = await assignDriver(order.id, driverId, { actor: adminName });
      const timestamp = new Date();
      let finalDetail = assignedDetail;

      try {
        finalDetail = await logAdministrativeAction(assignedDetail.id, {
          label: `Chauffeur changé par ${adminName} le ${timestamp.toLocaleString("fr-FR")}`,
          author: adminName,
          meta: {
            action: previousDriver ? "driver-reassigned" : "driver-assigned",
            previousDriverId: previousDriver?.id ?? null,
            previousDriverName: previousDriver?.name ?? null,
            newDriverId: assignedDetail.assignedDriver?.id ?? driverId,
            newDriverName: assignedDetail.assignedDriver?.name ?? null,
            actorId: currentUser?.id ?? null,
            occurredAt: timestamp.toISOString(),
          },
        });
      } catch (loggingError) {
        const loggingMessage =
          loggingError instanceof Error
            ? loggingError.message
            : "Impossible d'enregistrer le changement dans le journal.";
        toast({
          title: "Journal d'activité indisponible",
          description: loggingMessage,
          variant: "destructive",
        });
      }

      setOrder(finalDetail);
      toast({
        title: "✅ Chauffeur affecté avec succès à cette commande.",
        description: finalDetail.assignedDriver
          ? `${finalDetail.assignedDriver.name} est désormais affecté(e) à ${finalDetail.orderNumber}.`
          : `${finalDetail.orderNumber} a été mis à jour.`,
      });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Impossible d'affecter le chauffeur.";
      toast({
        title: "Affectation impossible",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDownloadDocument = async (type: "purchase" | "proof") => {
    if (!order) return;
    const url = type === "purchase" ? order.documents?.purchaseOrderUrl : order.documents?.proofOfDeliveryUrl;
    if (!url) {
      toast({
        title: "Document indisponible",
        description: "Ce document n'est pas encore disponible.",
        variant: "destructive",
      });
      return;
    }
    await downloadDocument(url);
  };

  const handleOpenContact = () => {
    if (!order) return;
    setIsContactModalOpen(true);
  };

  const handleSendEmail = useCallback(
    async ({ subject, message }: { subject: string; message: string }) => {
      toast({
        title: "Email envoyé",
        description: "Le client a été contacté par email.",
      });

      try {
        await registerAction("Contact client · Email envoyé", {
          channel: "email",
          subject,
          message,
          to: order?.customer.contact.email,
        });
      } catch (caught) {
        const errorMessage =
          caught instanceof Error
            ? caught.message
            : "Impossible d'enregistrer l'action dans le journal.";
        toast({
          title: "Journal d'activité indisponible",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [order, registerAction, toast],
  );

  const handleCallClient = useCallback(async () => {
    toast({
      title: "Appel lancé",
      description: "Le client est contacté par téléphone.",
    });

    try {
      await registerAction("Contact client · Appel initié", {
        channel: "phone",
        phone: order?.customer.contact.phone,
      });
    } catch (caught) {
      const errorMessage =
        caught instanceof Error
          ? caught.message
          : "Impossible d'enregistrer l'action dans le journal.";
      toast({
        title: "Journal d'activité indisponible",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [order, registerAction, toast]);

  const handleBackToList = () => {
    navigate("/admin/commandes");
  };

  if (isLoading) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} topbar={<Topbar title="Commande" notifications={topbarNotifications} />}> 
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !order) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} topbar={<Topbar title="Commande" notifications={topbarNotifications} />}>
        <Card className="border-destructive/40 bg-destructive/10">
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle>Commande introuvable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error ?? "La commande demandée n'existe pas."}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleBackToList}>
              Retour aux commandes
            </Button>
          </CardFooter>
        </Card>
      </DashboardLayout>
    );
  }

  const isAssignmentEnabled = isAssignmentAllowed(order.status);
  const assignmentRequirements = useMemo(
    () => ({
      weight: order.weight,
      volume: order.volume,
      excludedDriverIds: order.excludedDriverIds ?? [],
    }),
    [order.weight, order.volume, order.excludedDriverIds],
  );
  const assignmentDisabledMessage = useMemo(() => {
    if (isAssignmentEnabled) {
      return null;
    }
    switch (order.status) {
      case "LIVRE":
        return "La commande est livrée : le changement de chauffeur n'est plus possible.";
      case "ANNULEE":
        return "La commande est annulée : l'affectation ne peut plus être modifiée.";
      case "INCIDENT":
        return "Commande en incident : utilisez le suivi incident pour mettre à jour le chauffeur.";
      default:
        return "Ce statut ne permet plus de modifier le chauffeur.";
    }
  }, [isAssignmentEnabled, order.status]);
  const canDownloadProof = Boolean(order.documents?.proofOfDeliveryUrl && order.status === "LIVRE");
  const canDownloadPurchase = Boolean(order.documents?.purchaseOrderUrl);

  return (
    <DashboardLayout
      sidebar={<AdminSidebar />}
      topbar={<Topbar title={`Commande ${order.orderNumber}`} notifications={topbarNotifications} />}
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBackToList}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-semibold leading-tight">{order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground">Créée le {new Date(order.createdAt).toLocaleDateString("fr-FR")}</p>
          </div>
          <Badge className={`ml-2 text-sm ${statusBadgeClass[order.status]}`}>{order.statusLabel}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshOrder} disabled={isRefreshing}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDownloadDocument("purchase")} disabled={!canDownloadPurchase}>
            <Download className="mr-2 h-4 w-4" /> Bon de commande
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDownloadDocument("proof")} disabled={!canDownloadProof}>
            <Download className="mr-2 h-4 w-4" /> Preuve de livraison
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="mr-2 h-4 w-4" /> Plus
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsDuplicateModalOpen(true)}>Dupliquer</DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenContact}>Contacter le client</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsCancelModalOpen(true)}
                disabled={!canCancelOrder(order.status)}
                className="text-destructive focus:text-destructive"
              >
                Annuler la commande
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Détails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Montant TTC</p>
                  <p className="text-xl font-semibold">{order.formattedAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Enlèvement prévu</p>
                  <p className="font-semibold">{order.formattedPickupAt}</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Client</p>
                      <p className="font-semibold">{order.customer.companyName}</p>
                      <p className="text-sm text-muted-foreground">SIRET {order.customer.siret}</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="font-medium">{order.customer.contact.name}</p>
                        <a href={`tel:${order.customer.contact.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                          <Phone className="h-4 w-4" />
                          {formatPhoneDisplay(order.customer.contact.phone)}
                        </a>
                        <a href={`mailto:${order.customer.contact.email}`} className="flex items-center gap-2 text-primary hover:underline">
                          <Mail className="h-4 w-4" />
                          {order.customer.contact.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Départ</p>
                      <p className="whitespace-pre-line font-medium">{formatAddress(order.pickupAddress)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-success" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Arrivée</p>
                      <p className="whitespace-pre-line font-medium">{formatAddress(order.deliveryAddress)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Type</p>
                  <p className="font-medium">{order.transportType}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Poids</p>
                  <p className="font-medium">{order.weight} kg</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Volume</p>
                  <p className="font-medium">{order.volume} m³</p>
                </div>
              </div>
              {order.driverInstructions && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Instructions chauffeur</p>
                  <p className="mt-1 rounded-md bg-muted/50 p-3 text-sm">{order.driverInstructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {timelineSteps.length > 0 ? <Timeline steps={timelineSteps} /> : <p className="text-sm text-muted-foreground">Aucun événement.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Journal d'activité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.activityLog.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucune activité enregistrée pour le moment.</p>
              )}
              {order.activityLog.map((item) => (
                <div key={item.id} className="rounded-lg border border-border/60 bg-card/80 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      {item.meta?.note && <p className="text-sm text-muted-foreground">{item.meta.note as string}</p>}
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{new Date(item.occurredAt).toLocaleString("fr-FR")}</p>
                      <p>par {item.actor}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Chauffeur affecté
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.assignedDriver ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Nom</p>
                    <p className="font-semibold">{order.assignedDriver.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <a
                      href={`tel:${order.assignedDriver.phone}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Phone className="h-4 w-4" /> {formatPhoneDisplay(order.assignedDriver.phone)}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Véhicule</p>
                    <p className="font-medium">{order.assignedDriver.vehicle}</p>
                  </div>
                  <Badge variant="outline">{order.assignedDriver.availability}</Badge>
                  {canManageAssignment ? (
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={() => setIsAssignModalOpen(true)}
                        disabled={!isAssignmentEnabled}
                      >
                        <UserPlus className="mr-2 h-4 w-4" /> Changer de chauffeur
                      </Button>
                      {!isAssignmentEnabled && assignmentDisabledMessage && (
                        <p className="text-xs text-muted-foreground">{assignmentDisabledMessage}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs italic text-muted-foreground">
                      Contactez un administrateur pour modifier le chauffeur.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Aucun chauffeur n'est encore affecté.</p>
                  {canManageAssignment ? (
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={() => setIsAssignModalOpen(true)}
                        disabled={!isAssignmentEnabled}
                      >
                        <UserPlus className="mr-2 h-4 w-4" /> Affecter un chauffeur
                      </Button>
                      {!isAssignmentEnabled && assignmentDisabledMessage && (
                        <p className="text-xs text-muted-foreground">{assignmentDisabledMessage}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs italic text-muted-foreground">
                      Vous n'avez pas les droits pour affecter un chauffeur.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActions
                order={order}
                onDuplicate={() => setIsDuplicateModalOpen(true)}
                onContactClient={handleOpenContact}
                onCancelOrder={() => setIsCancelModalOpen(true)}
                isCancelDisabled={!canCancelOrder(order.status)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Informations complémentaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>Dernière mise à jour : {new Date(order.updatedAt).toLocaleString("fr-FR")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {order && (
        <AssignDriverModal
          orderId={order.id}
          open={isAssignModalOpen}
          onOpenChange={setIsAssignModalOpen}
          onAssigned={(driverId) => {
            setIsAssignModalOpen(false);
            handleAssignDriver(driverId);
          }}
          currentDriverId={order.assignedDriver?.id ?? null}
          allowAssignment={isAssignmentEnabled}
          requirements={assignmentRequirements}
        />
      )}

      {legacyOrder && (
        <OrderDuplicateModal
          sourceOrder={legacyOrder}
          open={isDuplicateModalOpen}
          onOpenChange={setIsDuplicateModalOpen}
          onCreated={(createdOrder) => {
            setIsDuplicateModalOpen(false);
            toast({
              title: "Commande dupliquée",
              description: "Commande dupliquée avec succès.",
            });
            registerAction("Commande dupliquée · nouvelle commande créée", {
              action: "duplicate",
              newOrderId: createdOrder.id,
              sourceOrderId: order.id,
              sourceOrderNumber: order.orderNumber,
            }).catch((caught) => {
              const errorMessage =
                caught instanceof Error
                  ? caught.message
                  : "Impossible d'enregistrer l'action dans le journal.";
              toast({
                title: "Journal d'activité indisponible",
                description: errorMessage,
                variant: "destructive",
              });
            });
          }}
        />
      )}

      {order && (
        <ContactClientModal
          open={isContactModalOpen}
          onOpenChange={setIsContactModalOpen}
          contact={{
            name: order.customer.contact.name,
            email: order.customer.contact.email,
            phone: order.customer.contact.phone,
            formattedPhone: formatPhoneDisplay(order.customer.contact.phone),
          }}
          onSendEmail={handleSendEmail}
          onCallClient={handleCallClient}
        />
      )}

      <OrderCancelModal
        orderId={order.id}
        orderNumber={order.orderNumber}
        open={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onSuccess={() => {
          setIsCancelModalOpen(false);
          refreshOrder();
        }}
      />
    </DashboardLayout>
  );
};

export default AdminOrderDetailPage;
