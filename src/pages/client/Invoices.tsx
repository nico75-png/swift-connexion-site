import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import CreateOrderButton from "@/components/dashboard/CreateOrderButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { useState } from "react";

/**
 * Page de gestion des factures
 * Liste, filtres, téléchargement PDF
 */
const ClientInvoices = () => {
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("2025");

  const invoices = [
    {
      id: "FACT-2025-01",
      period: "Décembre 2024",
      orders: 15,
      amount: 623.50,
      status: "Payée",
      statusColor: "success",
      date: "31/12/2024",
    },
    {
      id: "FACT-2024-12",
      period: "Novembre 2024",
      orders: 12,
      amount: 489.00,
      status: "Payée",
      statusColor: "success",
      date: "30/11/2024",
    },
    {
      id: "FACT-2024-11",
      period: "Octobre 2024",
      orders: 18,
      amount: 756.50,
      status: "Payée",
      statusColor: "success",
      date: "31/10/2024",
    },
  ];

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      success: "bg-success/10 text-success border-success/20",
      warning: "bg-warning/10 text-warning border-warning/20",
    };
    return colors[color];
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
            <h1 className="text-3xl font-bold mb-2">Factures</h1>
            <p className="text-muted-foreground">Consultez et téléchargez vos factures</p>
          </div>
          <CreateOrderButton className="mt-3 sm:mt-0" />
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Tous les mois" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les mois</SelectItem>
                  <SelectItem value="01">Janvier</SelectItem>
                  <SelectItem value="02">Février</SelectItem>
                  <SelectItem value="12">Décembre</SelectItem>
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des factures */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold">N° Facture</th>
                    <th className="text-left p-4 text-sm font-semibold">Date</th>
                    <th className="text-left p-4 text-sm font-semibold">Période</th>
                    <th className="text-left p-4 text-sm font-semibold">Commandes</th>
                    <th className="text-right p-4 text-sm font-semibold">Montant</th>
                    <th className="text-left p-4 text-sm font-semibold">Statut</th>
                    <th className="text-right p-4 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-mono text-sm">{invoice.id}</td>
                      <td className="p-4 text-sm text-muted-foreground">{invoice.date}</td>
                      <td className="p-4 text-sm">{invoice.period}</td>
                      <td className="p-4 text-sm">{invoice.orders} courses</td>
                      <td className="p-4 text-right font-semibold">{invoice.amount.toFixed(2)}€</td>
                      <td className="p-4">
                        <Badge className={getStatusColor(invoice.statusColor)}>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            PDF
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
    </DashboardLayout>
  );
};

export default ClientInvoices;
