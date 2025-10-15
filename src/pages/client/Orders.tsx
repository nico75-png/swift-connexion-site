import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import CreateOrderButton from "@/components/dashboard/CreateOrderButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const OrdersPreviewSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="880"
    height="360"
    viewBox="0 0 880 360"
    role="img"
    aria-label="Aperçu Mes commandes avec numérotation séquentielle"
  >
    <defs>
      <style>{`
        .bg{fill:#F5F7FA}
        .card{fill:#fff;stroke:#E4E7EB}
        .title{font:600 18px Inter, Arial; fill:#1F1F1F}
        .th{font:600 12px Inter, Arial; fill:#6B7280}
        .td{font:400 13px Inter, Arial; fill:#1F1F1F}
        .badge{font:600 11px Inter, Arial; fill:#0F3556}
        .cta{fill:#FFB800}
        .icon{stroke:#0F3556; stroke-width:2; fill:none}
        .chip{fill:#E8F0F7; stroke:#C7D7E6}
      `}</style>
    </defs>
    <rect className="bg" x="0" y="0" width="100%" height="100%" />
    <g transform="translate(24,24)">
      <text className="title">Mes commandes</text>
      <rect className="card" x="0" y="24" width="832" height="292" rx="10" />
      <g transform="translate(16,44)">
        <text className="th" x="0" y="0">
          N°
        </text>
        <text className="th" x="90" y="0">
          Client
        </text>
        <text className="th" x="260" y="0">
          Départ → Arrivée
        </text>
        <text className="th" x="520" y="0">
          Statut
        </text>
        <text className="th" x="620" y="0">
          Chauffeur
        </text>
        <text className="th" x="750" y="0">
          Actions
        </text>
      </g>
      <g transform="translate(16,72)">
        <text className="td" x="0" y="0">
          009
        </text>
        <text className="td" x="90" y="0">
          One Optique
        </text>
        <text className="td" x="260" y="0">
          Paris 15 → Nanterre
        </text>
        <g transform="translate(520,-12)">
          <rect className="chip" width="78" height="22" rx="6" />
          <text className="badge" x="10" y="14">
            AFFECTÉE
          </text>
        </g>
        <text className="td" x="620" y="0">
          A. Martin
        </text>
        <g transform="translate(750,-10)">
          <g>
            <circle cx="10" cy="10" r="12" fill="#fff" stroke="#0F3556" />
            <path className="icon" d="M10 6 a6 6 0 1 0 6 6" />
            <polyline className="icon" points="10,2 10,6 6,6" />
          </g>
          <g transform="translate(36,0)">
            <rect x="-2" y="-2" width="24" height="24" rx="6" fill="#fff" stroke="#0F3556" />
            <rect x="3" y="6" width="10" height="8" rx="2" stroke="#0F3556" fill="none" />
          </g>
          <g transform="translate(72,0)">
            <rect x="-2" y="-2" width="24" height="24" rx="6" fill="#fff" stroke="#0F3556" />
            <circle className="icon" cx="10" cy="10" r="6" />
          </g>
        </g>
      </g>
      <g transform="translate(16,108)">
        <text className="td" x="0" y="0">
          010
        </text>
        <text className="td" x="90" y="0">
          LexPartner
        </text>
        <text className="td" x="260" y="0">
          Issy → La Défense
        </text>
        <g transform="translate(520,-12)">
          <rect className="chip" width="88" height="22" rx="6" />
          <text className="badge" x="10" y="14">
            EN COURS
          </text>
        </g>
        <text className="td" x="620" y="0">
          B. Kaba
        </text>
        <g transform="translate(750,-10)">
          <circle cx="10" cy="10" r="12" fill="#fff" stroke="#0F3556" />
          <path className="icon" d="M10 6 a6 6 0 1 0 6 6" />
          <polyline className="icon" points="10,2 10,6 6,6" />
          <g transform="translate(36,0)">
            <rect x="-2" y="-2" width="24" height="24" rx="6" fill="#fff" stroke="#0F3556" />
            <rect x="3" y="6" width="10" height="8" rx="2" stroke="#0F3556" fill="none" />
          </g>
          <g transform="translate(72,0)">
            <rect x="-2" y="-2" width="24" height="24" rx="6" fill="#fff" stroke="#0F3556" />
            <circle className="icon" cx="10" cy="10" r="6" />
          </g>
        </g>
      </g>
      <g transform="translate(16,144)">
        <text className="td" x="0" y="0">
          1000
        </text>
        <text className="td" x="90" y="0">
          Medica+
        </text>
        <text className="td" x="260" y="0">
          Ivry → Paris 12
        </text>
        <g transform="translate(520,-12)">
          <rect className="chip" width="70" height="22" rx="6" />
          <text className="badge" x="10" y="14">
            LIVRÉE
          </text>
        </g>
        <text className="td" x="620" y="0">
          C. Nguyen
        </text>
        <g transform="translate(750,-10)">
          <circle cx="10" cy="10" r="12" fill="#fff" stroke="#0F3556" />
          <path className="icon" d="M10 6 a6 6 0 1 0 6 6" />
          <polyline className="icon" points="10,2 10,6 6,6" />
          <g transform="translate(36,0)">
            <rect x="-2" y="-2" width="24" height="24" rx="6" fill="#fff" stroke="#0F3556" />
            <rect x="3" y="6" width="10" height="8" rx="2" stroke="#0F3556" fill="none" />
          </g>
          <g transform="translate(72,0)">
            <rect x="-2" y="-2" width="24" height="24" rx="6" fill="#fff" stroke="#0F3556" />
            <circle className="icon" cx="10" cy="10" r="6" />
          </g>
        </g>
      </g>
      <g transform="translate(640,270)">
        <rect className="cta" x="0" y="0" width="192" height="38" rx="8" />
        <text className="title" x="16" y="26" fill="#1F1F1F">
          ➕ Créer une commande
        </text>
      </g>
    </g>
  </svg>
);

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
        <Card className="overflow-hidden border border-dashed border-muted">
          <CardHeader className="pb-0">
            <CardTitle>Aperçu du rendu</CardTitle>
            <CardDescription>
              Illustration statique de la numérotation globale affichée dans la liste.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <OrdersPreviewSvg />
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
