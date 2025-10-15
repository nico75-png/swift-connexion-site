import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  assertUniqueOrderIdOrThrow,
  generateNextOrderNumber,
  previewNextOrderNumber,
  reconcileGlobalOrderSeq,
} from "@/lib/orderSequence";
import { getOrders, saveOrders, type Order } from "@/lib/stores/driversOrders.store";
import { cn } from "@/lib/utils";

interface CreateOrderButtonProps {
  className?: string;
}

const INITIAL_FORM = {
  client: "",
  type: "",
  pickup: "",
  delivery: "",
  date: "",
  time: "",
  weight: "",
  volume: "",
  driver: "auto",
  notes: "",
};

/**
 * Bouton pour créer une commande (admin)
 * Ouvre un dialog avec formulaire
 */
const CreateOrderButton = ({ className }: CreateOrderButtonProps) => {
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setPreviewId(previewNextOrderNumber());
    } else {
      setFormValues(INITIAL_FORM);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleChange = (field: keyof typeof INITIAL_FORM) => (value: string) => {
    setFormValues((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const requiredFields: Array<keyof typeof INITIAL_FORM> = [
      "client",
      "type",
      "pickup",
      "delivery",
      "date",
      "time",
    ];
    const missing = requiredFields.filter((field) => !formValues[field]?.trim());
    if (missing.length > 0) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const orders = getOrders();
      const id = generateNextOrderNumber();
      assertUniqueOrderIdOrThrow(id);

      const scheduleStart = new Date(`${formValues.date}T${formValues.time}`);
      const safeStart = Number.isNaN(scheduleStart.getTime()) ? new Date() : scheduleStart;
      const scheduleEnd = new Date(safeStart.getTime() + 60 * 60 * 1000);

      const weightKg = Number.parseFloat(formValues.weight) || 0;
      const volumeM3 = Number.parseFloat(formValues.volume) || 0;
      const driverId = formValues.driver !== "auto" ? formValues.driver : null;
      const amount = Number((25 + weightKg * 1.5 + volumeM3 * 4).toFixed(2));

      const newOrder: Order = {
        id,
        client: formValues.client,
        type: formValues.type,
        status: driverId ? "En cours" : "En attente",
        amount,
        schedule: {
          start: safeStart.toISOString(),
          end: scheduleEnd.toISOString(),
        },
        pickupAddress: formValues.pickup,
        dropoffAddress: formValues.delivery,
        zoneRequirement: "INTRA_PARIS",
        volumeRequirement: volumeM3 > 0 ? `${volumeM3.toFixed(2)} m³` : "1 m³",
        weight: weightKg > 0 ? `${weightKg.toFixed(1)} kg` : "— kg",
        instructions: formValues.notes?.trim() || undefined,
        driverId,
        driverAssignedAt: driverId ? new Date().toISOString() : null,
      };

      saveOrders([newOrder, ...orders]);
      reconcileGlobalOrderSeq();

      toast({
        title: "Commande créée",
        description: driverId
          ? `Commande ${newOrder.id} créée et assignée automatiquement.`
          : `Commande ${newOrder.id} enregistrée. Affectez un chauffeur ultérieurement.`,
      });

      setOpen(false);
      setPreviewId(previewNextOrderNumber());
      setFormValues(INITIAL_FORM);
    } catch (error) {
      console.error("Failed to create order", error);
      toast({
        title: "Échec de la création",
        description:
          error instanceof Error ? error.message : "Impossible de créer la commande. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="cta" className={cn(className)}>
          <Plus className="h-4 w-4 mr-2" />
          Créer une commande
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une commande pour un client</DialogTitle>
          <DialogDescription>
            Remplissez les informations de la commande
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="order-id">N° commande</Label>
            <Input
              id="order-id"
              value={previewId ?? "Auto"}
              readOnly
              className="font-mono"
              aria-readonly="true"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Le numéro est attribué automatiquement lors de l'enregistrement.
            </p>
          </div>

          {/* Sélection client */}
          <div>
            <Label htmlFor="client">Client *</Label>
            <Select value={formValues.client} onValueChange={handleChange("client")}>
              <SelectTrigger id="client">
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cabinet Dupont">Cabinet Dupont</SelectItem>
                <SelectItem value="Optique Vision">Optique Vision</SelectItem>
                <SelectItem value="Lab Médical">Lab Médical</SelectItem>
                <SelectItem value="Avocat & Associés">Avocat & Associés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type de transport */}
          <div>
            <Label htmlFor="type">Type de transport *</Label>
            <Select value={formValues.type} onValueChange={handleChange("type")}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Express">Express</SelectItem>
                <SelectItem value="Fragile">Fragile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Départ */}
            <div>
              <Label htmlFor="pickup">Adresse de départ *</Label>
              <Input
                id="pickup"
                placeholder="Adresse complète"
                value={formValues.pickup}
                onChange={(event) => handleChange("pickup")(event.target.value)}
                required
              />
            </div>

            {/* Arrivée */}
            <div>
              <Label htmlFor="delivery">Adresse de livraison *</Label>
              <Input
                id="delivery"
                placeholder="Adresse complète"
                value={formValues.delivery}
                onChange={(event) => handleChange("delivery")(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formValues.date}
                onChange={(event) => handleChange("date")(event.target.value)}
                required
              />
            </div>

            {/* Heure */}
            <div>
              <Label htmlFor="time">Heure *</Label>
              <Input
                id="time"
                type="time"
                value={formValues.time}
                onChange={(event) => handleChange("time")(event.target.value)}
                required
              />
            </div>
          </div>

          {/* Options */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="weight">Poids (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="Ex: 2.5"
                value={formValues.weight}
                onChange={(event) => handleChange("weight")(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="volume">Volume (m³)</Label>
              <Input
                id="volume"
                type="number"
                step="0.01"
                placeholder="Ex: 0.05"
                value={formValues.volume}
                onChange={(event) => handleChange("volume")(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="driver">Affecter chauffeur</Label>
              <Select value={formValues.driver} onValueChange={handleChange("driver")}>
                <SelectTrigger id="driver">
                  <SelectValue placeholder="Auto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automatique</SelectItem>
                  <SelectItem value="DRV-101">Marc Dubois</SelectItem>
                  <SelectItem value="DRV-102">Julie Lambert</SelectItem>
                  <SelectItem value="DRV-104">Pierre Martin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <Label htmlFor="notes">Instructions particulières</Label>
            <Textarea
              id="notes"
              placeholder="Notes pour le chauffeur..."
              rows={3}
              value={formValues.notes}
              onChange={(event) => handleChange("notes")(event.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="cta" disabled={isSubmitting}>
              Créer la commande
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrderButton;
