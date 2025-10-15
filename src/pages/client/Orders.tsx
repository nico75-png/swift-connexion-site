import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import CreateOrderButton from "@/components/dashboard/CreateOrderButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Eye, RotateCcw, MessageSquare, Search } from "lucide-react";
import Chat from "@/components/dashboard/Chat";
import {
  type Assignment,
  type Driver,
  type Order,
  getAssignments,
  getDrivers,
  getOrders,
} from "@/lib/stores/driversOrders.store";
import {
  appendMessageToThread,
  ensureThread,
  getMessageThreads,
  getMessagesByThread,
  markThreadAsRead,
  setThreadStatus,
  type MessageThread,
  type MessageThreadStatus,
  type ThreadMessage,
} from "@/lib/stores/messages.store";

const CURRENT_CLIENT_ID = "CLIENT-001";

const normalizeStatus = (status: string) =>
  status
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, "_");

const READ_ONLY_STATUSES = new Set(["LIVRE", "LIVREE"]);
const CANCELLED_STATUSES = new Set(["ANNULE", "ANNULEE", "CANCELLED"]);

const statusBadgeClasses: Record<string, string> = {
  EN_COURS: "bg-info/10 text-info border border-info/20",
  ENLEVE: "bg-secondary/10 text-secondary border border-secondary/20",
  AFFECTE: "bg-info/10 text-info border border-info/20",
  EN_ATTENTE: "bg-warning/10 text-warning border border-warning/20",
  LIVRE: "bg-success/10 text-success border border-success/20",
  LIVREE: "bg-success/10 text-success border border-success/20",
  ANNULE: "bg-destructive/10 text-destructive border border-destructive/20",
  ANNULEE: "bg-destructive/10 text-destructive border border-destructive/20",
};

const getStatusBadgeClass = (status: string) =>
  statusBadgeClasses[normalizeStatus(status)] ?? "bg-muted text-muted-foreground border border-border";

const formatOrderDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("fr-FR").format(date);
};

const formatTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(date);
};

const getStatusMessage = (normalizedStatus: string, threadStatus: MessageThreadStatus) => {
  if (CANCELLED_STATUSES.has(normalizedStatus)) {
    return "Commande annulée : conversation clôturée.";
  }

  if (READ_ONLY_STATUSES.has(normalizedStatus) || threadStatus === "LOCKED") {
    return "Commande livrée : discussion en lecture seule.";
  }

  if (normalizedStatus === "ENLEVE") {
    return "Le chauffeur a récupéré la commande.";
  }

  if (normalizedStatus === "EN_COURS") {
    return "Livraison en cours : vous pouvez échanger avec le chauffeur.";
  }

  if (normalizedStatus === "AFFECTE") {
    return "Chauffeur affecté, en attente de prise en charge.";
  }

  return undefined;
};

const sanitizePhoneLink = (phone?: string, normalized?: string | null) => {
  if (normalized && normalized.trim().length > 0) {
    return `tel:${normalized}`;
  }
  if (!phone) {
    return null;
  }
  return `tel:${phone.replace(/\s+/g, "")}`;
};

type ChatModalState =
  | {
      type: "chat";
      order: Order;
      driver: Driver;
      thread: MessageThread;
      messages: ThreadMessage[];
      readOnly: boolean;
      statusMessage?: string;
    }
  | {
      type: "no-driver";
      order: Order;
      reason: "no-driver" | "cancelled";
    };

