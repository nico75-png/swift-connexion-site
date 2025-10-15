import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Edit, Mail, Phone, MapPin } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/**
 * Page admin - Profil détaillé d'un client
 * Données générales, historique commandes, dépenses, factures
 */
const AdminClientProfile = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [notes, setNotes] = useState("Client fidèle et régulier. Préfère les livraisons matinales.");

  const client = {
    id: id || "1",
    company: "Cabinet Dupont",
    contact: "Jean Dupont",
    sector: "Juridique",
    siret: "123 456 789 00012",
    address: "12 rue de la Paix, 75002 Paris",
    email: "j.dupont@cabinet.fr",
    phone: "01 23 45 67 89",
    status: "Actif",
    signupDate: "2024-03-15",
    totalOrders: 47,
    totalSpent: 2234.50,
  };

  const recentOrders = [
    { id: "HORDE26047", date: "2025-01-15", status: "En cours", amount: 45.5 },
    { id: "HORDE26043", date: "2025-01-14", status: "Livré", amount: 38 },
    { id: "HORDE26038", date: "2025-01-12", status: "Livré", amount: 52 },
    { id: "HORDE26035", date: "2025-01-10", status: "Livré", amount: 41 },
  ];

  const invoices = [
    { id: "FACT-025", period: "Janvier 2025", amount: 512.50, status: "Payée", dueDate: "2025-01-31" },
    { id: "FACT-024", period: "Décembre 2024", amount: 487.00, status: "Payée", dueDate: "2024-12-31" },
    { id: "FACT-023", period: "Novembre 2024", amount: 445.00, status: "Payée", dueDate: "2024-11-30" },
  ];

  const spendingData = [
    { month: "Juil", amount: 380 },
    { month: "Aoû", amount: 420 },
    { month: "Sep", amount: 395 },
    { month: "Oct", amount: 445 },
    { month: "Nov", amount: 487 },
    { month: "Déc", amount: 512 },
  ];

  const handleSaveNotes = () => {
    toast({
      title: "Notes enregistrées",
      description: "Les notes ont été mises à jour.",
    });
  };

  const handleDownloadSummary = () => {
    toast({
      title: "Téléchargement",
      description: "Génération de la synthèse client en cours...",
    });
  };

  return (
    <DashboardLayout
      sidebar={<AdminSidebar />}
      topbar={<Topbar title={client.company} />}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin/clients">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux clients
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button variant="outline" onClick={handleDownloadSummary}>
            <Download className="h-4 w-4 mr-2" />
            Synthèse PDF
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informations générales</CardTitle>
                <Badge
                  variant="outline"
                  className="bg-success/10 text-success border-success/20"
                >
                  {client.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Entreprise</p>
                  <p className="font-semibold">{client.company}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Contact principal</p>
                  <p className="font-semibold">{client.contact}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Secteur</p>
                  <Badge variant="outline">{client.sector}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">SIRET</p>
                  <p className="font-mono text-sm">{client.siret}</p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                    {client.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <a href={`tel:${client.phone}`} className="text-primary hover:underline">
                    {client.phone}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <p>{client.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{client.totalOrders}</p>
                  <p className="text-xs text-muted-foreground mt-1">Commandes</p>
                </div>
                <div className="text-center p-3 bg-success/10 rounded-lg">
                  <p className="text-2xl font-bold text-success">{client.totalSpent}€</p>
                  <p className="text-xs text-muted-foreground mt-1">Total dépensé</p>
                </div>
                <div className="text-center p-3 bg-info/10 rounded-lg">
                  <p className="text-2xl font-bold text-info">{Math.round(client.totalSpent / client.totalOrders)}€</p>
                  <p className="text-xs text-muted-foreground mt-1">Panier moyen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Graphique dépenses */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle>Évolution des dépenses (6 derniers mois)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={spendingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--success))"
                    fill="hsl(var(--success) / 0.2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Historique commandes */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Dernières commandes</CardTitle>
                <Link to="/admin/commandes">
                  <Button variant="ghost" size="sm">Voir tout</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Commande</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-semibold">{order.id}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{order.amount}€</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Factures */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle>Factures</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Facture</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono font-semibold">{invoice.id}</TableCell>
                      <TableCell>{invoice.period}</TableCell>
                      <TableCell className="font-semibold">{invoice.amount}€</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{invoice.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          {invoice.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Notes internes */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle>Notes internes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajoutez des notes sur ce client..."
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
              <Button variant="cta" className="w-full justify-start">
                Créer une commande
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Envoyer un email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Appeler le client
              </Button>
              <Button variant="outline" className="w-full justify-start text-warning hover:text-warning">
                Désactiver le compte
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminClientProfile;
