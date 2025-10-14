import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Plus, Mail, Phone } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * Page admin - Liste des clients
 * Tableau filtrable avec actions (voir fiche, créer commande, contacter)
 */
const AdminClients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const clients = [
    { id: 1, company: "Cabinet Dupont", contact: "Jean Dupont", sector: "Juridique", email: "j.dupont@cabinet.fr", phone: "01 23 45 67 89", orders: 47, status: "Actif", lastOrder: "2025-01-15" },
    { id: 2, company: "Optique Vision", contact: "Marie Leclerc", sector: "Optique", email: "m.leclerc@optique.fr", phone: "01 34 56 78 90", orders: 132, status: "Actif", lastOrder: "2025-01-15" },
    { id: 3, company: "Lab Médical", contact: "Dr. Martin", sector: "Santé", email: "contact@labmedical.fr", phone: "01 45 67 89 01", orders: 89, status: "Actif", lastOrder: "2025-01-15" },
    { id: 4, company: "Avocat & Associés", contact: "Pierre Avocat", sector: "Juridique", email: "p.avocat@legal.fr", phone: "01 56 78 90 12", orders: 56, status: "Actif", lastOrder: "2025-01-15" },
    { id: 5, company: "Pharmacie Centrale", contact: "Sophie Blanc", sector: "Santé", email: "s.blanc@pharma.fr", phone: "01 67 89 01 23", orders: 203, status: "Actif", lastOrder: "2025-01-14" },
    { id: 6, company: "Cabinet Martin", contact: "Luc Martin", sector: "Juridique", email: "l.martin@cabinet.fr", phone: "01 78 90 12 34", orders: 12, status: "Inactif", lastOrder: "2024-11-20" },
  ];

  const sectors = ["Juridique", "Optique", "Santé", "B2B"];

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === "all" || client.sector === sectorFilter;
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    return matchesSearch && matchesSector && matchesStatus;
  });

  return (
    <DashboardLayout
      sidebar={<AdminSidebar />}
      topbar={<Topbar title="Gestion des clients" />}
    >
      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par entreprise ou contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Secteur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les secteurs</SelectItem>
            {sectors.map(sector => (
              <SelectItem key={sector} value={sector}>{sector}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="Actif">Actifs</SelectItem>
            <SelectItem value="Inactif">Inactifs</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="cta">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un client
        </Button>
      </div>

      {/* Tableau des clients */}
      <div className="bg-card rounded-lg border border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Entreprise</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Secteur</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Téléphone</TableHead>
                <TableHead className="font-semibold text-center">Commandes</TableHead>
                <TableHead className="font-semibold">Statut</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id} className="hover:bg-muted/30">
                  <TableCell className="font-semibold">{client.company}</TableCell>
                  <TableCell>{client.contact}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{client.sector}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <a href={`mailto:${client.email}`} className="text-primary hover:underline flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {client.email}
                    </a>
                  </TableCell>
                  <TableCell className="text-sm">
                    <a href={`tel:${client.phone}`} className="text-primary hover:underline flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </a>
                  </TableCell>
                  <TableCell className="text-center font-semibold">{client.orders}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        client.status === "Actif"
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-muted text-muted-foreground border-border"
                      }
                    >
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/clients/${client.id}`}>
                        <Button variant="ghost" size="sm">Voir fiche</Button>
                      </Link>
                      <Button variant="ghost" size="sm">Créer commande</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun client trouvé</p>
          </div>
        )}
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-1">Total clients</p>
          <p className="text-2xl font-bold">{clients.length}</p>
        </div>
        <div className="p-4 bg-success/10 rounded-lg border border-success/20">
          <p className="text-xs text-success mb-1">Actifs</p>
          <p className="text-2xl font-bold text-success">{clients.filter(c => c.status === "Actif").length}</p>
        </div>
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-xs text-primary mb-1">Total commandes</p>
          <p className="text-2xl font-bold text-primary">{clients.reduce((acc, c) => acc + c.orders, 0)}</p>
        </div>
        <div className="p-4 bg-info/10 rounded-lg border border-info/20">
          <p className="text-xs text-info mb-1">Moyenne / client</p>
          <p className="text-2xl font-bold text-info">{Math.round(clients.reduce((acc, c) => acc + c.orders, 0) / clients.length)}</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminClients;
