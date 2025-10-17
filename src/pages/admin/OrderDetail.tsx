import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, MapPin, Phone, User, Edit, UserMinus, UserPlus } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import Timeline from "@/components/dashboard/Timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AssignDriverModal from "@/components/admin/orders/AssignDriverModal";
import {
  canUnassignDriver,
  getAssignButtonLabel,
  isAssignmentReadOnly,
} from "@/components/admin/orders/orderAssignmentUtils";
import { useActivityLogStore, useDriversStore, useNotificationsStore, useOrdersStore } from "@/providers/AdminDataProvider";
import { driverStatusBadgeClass, driverStatusLabel } from "@/components/admin/orders/driverUtils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getOrderStatusDisplayLabel, resolveOrderStatus } from "@/lib/orders/status";

const formatDateTime = (iso: string) => format(new Date(iso), "dd MMM yyyy · HH'h'mm", { locale: fr });

const AdminOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { ready, orders, assignments, unassignDriver } = useOrdersStore();
  const { drivers } = useDriversStore();
  const { activityLog } = useActivityLogStore();
  const { notifications } = useNotificationsStore();

  const order = useMemo(() => orders.find((item) => item.id === id) ?? null, [orders, id]);
  const driver = useMemo(() => (order?.driverId ? drivers.find((item) => item.id === order.driverId) ?? null : null), [drivers, order]);
  const assignment = useMemo(() => (order ? assignments.find((item) => item.orderId === order.id) ?? null : null), [assignments, order]);

  const normalizedStatus = useMemo(() => (order ? resolveOrderStatus(order.status) : ""), [order]);
  const statusDisplay = useMemo(() => getOrderStatusDisplayLabel(order?.status ?? currentStatus), [order?.status, currentStatus]);

  const [currentStatus, setCurrentStatus] = useState(order?.status ?? "En attente");
  const [notes, setNotes] = useState(order?.instructions ?? "");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (order?.status) {
      setCurrentStatus(order.status);
    }
  }, [order?.status]);

  useEffect(() => {
    setNotes(order?.instructions ?? "");
  }, [order?.instructions]);

  const topbarNotifications = useMemo(
    () =>
      notifications.map((notification) => ({
        id: notification.id,
        message: notification.message,
        time: new Date(notification.createdAt).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        read: notification.read,
      })),
    [notifications],
  );

  const timelineSteps = useMemo(() => {
    if (!order) {
      return [
        { label: "En attente", time: "", status: "pending" as const },
        { label: "En attente d’enlèvement", time: "", status: "pending" as const },
        { label: "En cours", time: "", status: "pending" as const },
        { label: "Livré", time: "", status: "pending" as const },
      ];
    }

    const stepsConfig = [
      { code: "EN_ATTENTE_AFFECTATION", label: "En attente" },
      { code: "EN_ATTENTE_ENLEVEMENT", label: "En attente d’enlèvement" },
      { code: "EN_COURS", label: "En cours" },
      { code: "LIVREE", label: "Livré" },
    ] as const;

    const normalized = resolveOrderStatus(order.status);
    const currentIndex = stepsConfig.findIndex((step) => step.code === normalized);
    const scheduleStart = order.schedule?.start ? formatDateTime(order.schedule.start) : "-";
    const pickupTime = assignment ? formatDateTime(assignment.start) : "";
    const deliveryTime = assignment ? formatDateTime(assignment.end) : "";

    const steps = stepsConfig.map((step, index) => {
      let status: "done" | "current" | "pending" | "cancelled" = "pending";
      if (normalized === "ANNULEE") {
        status = index === 0 ? "done" : "cancelled";
      } else if (currentIndex === -1) {
        status = "pending";
      } else if (index < currentIndex) {
        status = "done";
      } else if (index === currentIndex) {
        status = "current";
      }

      let time = "";
      switch (step.code) {
        case "EN_ATTENTE_AFFECTATION":
          time = scheduleStart;
          break;
        case "EN_ATTENTE_ENLEVEMENT":
          time = pickupTime || scheduleStart;
          break;
        case "EN_COURS":
          time = pickupTime || scheduleStart;
          break;
        case "LIVREE":
          time = deliveryTime;
          break;
        default:
          time = "";
      }

      return { label: step.label, time, status };
    });

    if (normalized === "ANNULEE") {
      steps.push({
        label: "Annulée",
        time: order.schedule?.end ? formatDateTime(order.schedule.end) : "-",
        status: "cancelled" as const,
      });
    }

    return steps;
  }, [order, assignment]);

  const orderActivities = useMemo(
    () =>
      order
        ? activityLog
            .filter((entry) => entry.orderId === order.id)
            .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        : [],
    [activityLog, order],
  );

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    toast({
      title: "Statut mis à jour",
      description: `La commande est maintenant "${newStatus}"`,
    });
  };

  const handleSaveNotes = () => {
    toast({
      title: "Notes enregistrées",
      description: "Les notes internes ont été mises à jour.",
    });
  };

  const handleDownloadPDF = (type: string) => {
    toast({
      title: "Téléchargement",
      description: `${type} en cours de génération...`,
    });
  };

  const handleUnassignDriver = () => {
    if (!order || !canUnassignDriver(order.status)) {
      return;
    }
    const result = unassignDriver(order.id);
    if (!result.success) {
      toast({
        title: "Impossible de retirer le chauffeur",
        description: result.error ?? "Veuillez réessayer.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Chauffeur retiré",
      description: `Le chauffeur a été retiré de la commande ${order.id}.`,
    });
  };

  const driverVehicle = driver ? `${driver.vehicle.type} · ${driver.vehicle.capacity}${driver.vehicle.registration ? ` · ${driver.vehicle.registration}` : ""}` : "";

  if (!ready && !order) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} topbar={<Topbar title="Commande" notifications={topbarNotifications} />}>
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Chargement des informations de la commande...
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} topbar={<Topbar title="Commande introuvable" notifications={topbarNotifications} />}>
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-center text-destructive">
          La commande demandée est introuvable.
        </div>
      </DashboardLayout>
    );
  }

  const assignButtonLabel = getAssignButtonLabel(order.status, Boolean(driver));
  const assignModalLabel = assignButtonLabel
    ? driver
      ? assignButtonLabel
      : assignButtonLabel === "Affecter"
        ? "Affecter un chauffeur"
        : assignButtonLabel
    : null;
  const assignmentReadOnly = isAssignmentReadOnly(order.status);
  const allowUnassign = canUnassignDriver(order.status);

  return (
    <DashboardLayout sidebar={<AdminSidebar />} topbar={<Topbar title={`Commande ${order.id}`} notifications={topbarNotifications} />}>
      {/* Header avec retour */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/admin/commandes">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux commandes
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleDownloadPDF("Bon de commande")}>
            <Download className="mr-2 h-4 w-4" />
            Bon de commande
          </Button>
          <Button variant="outline" onClick={() => handleDownloadPDF("Preuve de livraison")}>
            <Download className="mr-2 h-4 w-4" />
            Preuve livraison
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-6 lg:col-span-2">
          {/* Détails de la commande */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Détails de la commande</CardTitle>
                <Badge variant="outline" className="px-4 py-1 text-base">
                  {statusDisplay}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Client</p>
                  <p className="font-semibold">{order.client}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Date & Heure</p>
                  <p className="font-semibold">
                    {order.schedule?.start ? formatDateTime(order.schedule.start) : "-"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Type de transport</p>
                  <Badge variant="outline">{order.type}</Badge>
                </div>
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Montant</p>
                  <p className="text-2xl font-bold text-primary">
                    {order.amount ? `${order.amount.toFixed(2)}€` : "-"}
                  </p>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex gap-3">
                  <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Départ</p>
                    <p className="font-medium">{order.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-success" />
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Arrivée</p>
                    <p className="font-medium">{order.dropoffAddress}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 border-t pt-4 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Poids</p>
                  <p className="font-medium">{order.weight}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Volume</p>
                  <p className="font-medium">{order.volumeRequirement}</p>
                </div>
              </div>

              {order.instructions && (
                <div className="border-t pt-4">
                  <p className="mb-1 text-sm text-muted-foreground">Instructions</p>
                  <p className="font-medium">{order.instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Timeline de la commande</CardTitle>
                <Select value={currentStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En attente">En attente</SelectItem>
                    <SelectItem value="Enlevé">Enlevé</SelectItem>
                    <SelectItem value="En cours">En cours</SelectItem>
                    <SelectItem value="Livré">Livré</SelectItem>
                    <SelectItem value="Annulé">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Timeline steps={timelineSteps} />
            </CardContent>
          </Card>

          {/* Journal d'activité */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle>Journal d'activité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderActivities.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucune activité pour le moment.</p>
                )}
                {orderActivities.map((log) => {
                  const actor = drivers.find((item) => item.id === log.driverId)?.name || log.by;
                  return (
                    <div key={log.id} className="flex gap-4 border-b pb-4 last:border-0">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Edit className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <p className="font-semibold">{log.message || log.type}</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(log.at)}</p>
                        </div>
                        {log.driverId && (
                          <p className="text-sm text-muted-foreground">Chauffeur : {drivers.find((item) => item.id === log.driverId)?.name}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Par {actor}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Chauffeur affecté */}
          <Card className="border-none shadow-soft" id="order-driver-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Chauffeur affecté
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {driver ? (
                <>
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Nom</p>
                    <p className="font-semibold">{driver.name}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Téléphone</p>
                    <a href={`tel:${driver.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-primary hover:underline">
                      <Phone className="h-4 w-4" />
                      {driver.phone}
                    </a>
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Véhicule</p>
                    <p className="font-medium">{driverVehicle}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={cn("text-xs", driverStatusBadgeClass[driver.status])}>
                      {driverStatusLabel[driver.status]}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Prochain créneau : {driver.nextFreeSlot}
                    </Badge>
                  </div>
                  {!assignmentReadOnly && (
                    <div className="flex flex-col gap-2 pt-2">
                      {assignModalLabel && (
                        <Button id="btn-assign-driver" onClick={() => setIsModalOpen(true)}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          {assignModalLabel}
                        </Button>
                      )}
                      {allowUnassign && (
                        <Button variant="outline" onClick={handleUnassignDriver}>
                          <UserMinus className="mr-2 h-4 w-4" />
                          Retirer le chauffeur
                        </Button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                assignModalLabel && !assignmentReadOnly ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Aucun chauffeur n'est encore affecté à cette commande.
                    </p>
                    <Button id="btn-assign-driver" onClick={() => setIsModalOpen(true)} className="w-full">
                      <UserPlus className="mr-2 h-4 w-4" />
                      {assignModalLabel}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Aucun chauffeur ne peut être affecté sur ce statut.
                  </p>
                )
              )}
            </CardContent>
          </Card>

          {/* Notes internes */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle>Notes internes (admin)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Ajoutez des notes sur cette commande..."
                rows={6}
              />
              <Button onClick={handleSaveNotes} className="w-full">
                Enregistrer les notes
              </Button>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Dupliquer la commande
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Contacter le client
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                Annuler la commande
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AssignDriverModal
        orderId={order.id}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        excludedDriverIds={order.excludedDriverIds}
        isImmediateAssign={normalizedStatus === "EN_ATTENTE_AFFECTATION" && !order.driverId}
      />
    </DashboardLayout>
  );
};

export default AdminOrderDetail;
