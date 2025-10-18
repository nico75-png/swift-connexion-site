import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, User, Settings, MapPin, Download, CheckCircle2, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuthProfile } from "@/providers/AuthProvider";

const EspaceClient = () => {
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const { resolvedDisplayName, fallbackEmail } = useAuthProfile();
  const welcomeName = resolvedDisplayName ?? fallbackEmail ?? "";

  const stats: Array<{ label: string; value: string | number; icon: LucideIcon; color?: string }> = [];

  const orders: Array<{
    id: string;
    date: string;
    type: string;
    from: string;
    to: string;
    status: string;
    statusColor: "info" | "success" | "warning";
    price: number;
    timeline?: Array<{ step: string; time: string; done: boolean }>;
  }> = [];

  const frequentAddresses: Array<{ name: string; address: string }> = [];

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      info: "bg-info/10 text-info border-info/20",
      success: "bg-success/10 text-success border-success/20",
      warning: "bg-warning/10 text-warning border-warning/20",
    };
    return colors[color] || colors.info;
  };

  return (
    <Layout>
      <section className="py-8 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="mb-2">Espace Client</h1>
          <p className="text-primary-foreground/80">
            Bienvenue{welcomeName ? `, ${welcomeName}` : ""}
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {stats.length === 0 ? (
              <Card className="border-dashed border-muted-foreground/40 bg-transparent text-center shadow-none md:col-span-3">
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Aucune statistique disponible pour vos commandes.
                </CardContent>
              </Card>
            ) : (
              stats.map((stat, index) => (
                <Card key={index} className="border-none shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                      </div>
                      <stat.icon className={`h-10 w-10 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="commandes" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="commandes">Commandes</TabsTrigger>
              <TabsTrigger value="profil">Profil</TabsTrigger>
              <TabsTrigger value="factures">Factures</TabsTrigger>
            </TabsList>

            {/* Commandes Tab */}
            <TabsContent value="commandes" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <h2>Mes commandes</h2>
                <div className="flex gap-3">
                  <Button variant="cta" asChild>
                    <Link to="/commande-sans-compte">Nouvelle commande</Link>
                  </Button>
                </div>
              </div>

              <Card className="border-none shadow-soft">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="text-left p-4 text-sm font-semibold">N° Commande</th>
                          <th className="text-left p-4 text-sm font-semibold">Date</th>
                          <th className="text-left p-4 text-sm font-semibold">Type</th>
                          <th className="text-left p-4 text-sm font-semibold">Trajet</th>
                          <th className="text-left p-4 text-sm font-semibold">Statut</th>
                          <th className="text-right p-4 text-sm font-semibold">Prix</th>
                          <th className="text-right p-4 text-sm font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-6 text-center text-sm text-muted-foreground">
                              Aucune commande enregistrée pour le moment.
                            </td>
                          </tr>
                        ) : (
                          orders.map((order, index) => (
                            <tr key={order.id} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="p-4 font-mono text-sm">{order.id}</td>
                              <td className="p-4 text-sm text-muted-foreground">{order.date}</td>
                              <td className="p-4 text-sm">{order.type}</td>
                              <td className="p-4 text-sm text-muted-foreground">
                                {order.from} → {order.to}
                              </td>
                              <td className="p-4">
                                <Badge className={getStatusColor(order.statusColor)}>
                                  {order.status}
                                </Badge>
                              </td>
                              <td className="p-4 text-right font-semibold">{order.price.toFixed(2)}€</td>
                              <td className="p-4">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedOrder(selectedOrder === index ? null : index)}
                                    disabled={!order.timeline || order.timeline.length === 0}
                                  >
                                    Détails
                                  </Button>
                                  {order.status === "Livré" && (
                                    <Button variant="ghost" size="sm">
                                      <RotateCcw className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Order Details */}
              {selectedOrder !== null && orders[selectedOrder]?.timeline && (
                <Card className="border-2 border-primary/20 shadow-medium animate-fade-in">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold">Détails de la commande {orders[selectedOrder].id}</h3>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger PDF
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-semibold mb-4">Timeline</h4>
                        {orders[selectedOrder]?.timeline?.length ? (
                          <div className="space-y-4">
                            {orders[selectedOrder]?.timeline?.map((step, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <div
                                  className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    step.done ? "bg-success text-white" : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {step.done ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                </div>
                                <div>
                                  <p className={`font-medium ${step.done ? "" : "text-muted-foreground"}`}>
                                    {step.step}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{step.time}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="rounded-lg border border-dashed border-muted-foreground/40 p-4 text-sm text-muted-foreground">
                            Aucun détail de suivi disponible.
                          </p>
                        )}
                      </div>

                      <div>
                        <h4 className="font-semibold mb-4">Carte d'itinéraire</h4>
                        <div className="h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <MapPin className="h-12 w-12 mx-auto mb-2" />
                            <p className="text-sm">Carte interactive</p>
                            <p className="text-xs">{orders[selectedOrder].from} → {orders[selectedOrder].to}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Profil Tab */}
            <TabsContent value="profil" className="space-y-6">
              <h2>Mon profil</h2>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <User className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-semibold">Informations</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Nom complet</label>
                        <input
                          type="text"
                          defaultValue={welcomeName}
                          className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Entreprise</label>
                        <input
                          type="text"
                          className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Email</label>
                        <input
                          type="email"
                          defaultValue={fallbackEmail ?? ""}
                          className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Téléphone</label>
                        <input
                          type="tel"
                          defaultValue="01 23 45 67 89"
                          className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                        />
                      </div>
                      <Button variant="cta" className="w-full">Sauvegarder</Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="border-none shadow-soft">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <MapPin className="h-6 w-6 text-primary" />
                        <h3 className="text-xl font-semibold">Adresses fréquentes</h3>
                      </div>
                      <div className="space-y-3">
                        {frequentAddresses.length === 0 ? (
                          <p className="rounded-lg border border-dashed border-muted-foreground/40 p-3 text-sm text-muted-foreground">
                            Aucune adresse favorite enregistrée.
                          </p>
                        ) : (
                          frequentAddresses.map((addr, i) => (
                            <div key={i} className="p-3 bg-muted/30 rounded-lg">
                              <p className="font-medium">{addr.name}</p>
                              <p className="text-sm text-muted-foreground">{addr.address}</p>
                            </div>
                          ))
                        )}
                        <Button variant="outline" className="w-full">Ajouter une adresse</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-soft">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Settings className="h-6 w-6 text-primary" />
                        <h3 className="text-xl font-semibold">Préférences</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Notifications email</span>
                          <input type="checkbox" defaultChecked className="h-4 w-4" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">SMS de suivi</span>
                          <input type="checkbox" defaultChecked className="h-4 w-4" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Mode sombre</span>
                          <input type="checkbox" className="h-4 w-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Factures Tab */}
            <TabsContent value="factures" className="space-y-6">
              <h2>Mes factures</h2>

              <Card className="border-none shadow-soft">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="text-left p-4 text-sm font-semibold">N° Facture</th>
                          <th className="text-left p-4 text-sm font-semibold">Date</th>
                          <th className="text-left p-4 text-sm font-semibold">Commandes</th>
                          <th className="text-right p-4 text-sm font-semibold">Montant</th>
                          <th className="text-left p-4 text-sm font-semibold">Statut</th>
                          <th className="text-right p-4 text-sm font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                            Aucune facture disponible pour le moment.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default EspaceClient;