const ClientOrders = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<Order[]>(() => (typeof window === "undefined" ? [] : getOrders()));
  const [drivers, setDrivers] = useState<Driver[]>(() => (typeof window === "undefined" ? [] : getDrivers()));
  const [assignments, setAssignments] = useState<Assignment[]>(() => (typeof window === "undefined" ? [] : getAssignments()));
  const [chatModal, setChatModal] = useState<ChatModalState | null>(null);

  const refreshActiveThread = useCallback(() => {
    setChatModal((current) => {
      if (!current || current.type !== "chat") {
        return current;
      }

      const threads = getMessageThreads();
      const nextThread = threads.find((thread) => thread.id === current.thread.id);
      if (!nextThread) {
        return null;
      }

      const nextMessages = getMessagesByThread(nextThread.id);
      const latestOrder = getOrders().find((item) => item.id === current.order.id) ?? current.order;
      const normalizedStatus = normalizeStatus(latestOrder.status);
      const shouldLock =
        READ_ONLY_STATUSES.has(normalizedStatus) ||
        CANCELLED_STATUSES.has(normalizedStatus) ||
        nextThread.status === "LOCKED";
      const statusMessage = getStatusMessage(normalizedStatus, nextThread.status);

      return {
        ...current,
        order: latestOrder,
        thread: nextThread,
        messages: nextMessages,
        readOnly: shouldLock,
        statusMessage,
      };
    });
  }, []);

  const hydrateData = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    setOrders(getOrders());
    setDrivers(getDrivers());
    setAssignments(getAssignments());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    hydrateData();

    const storageKeys = new Set([
      "oc_orders",
      "oc_drivers",
      "oc_assignments",
      "oc_messages_threads",
      "oc_messages_entries",
    ]);

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || !storageKeys.has(event.key)) {
        return;
      }

      hydrateData();

      if (event.key === "oc_messages_threads" || event.key === "oc_messages_entries") {
        refreshActiveThread();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [hydrateData, refreshActiveThread]);

  useEffect(() => {
    orders.forEach((order) => {
      const normalized = normalizeStatus(order.status);
      if (READ_ONLY_STATUSES.has(normalized) || CANCELLED_STATUSES.has(normalized)) {
        const threads = getMessageThreads().filter((thread) => thread.orderId === order.id);
        threads.forEach((thread) => {
          setThreadStatus(thread.id, "LOCKED");
        });
      }
    });
  }, [orders]);

  useEffect(() => {
    refreshActiveThread();
  }, [orders, assignments, refreshActiveThread]);

  const driverById = useMemo(() => {
    const map = new Map<string, Driver>();
    drivers.forEach((driver) => {
      map.set(driver.id, driver);
    });
    return map;
  }, [drivers]);

  const latestAssignments = useMemo(() => {
    const sorted = [...assignments]
      .filter((assignment) => !assignment.endedAt)
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

    const map = new Map<string, Assignment>();
    sorted.forEach((assignment) => {
      if (!map.has(assignment.orderId)) {
        map.set(assignment.orderId, assignment);
      }
    });
    return map;
  }, [assignments]);

  const decoratedOrders = useMemo(() => {
    return orders.map((order) => {
      const assignment = latestAssignments.get(order.id);
      const driverId = order.driverId ?? assignment?.driverId ?? null;
      const driver = driverId ? driverById.get(driverId) ?? null : null;
      const driverName = driver?.fullname ?? driver?.name ?? "En attente";
      const driverPhone = driver?.phone ?? "";
      const phoneLink = sanitizePhoneLink(driver?.phone, driver?.phoneNormalized);
      const normalizedStatus = normalizeStatus(order.status);

      return {
        order,
        driver,
        driverName,
        driverPhone,
        phoneLink,
        formattedDate: formatOrderDate(order.schedule.start),
        normalizedStatus,
      };
    });
  }, [orders, driverById, latestAssignments]);

  const filteredOrders = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();

    return decoratedOrders.filter(({ order, driverName }) => {
      const matchesStatus =
        statusFilter === "all" || order.status.toLowerCase().includes(statusFilter.toLowerCase());

      const matchesSearch =
        searchValue.length === 0 ||
        order.id.toLowerCase().includes(searchValue) ||
        order.type.toLowerCase().includes(searchValue) ||
        driverName.toLowerCase().includes(searchValue);

      return matchesStatus && matchesSearch;
    });
  }, [decoratedOrders, searchTerm, statusFilter]);

  const handleContactDriver = useCallback(
    (order: Order) => {
      const assignment = latestAssignments.get(order.id);
      const driverId = order.driverId ?? assignment?.driverId ?? null;
      const normalizedStatus = normalizeStatus(order.status);
      const driver = driverId ? driverById.get(driverId) ?? null : null;

      if (!driver) {
        const reason = CANCELLED_STATUSES.has(normalizedStatus) ? "cancelled" : "no-driver";
        setChatModal({ type: "no-driver", order, reason });
        return;
      }

      const baseThread = ensureThread({
        orderId: order.id,
        driverId: driver.id,
        clientId: CURRENT_CLIENT_ID,
      });

      const shouldLock = READ_ONLY_STATUSES.has(normalizedStatus) || CANCELLED_STATUSES.has(normalizedStatus);
      const threadWithStatus = shouldLock
        ? setThreadStatus(baseThread.id, "LOCKED") ?? { ...baseThread, status: "LOCKED" as const, updatedAt: new Date().toISOString() }
        : baseThread;
      const threadAfterRead = markThreadAsRead(threadWithStatus.id, "CLIENT") ?? threadWithStatus;
      const messages = getMessagesByThread(threadAfterRead.id);
      const statusMessage = getStatusMessage(normalizedStatus, threadAfterRead.status);

      setChatModal({
        type: "chat",
        order,
        driver,
        thread: threadAfterRead,
        messages,
        readOnly: shouldLock || threadAfterRead.status === "LOCKED",
        statusMessage,
      });
    },
    [driverById, latestAssignments],
  );

  const handleSendMessage = useCallback((message: string) => {
    setChatModal((current) => {
      if (!current || current.type !== "chat" || current.readOnly) {
        return current;
      }

      const result = appendMessageToThread(current.thread.id, "CLIENT", message);
      if (!result) {
        return current;
      }

      const normalizedStatus = normalizeStatus(current.order.status);
      const statusMessage = getStatusMessage(normalizedStatus, result.thread.status);

      return {
        ...current,
        thread: result.thread,
        messages: [...current.messages, result.message],
        statusMessage,
      };
    });
  }, []);

  const isDialogOpen = chatModal !== null;
  const chatDriverPhoneLink =
    chatModal?.type === "chat"
      ? sanitizePhoneLink(chatModal.driver.phone, chatModal.driver.phoneNormalized)
      : null;

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={<Topbar userName="Jean Dupont" />}
    >
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mes commandes</h1>
            <p className="text-muted-foreground">Gérez et suivez vos livraisons</p>
          </div>
          <CreateOrderButton className="mt-3 sm:mt-0" />
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par n° ou type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  aria-label="Rechercher une commande"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48" aria-label="Filtrer par statut">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en cours">En cours</SelectItem>
                  <SelectItem value="enlevé">Enlevé</SelectItem>
                  <SelectItem value="livré">Livré</SelectItem>
                  <SelectItem value="en attente">En attente</SelectItem>
                  <SelectItem value="annulé">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des commandes */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold">N° Commande</th>
                    <th className="text-left p-4 text-sm font-semibold">Date</th>
                    <th className="text-left p-4 text-sm font-semibold">Type</th>
                    <th className="text-left p-4 text-sm font-semibold">Trajet</th>
                    <th className="text-left p-4 text-sm font-semibold">Chauffeur</th>
                    <th className="text-left p-4 text-sm font-semibold">Statut</th>
                    <th className="text-right p-4 text-sm font-semibold">Prix</th>
                    <th className="text-right p-4 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(({ order, driverName, driverPhone, phoneLink, formattedDate }) => (
                    <tr key={order.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-mono text-sm">{order.id}</td>
                      <td className="p-4 text-sm text-muted-foreground">{formattedDate}</td>
                      <td className="p-4 text-sm">{order.type}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {order.pickupAddress} → {order.dropoffAddress}
                      </td>
                      <td className="p-4 text-sm">
                        <div>
                          <p>{driverName}</p>
                          {driverPhone && (
                            <a
                              href={phoneLink ?? `tel:${driverPhone.replace(/\s+/g, "")}`}
                              className="text-xs text-primary hover:underline"
                            >
                              {driverPhone}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusBadgeClass(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right font-semibold">{order.amount.toFixed(2)}€</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/espace-client/commandes/${order.id}`} aria-label={`Voir la commande ${order.id}`}>
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            </Link>
                          </Button>
                          {order.status === "Livré" && (
                            <>
                              <Button variant="ghost" size="sm" title="Recommander">
                                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Télécharger PDF">
                                <Download className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Contacter le chauffeur"
                            aria-label={`Contacter le chauffeur de la commande ${order.id}`}
                            onClick={() => handleContactDriver(order)}
                          >
                            <MessageSquare className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && setChatModal(null)}>
        <DialogContent className="sm:max-w-3xl w-full">
          {chatModal?.type === "chat" && (
            <div className="space-y-4">
              <DialogHeader className="space-y-2">
                <DialogTitle>Contacter {chatModal.driver.fullname ?? chatModal.driver.name}</DialogTitle>
                <DialogDescription>
                  Commande {chatModal.order.id} · {chatModal.order.pickupAddress} → {chatModal.order.dropoffAddress}
                </DialogDescription>
                <p className="text-xs text-muted-foreground">
                  Téléphone chauffeur :{" "}
                  {chatDriverPhoneLink ? (
                    <a href={chatDriverPhoneLink} className="text-primary hover:underline">
                      {chatModal.driver.phone}
                    </a>
                  ) : (
                    <span>{chatModal.driver.phone}</span>
                  )}
                </p>
                {chatModal.statusMessage && (
                  <p className="text-sm text-muted-foreground">{chatModal.statusMessage}</p>
                )}
              </DialogHeader>
              <Chat
                messages={chatModal.messages.map((message) => ({
                  id: message.id,
                  sender: message.author === "CLIENT" ? "me" : "other",
                  text: message.body,
                  time: formatTime(message.createdAt),
                }))}
                recipientName={chatModal.driver.fullname ?? chatModal.driver.name}
                onSendMessage={handleSendMessage}
                inputDisabled={chatModal.readOnly}
                disabledMessage={chatModal.readOnly ? chatModal.statusMessage : undefined}
              />
            </div>
          )}

          {chatModal?.type === "no-driver" && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>Pas encore de chauffeur affecté</DialogTitle>
                <DialogDescription>
                  Commande {chatModal.order.id} · {chatModal.order.pickupAddress} → {chatModal.order.dropoffAddress}
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                {chatModal.reason === "cancelled"
                  ? "Cette commande est annulée. Pour toute question, contactez l'administrateur."
                  : "Nous vous préviendrons dès qu'un chauffeur sera affecté. Vous pouvez contacter l'administrateur si besoin."}
              </p>
              <Button asChild>
                <Link to="/espace-client/messages?conversation=admin">Envoyer un message à l'admin</Link>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ClientOrders;
