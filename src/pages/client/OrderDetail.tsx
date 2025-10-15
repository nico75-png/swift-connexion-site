import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import Timeline from "@/components/dashboard/Timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, MapPin, Phone, MessageSquare, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Page de détail d'une commande
 * Timeline, infos chauffeur, carte, documents
 */
const ClientOrderDetail = () => {
  const order = {
    id: "009",
    date: "15/01/2025",
    type: "Document juridique",
    from: "123 Avenue de Paris, 75001 Paris",
    to: "45 Rue du Commerce, 92100 Boulogne",
    status: "En cours",
    statusColor: "info",
    price: 45.50,
    driver: {
      name: "Marc Dupuis",
      phone: "06 12 34 56 78",
      vehicle: "Renault Kangoo - AB-123-CD",
    },
    timeline: [
      { label: "Commande validée", time: "15/01/2025 10:30", status: "done" as const },
      { label: "Coursier assigné", time: "15/01/2025 10:45", status: "done" as const },
      { label: "Enlèvement effectué", time: "15/01/2025 11:15", status: "done" as const },
      { label: "En transit", time: "15/01/2025 11:30", status: "current" as const },
      { label: "Livraison", time: "12:00 (estimé)", status: "pending" as const },
    ],
    priceBreakdown: {
      base: 25.00,
      distance: 15.50,
      express: 5.00,
      total: 45.50,
    },
  };

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={<Topbar userName="Jean Dupont" />}
    >
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Commande {order.id}</h1>
            <p className="text-muted-foreground">{order.type} • {order.date}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Recommander
            </Button>
            <Button variant="cta">
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
          </div>
        </div>

        {/* Statut */}
        <Card className="border-2 border-info/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Statut actuel</p>
                <Badge className="bg-info/10 text-info border-info/20 text-base px-4 py-2">
                  {order.status}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Livraison estimée</p>
                <p className="text-xl font-bold">12:00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline de livraison</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline steps={order.timeline} />
            </CardContent>
          </Card>

          {/* Carte itinéraire */}
          <Card>
            <CardHeader>
              <CardTitle>Itinéraire</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Carte interactive</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-success mb-1">📍 Départ</p>
                  <p className="text-sm text-muted-foreground">{order.from}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary mb-1">📍 Arrivée</p>
                  <p className="text-sm text-muted-foreground">{order.to}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Informations chauffeur */}
          <Card>
            <CardHeader>
              <CardTitle>Chauffeur assigné</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Nom</p>
                <p className="font-medium">{order.driver.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Véhicule</p>
                <p className="font-medium">{order.driver.vehicle}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Téléphone</p>
                <a href={`tel:${order.driver.phone}`} className="font-medium text-primary hover:underline flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {order.driver.phone}
                </a>
              </div>
              <Button variant="cta" className="w-full" asChild>
                <Link to="/espace-client/messages?driver=Marc">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contacter le chauffeur
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Détail tarifaire */}
          <Card>
            <CardHeader>
              <CardTitle>Détail tarifaire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tarif de base</span>
                <span className="font-medium">{order.priceBreakdown.base.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance (17 km)</span>
                <span className="font-medium">{order.priceBreakdown.distance.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Option Express</span>
                <span className="font-medium">{order.priceBreakdown.express.toFixed(2)}€</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary">{order.priceBreakdown.total.toFixed(2)}€</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Bon de commande (PDF)
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <Download className="h-4 w-4 mr-2" />
              Preuve de livraison (disponible après livraison)
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientOrderDetail;
