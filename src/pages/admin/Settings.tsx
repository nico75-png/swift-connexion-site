import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const AdminSettings = () => {
  return (
    <DashboardLayout sidebar={<AdminSidebar />} topbar={<Topbar title="Paramètres" />}>
      <h1 className="text-3xl font-bold mb-6">Paramètres</h1>
      
      <div className="grid gap-6 max-w-4xl">
        <Card className="border-none shadow-soft">
          <CardHeader><CardTitle>Zones desservies</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Paris, Petite Couronne, Grande Couronne.</p>
            <p className="text-primary">
              Information : les zones n'imposent aucune restriction d'affectation. Tous les chauffeurs couvrent toutes les zones.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft">
          <CardHeader><CardTitle>Apparence</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Thème sombre</Label>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Button variant="cta" className="w-fit">Enregistrer les modifications</Button>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
