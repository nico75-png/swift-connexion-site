import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const AdminStats = () => {
  const sectorData = [
    { name: "Santé", value: 0 },
    { name: "Juridique", value: 0 },
    { name: "Optique", value: 0 },
    { name: "B2B", value: 0 },
  ];

  const COLORS = ["hsl(var(--success))", "hsl(var(--primary))", "hsl(var(--info))", "hsl(var(--warning))"];

  return (
    <DashboardLayout sidebar={<AdminSidebar />} topbar={<Topbar title="Statistiques" />}>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Statistiques détaillées</h1>
        <Button variant="cta"><Download className="h-4 w-4 mr-2" />Export CSV</Button>
      </div>

      <div className="grid gap-6">
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
