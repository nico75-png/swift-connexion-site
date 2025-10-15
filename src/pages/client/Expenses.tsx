import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import CreateOrderButton from "@/components/dashboard/CreateOrderButton";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, DollarSign, Calendar, Download, FileSpreadsheet } from "lucide-react";
import { useState } from "react";

/**
 * Page des dépenses avec graphiques et exports
 */
const ClientExpenses = () => {
  const [periodFilter, setPeriodFilter] = useState("month");
  const [statusFilter, setStatusFilter] = useState("all");

  const stats = [
    { label: "Total cumulé", value: "1 869€", icon: DollarSign, color: "text-primary" },
    { label: "Moyenne / commande", value: "35.60€", icon: TrendingUp, color: "text-success" },
    { label: "Ce mois", value: "623€", icon: Calendar, color: "text-info" },
  ];

  const expenses = [
    { id: "HORDE25001", date: "15/01/2025", status: "En cours", amount: 45.5 },
    { id: "HORDE25002", date: "14/01/2025", status: "Livré", amount: 52 },
    { id: "HORDE25003", date: "14/01/2025", status: "Livré", amount: 38 },
    { id: "HORDE25004", date: "13/01/2025", status: "En attente", amount: 35 },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "En cours": "bg-info/10 text-info border-info/20",
      "Livré": "bg-success/10 text-success border-success/20",
      "En attente": "bg-warning/10 text-warning border-warning/20",
    };
    return colors[status] || colors["En cours"];
  };

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={<Topbar userName="Jean Dupont" />}
    >
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dépenses</h1>
            <p className="text-muted-foreground">Analysez vos coûts de transport</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 sm:justify-end">
            <CreateOrderButton className="mt-3 sm:mt-0" />
            <div className="mt-2 flex flex-col gap-2 sm:mt-0 sm:flex-row">
              <Button variant="outline">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="cta">
                <Download className="h-4 w-4 mr-2" />
                Synthèse PDF
              </Button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <StatsCard key={i} {...stat} />
          ))}
        </div>

        {/* Graphique évolution */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Graphique des dépenses par mois</p>
            </div>
          </CardContent>
        </Card>

        {/* Répartition */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par statut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Graphique circulaire des statuts</p>
            </div>
          </CardContent>
        </Card>

        {/* Filtres */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Statut" />
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

        {/* Tableau détaillé */}
        <Card>
          <CardHeader>
            <CardTitle>Détail des dépenses</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold">Commande</th>
                    <th className="text-left p-4 text-sm font-semibold">Date</th>
                    <th className="text-left p-4 text-sm font-semibold">Statut</th>
                    <th className="text-right p-4 text-sm font-semibold">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-b hover:bg-muted/30">
                      <td className="p-4 font-mono text-sm">{expense.id}</td>
                      <td className="p-4 text-sm text-muted-foreground">{expense.date}</td>
                      <td className="p-4">
                        <Badge className={getStatusColor(expense.status)}>{expense.status}</Badge>
                      </td>
                      <td className="p-4 text-right font-semibold">{expense.amount.toFixed(2)}€</td>
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

export default ClientExpenses;
