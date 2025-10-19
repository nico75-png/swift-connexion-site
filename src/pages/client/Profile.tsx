import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Building2, Phone, Mail, Key } from "lucide-react";
import { toast } from "sonner";
import { useAuthProfile } from "@/providers/AuthProvider";
import { upsertProfile } from "@/lib/api/profiles";
import { fetchClientProfileByUserId, upsertClientProfile } from "@/lib/api/client-profiles";
import type { ClientProfile } from "@/lib/api/client-profiles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Page de profil utilisateur avec informations société
 */
const ClientProfile = () => {
  const { profile, session, refreshProfile, resolvedDisplayName, fallbackEmail, isRefreshingProfile } = useAuthProfile();
  const [firstName, setFirstName] = useState(profile?.first_name ?? "");
  const [lastName, setLastName] = useState(profile?.last_name ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingClientProfile, setIsLoadingClientProfile] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [siret, setSiret] = useState("");
  const [sector, setSector] = useState<ClientProfile["sector"] | "">("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  useEffect(() => {
    setFirstName(profile?.first_name ?? "");
    setLastName(profile?.last_name ?? "");
  }, [profile?.first_name, profile?.last_name]);

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    let ignore = false;
    setIsLoadingClientProfile(true);

    fetchClientProfileByUserId(session.user.id)
      .then((data) => {
        if (ignore || !data) {
          return;
        }

        setCompanyName(data.company ?? "");
        setSiret(data.siret ?? "");
        setSector(data.sector ?? "");
        setPickupAddress(data.default_pickup_address ?? "");
        setDeliveryAddress(data.default_delivery_address ?? "");
      })
      .catch((error) => {
        console.error("Failed to load client profile", error);
        toast.error("Impossible de charger les informations société");
      })
      .finally(() => {
        if (!ignore) {
          setIsLoadingClientProfile(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [session?.user?.id]);

  const displayEmail = fallbackEmail ?? "";
  const displayName = resolvedDisplayName ?? displayEmail ?? "";

  const sectorOptions: { value: ClientProfile["sector"]; label: string }[] = [
    { value: "MEDICAL", label: "Médical" },
    { value: "OPTIQUE", label: "Optique" },
    { value: "JURIDIQUE", label: "Juridique" },
    { value: "B2B", label: "B2B" },
    { value: "EVENT", label: "Événementiel" },
  ];

  const handleSave = async () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedCompany = companyName.trim();
    const trimmedSiret = siret.trim();
    const trimmedPickup = pickupAddress.trim();
    const trimmedDelivery = deliveryAddress.trim();
    const selectedSector = sector as ClientProfile["sector"] | "";

    if (!session?.user) {
      toast.error("Impossible de mettre à jour le profil sans session active");
      return;
    }

    if (!trimmedFirst || !trimmedLast) {
      toast.error("Veuillez renseigner votre prénom et votre nom");
      return;
    }

    if (!trimmedCompany || !trimmedSiret || !selectedSector) {
      toast.error("Veuillez renseigner les informations société obligatoires");
      return;
    }

    setIsSaving(true);

    try {
      const normalizedSector = selectedSector as ClientProfile["sector"];
      await upsertProfile({
        userId: session.user.id,
        firstName: trimmedFirst,
        lastName: trimmedLast,
      });
      const updatedClientProfile = await upsertClientProfile({
        userId: session.user.id,
        contactName: `${trimmedFirst} ${trimmedLast}`.trim(),
        company: trimmedCompany,
        siret: trimmedSiret,
        sector: normalizedSector,
        defaultPickupAddress: trimmedPickup || null,
        defaultDeliveryAddress: trimmedDelivery || null,
      });
      if (updatedClientProfile) {
        setCompanyName(updatedClientProfile.company ?? trimmedCompany);
        setSiret(updatedClientProfile.siret ?? trimmedSiret);
        setSector(updatedClientProfile.sector ?? normalizedSector);
        setPickupAddress(updatedClientProfile.default_pickup_address ?? "");
        setDeliveryAddress(updatedClientProfile.default_delivery_address ?? "");
      }
      await refreshProfile();
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      const message = error instanceof Error ? error.message : "La mise à jour du profil a échoué.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = () => {
    toast.success("Un email de réinitialisation a été envoyé");
  };

  const isDisabled = isSaving || isRefreshingProfile || isLoadingClientProfile;
  const fullNamePreview = useMemo(() => `${firstName} ${lastName}`.trim(), [firstName, lastName]);

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={<Topbar userName={displayName} />}
      showProfileReminder
    >
      <div className="max-w-3xl space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Mon profil</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles
            {fullNamePreview ? ` — ${fullNamePreview}` : ""}
          </p>
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
                <Input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
              </div>
              <div>
                <Label>Nom</Label>
                <Input value={lastName} onChange={(event) => setLastName(event.target.value)} />
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input type="email" value={displayEmail} readOnly />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Téléphone
              </Label>
              <Input type="tel" placeholder="Ajouter un numéro" />
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
              <Input value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
            </div>
            <div>
              <Label>SIRET</Label>
              <Input value={siret} onChange={(event) => setSiret(event.target.value)} />
            </div>
            <div>
              <Label>Secteur d'activité</Label>
              <Select value={sector || undefined} onValueChange={(value) => setSector(value as ClientProfile["sector"])}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionné lors de l'inscription" />
                </SelectTrigger>
                <SelectContent>
                  {sectorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Adresse de prise en charge par défaut</Label>
              <Input value={pickupAddress} onChange={(event) => setPickupAddress(event.target.value)} placeholder="Ajouter votre adresse" />
            </div>
            <div>
              <Label>Adresse de livraison par défaut</Label>
              <Input value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder="Ajouter votre adresse" />
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
          <Button variant="cta" onClick={handleSave} disabled={isDisabled}>
            {isSaving ? "Enregistrement…" : "Enregistrer les modifications"}
          </Button>
          <Button variant="outline" disabled={isDisabled}>
            Annuler
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientProfile;
