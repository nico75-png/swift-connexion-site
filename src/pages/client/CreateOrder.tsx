import { FormEvent, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CreateOrder = () => {
  const currentClient = {
    name: "Jean Dupont",
    company: "One Optique",
    defaultPickupAddress: "123 Avenue de Paris, 75001 Paris",
    defaultDeliveryAddress: "45 Rue du Commerce, 92100 Boulogne",
  };

  const orderNumber = useMemo(() => {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
    const timePart = now.getTime().toString().slice(-4);
    return `CMD-${datePart}-${timePart}`;
  }, []);

  const [formData, setFormData] = useState({
    type: "",
    pickupAddress: currentClient.defaultPickupAddress,
    deliveryAddress: currentClient.defaultDeliveryAddress,
    date: "",
    time: "",
    weight: "",
    volume: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    window.setTimeout(() => {
      toast.success("Commande créée avec succès !", {
        description: "Vous recevrez une confirmation par email."
      });
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={<Topbar userName={currentClient.name} />}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Créer une commande</h1>
          <p className="text-muted-foreground">
            Renseignez les informations de transport pour {currentClient.company}.
          </p>
        </div>

        <Card className="relative">
          <div
            className="absolute top-6 right-6 text-right text-sm text-muted-foreground select-none pointer-events-none"
            aria-hidden="true"
          >
            <p className="uppercase tracking-wide text-xs">N° de commande</p>
            <p className="text-base font-semibold text-foreground">#{orderNumber}</p>
          </div>
          <CardHeader className="pr-36">
            <CardTitle>Informations de livraison</CardTitle>
            <CardDescription>
              Vos informations client sont préremplies. Renseignez uniquement les détails de transport nécessaires.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="type">Type de transport</Label>
                <Select
                  value={formData.type}
                  onValueChange={(type) => setFormData((prev) => ({ ...prev, type }))}
                >
                  <SelectTrigger id="type" aria-label="Type de transport">
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Médical</SelectItem>
                    <SelectItem value="juridique">Juridique</SelectItem>
                    <SelectItem value="optique">Optique</SelectItem>
                    <SelectItem value="express">Express</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickup">Adresse de départ</Label>
                <Input
                  id="pickup"
                  placeholder="Saisissez l'adresse de collecte"
                  value={formData.pickupAddress}
                  onChange={(event) => setFormData((prev) => ({ ...prev, pickupAddress: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery">Adresse de livraison</Label>
                <Input
                  id="delivery"
                  placeholder="Saisissez l'adresse de livraison"
                  value={formData.deliveryAddress}
                  onChange={(event) => setFormData((prev) => ({ ...prev, deliveryAddress: event.target.value }))}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(event) => setFormData((prev) => ({ ...prev, date: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Heure</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(event) => setFormData((prev) => ({ ...prev, time: event.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="weight">Poids estimé (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0.5"
                    value={formData.weight}
                    onChange={(event) => setFormData((prev) => ({ ...prev, weight: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="volume">Volume estimé (m³)</Label>
                  <Input
                    id="volume"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.20"
                    value={formData.volume}
                    onChange={(event) => setFormData((prev) => ({ ...prev, volume: event.target.value }))}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="cta" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Enregistrement..." : "Valider la commande"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateOrder;
