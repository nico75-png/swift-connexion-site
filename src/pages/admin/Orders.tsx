import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Filter, Search } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CreateOrderButton from "@/components/dashboard/CreateOrderButton";
import AssignDriverModal from "@/components/admin/orders/AssignDriverModal";
import { getAssignButtonLabel } from "@/components/admin/orders/orderAssignmentUtils";
import { driverStatusBadgeClass, driverStatusLabel } from "@/components/admin/orders/driverUtils";
import { useDriversStore, useNotificationsStore, useOrdersStore } from "@/providers/AdminDataProvider";
import { cn } from "@/lib/utils";

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  const { orders, ready } = useOrdersStore();
  const { drivers } = useDriversStore();
  const { notifications } = useNotificationsStore();

  const clients = useMemo(
    () => Array.from(new Set(orders.map((order) => order.client))).sort(),
    [orders],
  );

  const statusOptions = useMemo(
    () => Array.from(new Set(orders.map((order) => order.status))).sort(),
    [orders],
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          order.id.toLowerCase().includes(term) || order.client.toLowerCase().includes(term);
        const matchesStatus = statusFilter === "all" || order.status === statusFilter;
        const matchesClient = clientFilter === "all" || order.client === clientFilter;
        return matchesSearch && matchesStatus && matchesClient;
      }),
    [orders, searchTerm, statusFilter, clientFilter],
  );

  const topbarNotifications = useMemo(
    () =>
      notifications.map((notification) => ({
        id: notification.id,
        message: notification.message,
        time: new Date(notification.createdAt).toLocaleString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: notification.read,
      })),
    [notifications],
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Livré": "bg-success/10 text-success border-success/20",
      "En cours": "bg-info/10 text-info border-info/20",
      "Enlevé": "bg-secondary/10 text-secondary border-secondary/20",
      "En attente": "bg-warning/10 text-warning border-warning/20",
      "Annulé": "bg-destructive/10 text-destructive border-destructive/20",
    };
    return colors[status] || "";
  };

  const openAssignModal = (orderId: string) => {
    setCurrentOrderId(orderId);
    setIsModalOpen(true);
  };

  const closeAssignModal = () => {
    setIsModalOpen(false);
    setCurrentOrderId(null);
  };

  const formatDate = (isoDate: string) =>
    format(new Date(isoDate), "dd MMM yyyy · HH'h'mm", { locale: fr });

  const driverForOrder = (driverId: string | null | undefined) =>
    driverId ? drivers.find((driver) => driver.id === driverId) ?? null : null;

  return (
    <DashboardLayout sidebar={<AdminSidebar />} topbar={<Topbar title="Gestion des commandes" notifications={topbarNotifications} />}>
      {!ready && (
        <div className="mb-4 rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          Chargement des données...
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par N° ou client..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les clients</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client} value={client}>
                {client}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <CreateOrderButton />
      </div>

      {/* Tableau des commandes */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
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
                <TableHead className="text-right font-semibold">Montant</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const driver = driverForOrder(order.driverId);
                const assignButtonLabel = getAssignButtonLabel(order.status, Boolean(driver));

                return (
                  <TableRow key={order.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-semibold">{order.id}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {order.schedule?.start ? formatDate(order.schedule.start) : "-"}
                  </TableCell>
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
                      {driver ? (
                        <div className="space-y-1">
                          <p className="font-medium leading-tight">{driver.name}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className={cn("text-xs", driverStatusBadgeClass[driver.status])}>
                              {driverStatusLabel[driver.status]}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {driver.vehicle.type} · {driver.vehicle.capacity}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Non assigné</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {order.amount ? `${order.amount.toFixed(2)}€` : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/commandes/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            Voir
                          </Button>
                        </Link>
                        {assignButtonLabel && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="btn-assign-driver"
                            data-order-id={order.id}
                            onClick={() => openAssignModal(order.id)}
                          >
                            {assignButtonLabel}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              {orders.length === 0
                ? "Vous n’avez encore aucune commande."
                : "Aucune commande ne correspond à votre recherche."}
            </p>
          </div>
        )}
      </div>

      {/* Stats rapides */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-1 text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="rounded-lg border border-warning/20 bg-warning/10 p-4">
          <p className="mb-1 text-xs text-warning">En attente</p>
          <p className="text-2xl font-bold text-warning">{orders.filter((order) => order.status === "En attente").length}</p>
        </div>
        <div className="rounded-lg border border-info/20 bg-info/10 p-4">
          <p className="mb-1 text-xs text-info">En cours</p>
          <p className="text-2xl font-bold text-info">{orders.filter((order) => order.status === "En cours").length}</p>
        </div>
        <div className="rounded-lg border border-success/20 bg-success/10 p-4">
          <p className="mb-1 text-xs text-success">Livrées</p>
          <p className="text-2xl font-bold text-success">{orders.filter((order) => order.status === "Livré").length}</p>
        </div>
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
          <p className="mb-1 text-xs text-destructive">Annulées</p>
          <p className="text-2xl font-bold text-destructive">{orders.filter((order) => order.status === "Annulé").length}</p>
        </div>
      </div>

      <AssignDriverModal orderId={currentOrderId} open={isModalOpen} onOpenChange={(open) => (open ? setIsModalOpen(true) : closeAssignModal())} />
    </DashboardLayout>
  );
};

export default AdminOrders;
