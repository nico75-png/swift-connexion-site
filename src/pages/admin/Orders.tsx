import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Clock } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CreateOrderButton from "@/components/dashboard/CreateOrderButton";
import AssignDriverModal from "@/components/admin/AssignDriverModal";
import { useDrivers, useNotifications, useOrders, useScheduledAssignments } from "@/hooks/useMockData";
import { formatDateTime } from "@/lib/mockData";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Page admin - Liste des commandes
 * Tableau filtrable avec actions (voir, modifier, annuler, affecter chauffeur)
 */
const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"now" | "later">("now");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  const orders = useOrders();
  const drivers = useDrivers();
  const scheduledAssignments = useScheduledAssignments();
  const notifications = useNotifications("admin");

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const selectedSchedule = useMemo(
    () => scheduledAssignments.find((item) => item.id === selectedScheduleId) ?? null,
    [scheduledAssignments, selectedScheduleId],
  );

  const clients = useMemo(() => {
    const unique = new Set<string>();
    orders.forEach((order) => unique.add(order.client));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [orders]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Livré": "bg-success/10 text-success border-success/20",
      "En cours": "bg-info/10 text-info border-info/20",
      "Enlevé": "bg-secondary/10 text-secondary border-secondary/20",
      "En attente": "bg-warning/10 text-warning border-warning/20",
      "Annulé": "bg-destructive/10 text-destructive border-destructive/20",
      "A VALIDER": "bg-primary/10 text-primary border-primary/20",
    };
    return colors[status] || "";
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        order.id.toLowerCase().includes(search) || order.client.toLowerCase().includes(search);
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesClient = clientFilter === "all" || order.client === clientFilter;
      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [orders, searchTerm, statusFilter, clientFilter]);

  const handleOpenModal = (orderId: string, mode: "now" | "later" = "now", scheduleId?: string) => {
    setSelectedOrderId(orderId);
    setSelectedScheduleId(scheduleId ?? null);
    setModalMode(mode);
    setModalOpen(true);
  };

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

  return (
    <DashboardLayout
      sidebar={<AdminSidebar />}
      topbar={<Topbar title="Gestion des commandes" notifications={mappedNotifications} />}
    >
      <AssignDriverModal
        order={selectedOrder}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialMode={modalMode}
        scheduledAssignment={selectedSchedule}
      />
      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par N° ou client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="En attente">En attente</SelectItem>
            <SelectItem value="Enlevé">Enlevé</SelectItem>
            <SelectItem value="En cours">En cours</SelectItem>
            <SelectItem value="Livré">Livré</SelectItem>
            <SelectItem value="Annulé">Annulé</SelectItem>
          </SelectContent>
        </Select>

        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les clients</SelectItem>
            {clients.map(client => (
              <SelectItem key={client} value={client}>{client}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <CreateOrderButton />
      </div>

      {/* Tableau des commandes */}
      <div className="bg-card rounded-lg border border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">N° Commande</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Client</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Statut</TableHead>
                <TableHead className="font-semibold">Chauffeur</TableHead>
                <TableHead className="font-semibold text-right">Montant</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono font-semibold">{order.id}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTime(order.date)}</TableCell>
                  <TableCell>{order.client}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {order.driverId ? (
                      drivers.find((driver) => driver.id === order.driverId)?.name || "-"
                    ) : (
                      "-"
                    )}
                    {(() => {
                      const scheduled = scheduledAssignments.find(
                        (item) => item.orderId === order.id && item.status === "SCHEDULED",
                      );
                      if (!scheduled) {
                        return null;
                      }
                      return (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="secondary" className="ml-2 bg-info/10 text-info border-info/20">
                              <Clock className="h-3 w-3 mr-1" /> Planifiée
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            Affectation prévue le {formatDateTime(scheduled.scheduledAt)}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{order.amount}€</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/commandes/${order.id}`}>
                        <Button variant="ghost" size="sm">Voir</Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="btn-assign-driver"
                        data-order-id={order.id}
                        onClick={() =>
                          handleOpenModal(
                            order.id,
                            order.driverId ? "now" : "later",
                            order.scheduledAssignmentId ?? undefined,
                          )
                        }
                      >
                        Affecter
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucune commande trouvée</p>
          </div>
        )}
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-1">Total</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
          <p className="text-xs text-warning mb-1">En attente</p>
          <p className="text-2xl font-bold text-warning">{orders.filter(o => o.status === "En attente").length}</p>
        </div>
        <div className="p-4 bg-info/10 rounded-lg border border-info/20">
          <p className="text-xs text-info mb-1">En cours</p>
          <p className="text-2xl font-bold text-info">{orders.filter(o => o.status === "En cours").length}</p>
        </div>
        <div className="p-4 bg-success/10 rounded-lg border border-success/20">
          <p className="text-xs text-success mb-1">Livrées</p>
          <p className="text-2xl font-bold text-success">{orders.filter(o => o.status === "Livré").length}</p>
        </div>
        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-xs text-destructive mb-1">Annulées</p>
          <p className="text-2xl font-bold text-destructive">{orders.filter(o => o.status === "Annulé").length}</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminOrders;
