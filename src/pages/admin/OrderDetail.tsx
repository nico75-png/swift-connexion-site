import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Edit, MapPin, Phone, User } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import Timeline from "@/components/dashboard/Timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

/**
 * Page admin - Détail d'une commande
 * Timeline modifiable, affectation chauffeur, notes internes, historique
 */
const AdminOrderDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [notes, setNotes] = useState("Client préfère les livraisons en matinée");
  const [currentStatus, setCurrentStatus] = useState("En cours");

  // Mock data
  const order = {
    id: id || "CMD-247",
    date: "2025-01-15 14:30",
    client: "Cabinet Dupont",
    type: "Express",
    status: currentStatus,
    pickup: "12 rue de la Paix, 75002 Paris",
    delivery: "45 avenue des Champs-Élysées, 75008 Paris",
    weight: "2.5 kg",
    volume: "0.05 m³",
    instructions: "Sonnez à l'interphone, code 1234",
    amount: 45.50,
    driver: {
      name: "Marc Dubois",
      phone: "06 12 34 56 78",
      vehicle: "Renault Kangoo - AB-123-CD",
      zone: "Paris Centre",
    },
  };

  const activityLog = [
    { date: "2025-01-15 14:30", user: "Système", action: "Commande créée", details: "Création automatique via formulaire client" },
    { date: "2025-01-15 14:35", user: "Admin Sophie", action: "Chauffeur affecté", details: "Marc D. affecté à la commande" },
    { date: "2025-01-15 14:45", user: "Marc D.", action: "Statut modifié", details: "Enlevé → En cours" },
    { date: "2025-01-15 14:50", user: "Admin Sophie", action: "Note ajoutée", details: "Client préfère les livraisons en matinée" },
  ];

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    toast({
      title: "Statut mis à jour",
      description: `La commande est maintenant "${newStatus}"`,
    });
  };

  const handleSaveNotes = () => {
    toast({
      title: "Notes enregistrées",
      description: "Les notes internes ont été mises à jour.",
    });
  };

  const handleDownloadPDF = (type: string) => {
    toast({
      title: "Téléchargement",
      description: `${type} en cours de génération...`,
    });
  };

  return (
    <DashboardLayout
      sidebar={<AdminSidebar />}
      topbar={<Topbar title={`Commande ${order.id}`} />}
    >
      {/* Header avec retour */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin/commandes">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux commandes
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleDownloadPDF("Bon de commande")}>
            <Download className="h-4 w-4 mr-2" />
            Bon de commande
          </Button>
          <Button variant="outline" onClick={() => handleDownloadPDF("Preuve de livraison")}>
            <Download className="h-4 w-4 mr-2" />
            Preuve livraison
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Détails de la commande */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Détails de la commande</CardTitle>
                <Badge variant="outline" className="text-base px-4 py-1">
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Client</p>
                  <p className="font-semibold">{order.client}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date & Heure</p>
                  <p className="font-semibold">{order.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Type de transport</p>
                  <Badge variant="outline">{order.type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Montant</p>
                  <p className="text-2xl font-bold text-primary">{order.amount}€</p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-4">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Départ</p>
                    <p className="font-medium">{order.pickup}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-success flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Arrivée</p>
                    <p className="font-medium">{order.delivery}</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Poids</p>
                  <p className="font-medium">{order.weight}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Volume</p>
                  <p className="font-medium">{order.volume}</p>
                </div>
              </div>

              {order.instructions && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Instructions</p>
                  <p className="font-medium">{order.instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Timeline de la commande</CardTitle>
                <Select value={currentStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En attente">En attente</SelectItem>
                    <SelectItem value="Enlevé">Enlevé</SelectItem>
                    <SelectItem value="En cours">En cours</SelectItem>
                    <SelectItem value="Livré">Livré</SelectItem>
                    <SelectItem value="Annulé">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Timeline
                steps={[
                  { label: "En attente", time: "2025-01-15 14:30", status: "done" },
                  { label: "Enlevé", time: "2025-01-15 14:45", status: "done" },
                  { label: "En cours", time: "2025-01-15 15:00", status: "current" },
                  { label: "Livré", time: "", status: "pending" },
                ]}
              />
            </CardContent>
          </Card>

          {/* Journal d'activité */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle>Journal d'activité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLog.map((log, i) => (
                  <div key={i} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Edit className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold">{log.action}</p>
                        <p className="text-xs text-muted-foreground">{log.date}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{log.details}</p>
                      <p className="text-xs text-muted-foreground">Par {log.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Chauffeur affecté */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Chauffeur affecté
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Nom</p>
                <p className="font-semibold">{order.driver.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Téléphone</p>
                <a href={`tel:${order.driver.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                  <Phone className="h-4 w-4" />
                  {order.driver.phone}
                </a>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Véhicule</p>
                <p className="font-medium">{order.driver.vehicle}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Zone</p>
                <Badge variant="outline">{order.driver.zone}</Badge>
              </div>
              <Button className="w-full" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Changer de chauffeur
              </Button>
            </CardContent>
          </Card>

          {/* Notes internes */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle>Notes internes (admin)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajoutez des notes sur cette commande..."
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
              <Button variant="outline" className="w-full justify-start">
                Dupliquer la commande
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Contacter le client
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                Annuler la commande
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminOrderDetail;
