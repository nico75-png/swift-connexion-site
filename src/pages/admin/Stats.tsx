import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const AdminStats = () => {
  const dailyOrders = [
    { day: "Lun", orders: 32 }, { day: "Mar", orders: 45 }, { day: "Mer", orders: 38 },
    { day: "Jeu", orders: 52 }, { day: "Ven", orders: 48 }, { day: "Sam", orders: 18 }, { day: "Dim", orders: 14 },
  ];

  const topClients = [
    { name: "Pharmacie C.", volume: 203, revenue: 7234 },
    { name: "Optique V.", volume: 132, revenue: 4896 },
    { name: "Lab Médical", volume: 89, revenue: 3456 },
  ];

  const sectorData = [
    { name: "Santé", value: 45 }, { name: "Juridique", value: 30 },
    { name: "Optique", value: 20 }, { name: "B2B", value: 5 },
  ];

  const COLORS = ["hsl(var(--success))", "hsl(var(--primary))", "hsl(var(--info))", "hsl(var(--warning))"];

  return (
    <DashboardLayout sidebar={<AdminSidebar />} topbar={<Topbar title="Statistiques" />}>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Statistiques détaillées</h1>
        <Button variant="cta"><Download className="h-4 w-4 mr-2" />Export CSV</Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-soft">
          <CardHeader><CardTitle>Commandes par jour</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft">
          <CardHeader><CardTitle>Top 3 clients</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topClients} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="volume" fill="hsl(var(--info))" name="Commandes" />
                <Bar dataKey="revenue" fill="hsl(var(--success))" name="CA (€)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft">
          <CardHeader><CardTitle>Répartition par secteur</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={sectorData} cx="50%" cy="50%" labelLine={false} label outerRadius={100} fill="#8884d8" dataKey="value">
                  {sectorData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminStats;
