import { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MapPin, Bell, Settings as SettingsIcon, Trash2, Plus, Moon, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/stores/auth.store";
import { SECTOR_LABELS, type Sector } from "@/lib/packageTaxonomy";

/**
 * Page des préférences utilisateur
 * Adresses favorites, notifications, paramètres d'affichage
 */
const ClientPreferences = () => {
  const { currentClient } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [addresses, setAddresses] = useState([
    { id: "1", name: "Siège social", address: "123 Avenue de Paris, 75001 Paris" },
    { id: "2", name: "Entrepôt", address: "45 Rue du Commerce, 92100 Boulogne" },
  ]);
  const [newAddressName, setNewAddressName] = useState("");
  const [newAddressLine, setNewAddressLine] = useState("");

  const sector = useMemo(() => currentClient?.sector as Sector | undefined, [currentClient?.sector]);
  const sectorLabel = sector ? SECTOR_LABELS[sector] ?? sector : "Non défini";

  const handleSave = () => {
    toast.success("Préférences enregistrées");
  };

  const handleAddAddress = () => {
    if (!newAddressName.trim() || !newAddressLine.trim()) {
      toast.error("Veuillez renseigner un libellé et une adresse");
      return;
    }

    const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `addr-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setAddresses((prev) => [
      ...prev,
      {
        id,
        name: newAddressName.trim(),
        address: newAddressLine.trim(),
      },
    ]);
    setNewAddressName("");
    setNewAddressLine("");
    toast.success("Adresse ajoutée");
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
    toast.success("Adresse supprimée");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
    toast.success(darkMode ? "Mode clair activé" : "Mode sombre activé");
  };

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={<Topbar userName={currentClient?.contactName ?? "Client"} />}
    >
      <div className="max-w-3xl space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Préférences</h1>
          <p className="text-muted-foreground">Personnalisez votre expérience</p>
        </div>

        {/* Secteur d'activité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Secteur d'activité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Votre secteur</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Définit les types de colis disponibles lors de la création de commandes
              </p>
              <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3">
                <p className="font-medium">{sectorLabel}</p>
                <p className="text-xs text-muted-foreground">
                  Pour toute modification, merci de contacter notre support client.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adresses favorites */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Adresses favorites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="p-4 bg-muted/30 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium">{addr.name}</p>
                  <p className="text-sm text-muted-foreground">{addr.address}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteAddress(addr.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <div className="grid gap-3 rounded-lg border border-dashed border-muted-foreground/40 p-4">
              <div className="grid gap-2">
                <Label>Libellé</Label>
                <Input value={newAddressName} onChange={(event) => setNewAddressName(event.target.value)} placeholder="Ex : Cabinet secondaire" />
              </div>
              <div className="grid gap-2">
                <Label>Adresse complète</Label>
                <Input
                  value={newAddressLine}
                  onChange={(event) => setNewAddressLine(event.target.value)}
                  placeholder="Ex : 12 Rue de Lyon, 75012 Paris"
                />
              </div>
              <Button variant="outline" className="w-full" onClick={handleAddAddress}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une adresse
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications par email</Label>
                <p className="text-sm text-muted-foreground">Recevez les mises à jour par email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>SMS de suivi</Label>
                <p className="text-sm text-muted-foreground">Recevez des SMS pour le suivi</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications push</Label>
                <p className="text-sm text-muted-foreground">Notifications en temps réel</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Paramètres de transport */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Paramètres de transport
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Type de transport par défaut</Label>
              <Select defaultValue="express">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Médical</SelectItem>
                  <SelectItem value="juridique">Juridique</SelectItem>
                  <SelectItem value="optique">Optique</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mode d'affichage des commandes</Label>
              <Select defaultValue="extended">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="extended">Étendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Apparence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Apparence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label>Mode sombre</Label>
                <p className="text-sm text-muted-foreground">Activer le thème sombre</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="cta" onClick={handleSave}>
            Enregistrer les préférences
          </Button>
          <Button variant="outline">
            Annuler
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientPreferences;
