import { useState } from "react";
import { Search, Filter, Plus, Phone, Car } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * Page admin - Gestion des chauffeurs
 * Liste des chauffeurs avec filtres (zone, statut)
 */
const AdminDrivers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const drivers = [
    { id: 1, name: "Marc Dubois", phone: "06 12 34 56 78", vehicle: "Renault Kangoo", plate: "AB-123-CD", zone: "Paris Centre", status: "Actif", availability: "Disponible" },
    { id: 2, name: "Julie Leclerc", phone: "06 23 45 67 89", vehicle: "Citroën Berlingo", plate: "BC-234-DE", zone: "Petite Couronne", status: "Actif", availability: "En livraison" },
    { id: 3, name: "Pierre Martin", phone: "06 34 56 78 90", vehicle: "Peugeot Partner", plate: "CD-345-EF", zone: "Paris Centre", status: "Actif", availability: "Disponible" },
    { id: 4, name: "Sophie Rousseau", phone: "06 45 67 89 01", vehicle: "Renault Kangoo", plate: "DE-456-FG", zone: "Grande Couronne", status: "Actif", availability: "En pause" },
    { id: 5, name: "Thomas Bernard", phone: "06 56 78 90 12", vehicle: "Ford Transit", plate: "EF-567-GH", zone: "Petite Couronne", status: "Inactif", availability: "Indisponible" },
  ];

  const zones = ["Paris Centre", "Petite Couronne", "Grande Couronne"];

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.vehicle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = zoneFilter === "all" || driver.zone === zoneFilter;
    const matchesStatus = statusFilter === "all" || driver.status === statusFilter;
    return matchesSearch && matchesZone && matchesStatus;
  });

  const getAvailabilityColor = (availability: string) => {
    const colors: Record<string, string> = {
      "Disponible": "bg-success/10 text-success border-success/20",
      "En livraison": "bg-info/10 text-info border-info/20",
      "En pause": "bg-warning/10 text-warning border-warning/20",
      "Indisponible": "bg-muted text-muted-foreground border-border",
    };
    return colors[availability] || "";
  };

  return (
    <DashboardLayout
      sidebar={<AdminSidebar />}
      topbar={<Topbar />}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestion des chauffeurs</h1>
        <p className="text-muted-foreground mt-1">Gérez vos chauffeurs et leur disponibilité</p>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un chauffeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={zoneFilter} onValueChange={setZoneFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Zone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les zones</SelectItem>
            {zones.map(zone => (
              <SelectItem key={zone} value={zone}>{zone}</SelectItem>
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
          Ajouter un chauffeur
        </Button>
      </div>

      {/* Tableau des chauffeurs */}
      <div className="bg-card rounded-lg border border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Nom</TableHead>
                <TableHead className="font-semibold">Téléphone</TableHead>
                <TableHead className="font-semibold">Véhicule</TableHead>
                <TableHead className="font-semibold">Immatriculation</TableHead>
                <TableHead className="font-semibold">Zone</TableHead>
                <TableHead className="font-semibold">Disponibilité</TableHead>
                <TableHead className="font-semibold">Statut</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver) => (
                <TableRow key={driver.id} className="hover:bg-muted/30">
                  <TableCell className="font-semibold">{driver.name}</TableCell>
                  <TableCell>
                    <a href={`tel:${driver.phone}`} className="text-primary hover:underline flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {driver.phone}
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      {driver.vehicle}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{driver.plate}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{driver.zone}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getAvailabilityColor(driver.availability)}>
                      {driver.availability}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        driver.status === "Actif"
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-muted text-muted-foreground border-border"
                      }
                    >
                      {driver.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">Voir fiche</Button>
                      <Button variant="ghost" size="sm">Affecter</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredDrivers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun chauffeur trouvé</p>
          </div>
        )}
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-1">Total chauffeurs</p>
          <p className="text-2xl font-bold">{drivers.length}</p>
        </div>
        <div className="p-4 bg-success/10 rounded-lg border border-success/20">
          <p className="text-xs text-success mb-1">Disponibles</p>
          <p className="text-2xl font-bold text-success">{drivers.filter(d => d.availability === "Disponible").length}</p>
        </div>
        <div className="p-4 bg-info/10 rounded-lg border border-info/20">
          <p className="text-xs text-info mb-1">En livraison</p>
          <p className="text-2xl font-bold text-info">{drivers.filter(d => d.availability === "En livraison").length}</p>
        </div>
        <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
          <p className="text-xs text-warning mb-1">En pause</p>
          <p className="text-2xl font-bold text-warning">{drivers.filter(d => d.availability === "En pause").length}</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDrivers;
