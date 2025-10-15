import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import CreateOrderButton from "@/components/dashboard/CreateOrderButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Eye, RotateCcw, MessageSquare, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useToast } from "@/components/ui/use-toast";
import {
  ClientOrder,
  confirmReorder,
  createReorderDraft,
  ensureOrdersDataShape,
  ensureStoragePrimitives,
  formatCurrencyEUR,
  formatDateTime,
} from "@/lib/reorder";
import ReorderModal from "./components/ReorderModal";

/**
 * Page listant toutes les commandes du client
 * Avec filtres et actions
 */
const ClientOrders = () => {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [reorderDraft, setReorderDraft] = useState<ClientOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    ensureStoragePrimitives();
    const initialOrders = ensureOrdersDataShape();
    setOrders(initialOrders);
  }, []);

  const refreshOrdersFromStorage = useCallback(() => {
    const nextOrders = ensureOrdersDataShape();
    setOrders(nextOrders);
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || ["oc_orders", "oc_assignments"].includes(event.key)) {
        refreshOrdersFromStorage();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshOrdersFromStorage]);

  const getStatusColor = useCallback((status: string) => {
    const normalized = status.toLowerCase();
    if (normalized.includes("livr")) {
      return "bg-success/10 text-success border-success/20";
    }
    if (normalized.includes("cours")) {
      return "bg-info/10 text-info border-info/20";
    }
    if (normalized.includes("attent")) {
      return "bg-warning/10 text-warning border-warning/20";
    }
    if (normalized.includes("valid")) {
      return "bg-amber-100 text-amber-800 border-amber-200";
    }
    if (normalized.includes("annul")) {
      return "bg-destructive/10 text-destructive border-destructive/20";
    }
    return "bg-muted text-foreground border-border";
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const normalizedStatus = order.status.toLowerCase();
      const matchesStatus =
        statusFilter === "all" || normalizedStatus.includes(statusFilter.toLowerCase());
      const haystack = [
        order.id,
        order.type,
        order.from?.address ?? "",
        order.to?.address ?? "",
      ]
        .filter(Boolean)
        .map((value) => value.toLowerCase());
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch = term.length === 0 || haystack.some((value) => value.includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleReorder = useCallback(
    (orderId: string) => {
      try {
        const draft = createReorderDraft(orderId);
        setReorderDraft(draft);
        setIsModalOpen(true);
      } catch (error) {
        console.error(error);
        toast({
          title: "Recommandation impossible",
          description: "Impossible de préparer la recommandation pour cette commande.",
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setReorderDraft(null);
  }, []);

  const handleConfirm = useCallback(
    async (draft: ClientOrder) => {
      const result = confirmReorder(draft);
      setOrders((current) => [result.order, ...current.filter((order) => order.id !== result.order.id)]);
      toast({
        title: "Commande recommandée",
        description: result.driver
          ? `Commande ${result.order.id} créée et assignée à ${result.driver.name}.`
          : `Commande ${result.order.id} créée sans chauffeur disponible pour le moment.`,
      });
      closeModal();
    },
    [closeModal, toast],
  );

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
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en cours">En cours</SelectItem>
                  <SelectItem value="livré">Livré</SelectItem>
                  <SelectItem value="en attente">En attente</SelectItem>
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
                  {filteredOrders.map((order) => {
                    const driverName = order.driver?.name ?? "En attente";
                    const driverPhone = order.driver?.phone ?? "";
                    const fromAddress = order.from?.address ?? "Adresse non renseignée";
                    const toAddress = order.to?.address ?? "Adresse non renseignée";
                    const canContactDriver = driverPhone.trim().length > 0 && order.status.toLowerCase().includes("cours");
                    const canReorder = !order.status.toLowerCase().includes("cours");
                    return (
                      <tr key={order.id} className="border-b transition-colors hover:bg-muted/30">
                        <td className="p-4 font-mono text-sm">{order.id}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDateTime(order.pickupAt) || "—"}
                        </td>
                        <td className="p-4 text-sm">{order.type}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {fromAddress} → {toAddress}
                        </td>
                        <td className="p-4 text-sm">
                          <div className="space-y-1">
                            <p>{driverName}</p>
                            {driverPhone && (
                              <a
                                href={`tel:${driverPhone}`}
                                className="text-xs text-primary hover:underline"
                              >
                                {driverPhone}
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getStatusColor(order.status)} border`}>{order.status}</Badge>
                        </td>
                        <td className="p-4 text-right font-semibold">
                          {formatCurrencyEUR(order.price?.total ?? 0)}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/espace-client/commandes/${order.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Voir la commande {order.id}</span>
                              </Link>
                            </Button>
                            {canReorder && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Recommander"
                                data-action="reorder"
                                data-order-id={order.id}
                                onClick={() => handleReorder(order.id)}
                              >
                                <RotateCcw className="h-4 w-4" />
                                <span className="sr-only">Recommander la commande {order.id}</span>
                              </Button>
                            )}
                            {canContactDriver && (
                              <Button variant="ghost" size="sm" asChild title="Contacter chauffeur">
                                <a href={`tel:${driverPhone}`}>
                                  <MessageSquare className="h-4 w-4" />
                                  <span className="sr-only">Appeler le chauffeur {driverName}</span>
                                </a>
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" title="Télécharger PDF">
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Télécharger le récapitulatif PDF</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-sm text-muted-foreground">
                        Aucune commande ne correspond à votre recherche.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <ReorderModal
          draft={reorderDraft}
          open={isModalOpen}
          onCancel={closeModal}
          onConfirm={handleConfirm}
        />
      </div>
    </DashboardLayout>
  );
};

export default ClientOrders;
