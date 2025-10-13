import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Building2, Phone, Mail, Key } from "lucide-react";
import { toast } from "sonner";

/**
 * Page de profil utilisateur avec informations société
 */
const ClientProfile = () => {
  const handleSave = () => {
    toast.success("Profil mis à jour avec succès");
  };

  const handleChangePassword = () => {
    toast.success("Un email de réinitialisation a été envoyé");
  };

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={<Topbar userName="Jean Dupont" />}
    >
      <div className="max-w-3xl space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Mon profil</h1>
          <p className="text-muted-foreground">Gérez vos informations personnelles</p>
        </div>

        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Prénom</Label>
                <Input defaultValue="Jean" />
              </div>
              <div>
                <Label>Nom</Label>
                <Input defaultValue="Dupont" />
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input type="email" defaultValue="jean.dupont@cabinet.fr" />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Téléphone
              </Label>
              <Input type="tel" defaultValue="01 23 45 67 89" />
            </div>
          </CardContent>
        </Card>

        {/* Informations société */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations société
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nom de l'entreprise</Label>
              <Input defaultValue="Cabinet Dupont & Associés" />
            </div>
            <div>
              <Label>SIRET</Label>
              <Input defaultValue="123 456 789 00012" />
            </div>
            <div>
              <Label>Secteur d'activité</Label>
              <Input defaultValue="Juridique" />
            </div>
            <div>
              <Label>Adresse</Label>
              <Input defaultValue="123 Avenue de Paris, 75001 Paris" />
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Mot de passe défini il y a 45 jours
              </p>
              <Button variant="outline" onClick={handleChangePassword}>
                Changer mon mot de passe
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="cta" onClick={handleSave}>
            Enregistrer les modifications
          </Button>
          <Button variant="outline">
            Annuler
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientProfile;
