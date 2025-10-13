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
import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * Page listant toutes les commandes du client
 * Avec filtres et actions
 */
const ClientOrders = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const orders = [
    {
      id: "CMD-2025-001",
      date: "15/01/2025",
      type: "Document juridique",
      from: "Paris 75001",
      to: "Boulogne 92100",
      status: "En cours",
      statusColor: "info",
      price: 45.50,
      driver: "Marc D.",
      driverPhone: "06 12 34 56 78",
    },
    {
      id: "CMD-2025-002",
      date: "14/01/2025",
      type: "Colis médical",
      from: "Paris 75008",
      to: "Versailles 78000",
      status: "Livré",
      statusColor: "success",
      price: 52.00,
      driver: "Sophie L.",
      driverPhone: "06 23 45 67 89",
    },
    {
      id: "CMD-2025-003",
      date: "14/01/2025",
      type: "Monture optique",
      from: "Paris 75015",
      to: "Saint-Cloud 92210",
      status: "Livré",
      statusColor: "success",
      price: 38.00,
      driver: "Thomas R.",
      driverPhone: "06 34 56 78 90",
    },
    {
      id: "CMD-2025-004",
      date: "13/01/2025",
      type: "Document express",
      from: "Paris 75002",
      to: "Neuilly 92200",
      status: "En attente",
      statusColor: "warning",
      price: 35.00,
      driver: "En attente",
      driverPhone: "-",
    },
  ];

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      info: "bg-info/10 text-info border-info/20",
      success: "bg-success/10 text-success border-success/20",
      warning: "bg-warning/10 text-warning border-warning/20",
    };
    return colors[color] || colors.info;
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status.toLowerCase().includes(statusFilter.toLowerCase());
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-mono text-sm">{order.id}</td>
                      <td className="p-4 text-sm text-muted-foreground">{order.date}</td>
                      <td className="p-4 text-sm">{order.type}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {order.from} → {order.to}
                      </td>
                      <td className="p-4 text-sm">
                        <div>
                          <p>{order.driver}</p>
                          {order.driverPhone !== "-" && (
                            <a href={`tel:${order.driverPhone}`} className="text-xs text-primary hover:underline">
                              {order.driverPhone}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(order.statusColor)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right font-semibold">{order.price.toFixed(2)}€</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/espace-client/commandes/${order.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {order.status === "Livré" && (
                            <>
                              <Button variant="ghost" size="sm" title="Recommander">
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Télécharger PDF">
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {order.status === "En cours" && order.driverPhone !== "-" && (
                            <Button variant="ghost" size="sm" title="Contacter chauffeur">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          )}
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
    </DashboardLayout>
  );
};

export default ClientOrders;
