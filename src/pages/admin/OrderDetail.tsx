import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Download, Edit, MapPin, Phone, User, Clock } from "lucide-react";

import AssignDriverModal from "@/components/admin/AssignDriverModal";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Timeline from "@/components/dashboard/Timeline";
import Topbar from "@/components/dashboard/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  useActivity,
  useAssignments,
  useDrivers,
  useNotifications,
  useOrder,
  useScheduledAssignments,
} from "@/hooks/useMockData";
import {
  cancelScheduledAssignment,
  formatDateTime,
  removeDriverFromOrder,
  type ActivityEntry,
  type ScheduledAssignment,
} from "@/lib/mockData";

const formatMaybe = (value?: string) => (value ? formatDateTime(value) : "—");

/**
 * Page admin - Détail d'une commande
 * Timeline modifiable, affectation chauffeur, notes internes, historique
 */
const AdminOrderDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const order = useOrder(id);
  const drivers = useDrivers();
  const activities = useActivity();
  const assignments = useAssignments();
  const scheduledAssignments = useScheduledAssignments();
  const notifications = useNotifications("admin");

  const [notes, setNotes] = useState("Client préfère les livraisons en matinée");
  const [currentStatus, setCurrentStatus] = useState(order?.status ?? "En attente");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"now" | "later">("now");
  const [modalScheduleId, setModalScheduleId] = useState<string | null>(null);

  const orderStatus = order?.status;

  useEffect(() => {
    if (orderStatus) {
      setCurrentStatus(orderStatus);
    }
  }, [orderStatus]);

  const pendingSchedule = useMemo(
    () =>
      scheduledAssignments.find(
        (schedule) => schedule.orderId === order?.id && schedule.status === "SCHEDULED",
      ) ?? null,
    [scheduledAssignments, order?.id],
  );

  const executedSchedule = useMemo(
    () =>
      scheduledAssignments
        .filter((schedule) => schedule.orderId === order?.id && schedule.status === "EXECUTED")
        .sort(
          (a, b) =>
            new Date(b.executedAt ?? b.scheduledAt).getTime() -
            new Date(a.executedAt ?? a.scheduledAt).getTime(),
        )[0] ?? null,
    [scheduledAssignments, order?.id],
  );

  const failedSchedule = useMemo(
    () =>
      scheduledAssignments.find(
        (schedule) => schedule.orderId === order?.id && schedule.status === "FAILED",
      ) ?? null,
    [scheduledAssignments, order?.id],
  );

  const orderActivities = useMemo(
    () => activities.filter((activity) => activity.orderId === order?.id),
    [activities, order?.id],
  );

  const driver = useMemo(
    () => drivers.find((item) => item.id === order?.driverId) ?? null,
    [drivers, order?.driverId],
  );

  const orderDriverAssignment = useMemo(
    () => assignments.find((assignment) => assignment.orderId === order?.id) ?? null,
    [assignments, order?.id],
  );

  const mappedNotifications = useMemo(
    () =>
      notifications.map((notification) => ({
        id: notification.id,
        message: notification.message,
        time: formatDateTime(notification.createdAt),
        read: notification.read,
      })),
    [notifications],
  );

  const timelineSteps = useMemo(() => {
    if (!order) {
      return [];
    }

    const steps: Array<{ label: string; time: string; status: "done" | "current" | "pending" | "cancelled" }> = [];
    steps.push({ label: "Commande créée", time: formatDateTime(order.date), status: "done" });

    if (pendingSchedule) {
      steps.push({
        label: "Affectation planifiée",
        time: formatDateTime(pendingSchedule.scheduledAt),
        status: "current",
      });
    }

    if (executedSchedule || order.driverId) {
      steps.push({
        label: "Affectation exécutée",
        time: formatMaybe(executedSchedule?.executedAt ?? executedSchedule?.scheduledAt ?? order.driverAssignedAt),
        status: "done",
      });
    }

    if (failedSchedule) {
      steps.push({
        label: "Échec affectation planifiée",
        time: formatDateTime(failedSchedule.createdAt),
        status: "cancelled",
      });
    }

    const statusSequence = ["En attente", "Enlevé", "En cours", "Livré"];
    const currentIndex = statusSequence.findIndex((status) => status === currentStatus);
    statusSequence.forEach((status, index) => {
      const statusState =
        currentStatus === "Annulé"
          ? "cancelled"
          : index < currentIndex
          ? "done"
          : index === currentIndex
          ? "current"
          : "pending";
      steps.push({
        label: status,
        time: index === 0 ? formatDateTime(order.date) : "—",
        status: statusState,
      });
    });

    return steps;
  }, [order, pendingSchedule, executedSchedule, failedSchedule, currentStatus]);

  const handleOpenModal = (mode: "now" | "later", schedule?: ScheduledAssignment | null) => {
    if (!order) return;
    setModalMode(mode);
    setModalScheduleId(schedule?.id ?? null);
    setModalOpen(true);
  };

  const handleCancelScheduled = () => {
    if (!pendingSchedule) return;
    cancelScheduledAssignment(pendingSchedule.id);
    toast({
      title: "Planification annulée",
      description: `L'affectation planifiée pour la commande ${pendingSchedule.orderId} a été annulée.`,
    });
  };

  const handleRemoveDriver = () => {
    if (!order?.id) return;
    removeDriverFromOrder(order.id);
    toast({
      title: "Chauffeur retiré",
      description: `Le chauffeur a été retiré de la commande ${order.id}.`,
    });
  };

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

  if (!order) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} topbar={<Topbar title="Commande introuvable" />}>
        <div className="p-10 text-center text-muted-foreground">
          <p>Cette commande n'existe pas ou plus.</p>
          <Link to="/admin/commandes">
            <Button variant="outline" className="mt-4">
              Retour aux commandes
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebar={<AdminSidebar />}
      topbar={<Topbar title={`Commande ${order.id}`} notifications={mappedNotifications} />}
    >
      <AssignDriverModal
        order={order}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialMode={modalMode}
        scheduledAssignment={
          modalScheduleId
            ? scheduledAssignments.find((schedule) => schedule.id === modalScheduleId) ?? null
            : pendingSchedule
        }
      />

      {/* Header avec retour */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin/commandes">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux commandes
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleDownloadPDF("Bon de commande")}>
            <Download className="h-4 w-4 mr-2" />
            Bon de commande
          </Button>
          <Button variant="outline" onClick={() => handleDownloadPDF("Preuve de livraison")}>
            <Download className="h-4 w-4 mr-2" />
            Preuve livraison
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Détails de la commande */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Détails de la commande</CardTitle>
                <Badge variant="outline" className="text-base px-4 py-1">
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Client</p>
                  <p className="font-semibold">{order.client}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date & Heure</p>
                  <p className="font-semibold">{formatDateTime(order.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Type de transport</p>
                  <Badge variant="outline">{order.type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Montant</p>
                  <p className="text-2xl font-bold text-primary">{order.amount}€</p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-4">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Départ</p>
                    <p className="font-medium">{order.pickup}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-success flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Arrivée</p>
                    <p className="font-medium">{order.delivery}</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Poids</p>
                  <p className="font-medium">{order.weight}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Volume</p>
                  <p className="font-medium">{order.volume}</p>
                </div>
              </div>

              {order.instructions && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Instructions</p>
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
                {orderActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune activité enregistrée pour le moment.</p>
                ) : (
                  orderActivities
                    .slice()
                    .reverse()
                    .map((log) => {
                      const { label, details } = mapActivity(log);
                      return (
                        <div key={log.id} className="flex gap-4 pb-4 border-b last:border-0">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Edit className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold">{label}</p>
                              <p className="text-xs text-muted-foreground">
                                {log.at ? formatDateTime(log.at) : log.scheduledAt ? formatDateTime(log.scheduledAt) : ""}
                              </p>
                            </div>
                            {details && <p className="text-sm text-muted-foreground mb-1">{details}</p>}
                            <p className="text-xs text-muted-foreground">Par {log.by}</p>
                          </div>
                        </div>
                      );
                    })
                )}
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
                Chauffeur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {driver ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Nom</p>
                    <p className="font-semibold">{driver.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Téléphone</p>
                    <a href={`tel:${driver.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                      <Phone className="h-4 w-4" />
                      {driver.phone}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Véhicule</p>
                    <p className="font-medium">{driver.vehicle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Zone</p>
                    <Badge variant="outline">{driver.zone}</Badge>
                  </div>
                  {orderDriverAssignment && (
                    <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                      Affecté le {formatDateTime(orderDriverAssignment.createdAt)}
                    </div>
                  )}
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button className="flex-1" variant="outline" onClick={() => handleOpenModal("now")}>
                      <Edit className="h-4 w-4 mr-2" />
                      Remplacer
                    </Button>
                    <Button className="flex-1" variant="ghost" onClick={handleRemoveDriver}>
                      Retirer
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>Aucun chauffeur actuellement affecté.</p>
                  <Button
                    className="w-full"
                    onClick={() => handleOpenModal(pendingSchedule ? "later" : "now", pendingSchedule)}
                  >
                    Affecter un chauffeur
                  </Button>
                </div>
              )}

              {pendingSchedule && (
                <div className="rounded-lg border border-info/20 bg-info/5 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-info" />
                    <p className="font-semibold text-info">Affectation planifiée</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Prévue le {formatDateTime(pendingSchedule.scheduledAt)}</p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button className="flex-1" variant="outline" onClick={() => handleOpenModal("later", pendingSchedule)}>
                      Modifier
                    </Button>
                    <Button className="flex-1" variant="ghost" onClick={handleCancelScheduled}>
                      Annuler
                    </Button>
                  </div>
                </div>
              )}

              {failedSchedule && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="font-semibold">Échec de l'affectation planifiée</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Chauffeur indisponible le {formatDateTime(failedSchedule.scheduledAt)}.
                  </p>
                  <Button className="w-full" variant="outline" onClick={() => handleOpenModal("later")}>
                    Replanifier
                  </Button>
                </div>
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
    </DashboardLayout>
  );
};

const mapActivity = (activity: ActivityEntry) => {
  switch (activity.type) {
    case "ASSIGN_NOW":
      return {
        label: "Affectation immédiate",
        details: activity.driverId ? `Chauffeur ${activity.driverId} assigné` : undefined,
      };
    case "ASSIGN_SCHEDULED":
      return {
        label: "Affectation planifiée",
        details: activity.scheduledAt ? `Exécution prévue le ${formatDateTime(activity.scheduledAt)}` : undefined,
      };
    case "EXECUTION":
      return {
        label: "Affectation exécutée",
        details: activity.driverId ? `Chauffeur ${activity.driverId} confirmé` : undefined,
      };
    case "FAILED":
      return {
        label: "Échec de l'affectation",
        details: activity.payload?.reason ? String(activity.payload.reason) : undefined,
      };
    case "CANCELLED":
      return {
        label: "Planification annulée",
        details: activity.driverId ? `Chauffeur ${activity.driverId}` : undefined,
      };
    case "ASSIGN_REMOVED":
      return {
        label: "Chauffeur retiré",
        details: undefined,
      };
    default:
      return { label: activity.type, details: undefined };
  }
};

export default AdminOrderDetail;
