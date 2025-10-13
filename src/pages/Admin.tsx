import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Package, TrendingUp, Activity } from "lucide-react";
import Layout from "@/components/layout/Layout";

const Admin = () => {
  const stats = [
    { label: "Clients", value: 156, icon: Users, color: "text-primary" },
    { label: "Commandes", value: 1247, icon: Package, color: "text-info" },
    { label: "CA Mensuel", value: "45.2K€", icon: TrendingUp, color: "text-success" },
    { label: "En cours", value: 23, icon: Activity, color: "text-warning" },
  ];

  const orders = [
    { id: "CMD-001", client: "Cabinet Dupont", status: "En cours", price: 45.50 },
    { id: "CMD-002", client: "Optique Vision", status: "Livré", price: 38.00 },
    { id: "CMD-003", client: "Lab Médical", status: "En attente", price: 52.00 },
  ];

  return (
    <Layout>
      <section className="py-8 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1>Administration</h1>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <Card key={i} className="border-none shadow-soft">
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
            ))}
          </div>

          <Card className="border-none shadow-soft">
            <CardContent className="p-6">
              <h2 className="mb-4">Commandes récentes</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold">N°</th>
                      <th className="text-left p-4 text-sm font-semibold">Client</th>
                      <th className="text-left p-4 text-sm font-semibold">Statut</th>
                      <th className="text-right p-4 text-sm font-semibold">Prix</th>
                      <th className="text-right p-4 text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, i) => (
                      <tr key={i} className="border-b hover:bg-muted/30">
                        <td className="p-4 font-mono text-sm">{order.id}</td>
                        <td className="p-4">{order.client}</td>
                        <td className="p-4">
                          <Badge>{order.status}</Badge>
                        </td>
                        <td className="p-4 text-right font-semibold">{order.price}€</td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm">Modifier</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Admin;
