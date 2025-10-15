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
  reconcileGlobalOrderSeq,
} from "@/lib/orderSequence";
import { getOrders, saveOrders, type Order } from "@/lib/stores/driversOrders.store";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/stores/auth.store";

interface CreateOrderButtonProps {
  className?: string;
}

const INITIAL_FORM = {
  type: "",
  pickup: "",
  delivery: "",
  date: "",
  time: "",
  weight: "",
  volume: "",
  notes: "",
};

/**
 * Bouton pour créer une commande (admin)
 * Ouvre un dialog avec formulaire
 */
const CreateOrderButton = ({ className }: CreateOrderButtonProps) => {
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { currentClient } = useAuth();

  useEffect(() => {
    if (!open) {
      setFormValues(INITIAL_FORM);
      setShowInstructions(false);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleChange = (field: keyof typeof INITIAL_FORM) => (value: string) => {
    setFormValues((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentClient) {
      toast({
        title: "Erreur",
        description: "Aucun client connecté",
        variant: "destructive",
      });
      return;
    }

    const requiredFields: Array<keyof typeof INITIAL_FORM> = [
      "type",
      "pickup",
      "delivery",
      "date",
      "time",
      "weight",
      "volume",
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

    // Validation poids et volume > 0
    const weightKg = Number.parseFloat(formValues.weight);
    const volumeM3 = Number.parseFloat(formValues.volume);
    
    if (weightKg <= 0 || Number.isNaN(weightKg)) {
      toast({
        title: "Poids invalide",
        description: "Le poids doit être supérieur à 0 kg.",
        variant: "destructive",
      });
      return;
    }
    
    if (volumeM3 <= 0 || Number.isNaN(volumeM3)) {
      toast({
        title: "Volume invalide",
        description: "Le volume doit être supérieur à 0 m³.",
        variant: "destructive",
      });
      return;
    }

    // Validation date/heure future
    const scheduleStart = new Date(`${formValues.date}T${formValues.time}`);
    if (Number.isNaN(scheduleStart.getTime())) {
      toast({
        title: "Date/heure invalide",
        description: "Veuillez saisir une date et une heure valides.",
        variant: "destructive",
      });
      return;
    }
    
    if (scheduleStart.getTime() <= Date.now()) {
      toast({
        title: "Date/heure invalide",
        description: "La date et l'heure doivent être dans le futur.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const orders = getOrders();
      const id = generateNextOrderNumber();
      assertUniqueOrderIdOrThrow(id);

      const scheduleEnd = new Date(scheduleStart.getTime() + 60 * 60 * 1000);
      const amount = Number((25 + weightKg * 1.5 + volumeM3 * 4).toFixed(2));

      const newOrder: Order = {
        id,
        client: currentClient.company,
        type: formValues.type,
        status: "En attente",
        amount,
        schedule: {
          start: scheduleStart.toISOString(),
          end: scheduleEnd.toISOString(),
        },
        pickupAddress: formValues.pickup,
        dropoffAddress: formValues.delivery,
        zoneRequirement: "INTRA_PARIS",
        volumeRequirement: `${volumeM3.toFixed(2)} m³`,
        weight: `${weightKg.toFixed(1)} kg`,
        instructions: formValues.notes?.trim() || undefined,
        driverId: null,
        driverAssignedAt: null,
      };

      saveOrders([newOrder, ...orders]);
      reconcileGlobalOrderSeq();

      toast({
        title: "Commande créée",
        description: `Commande ${newOrder.id} enregistrée avec succès.`,
      });

      setOpen(false);
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
          <DialogTitle>Créer une commande</DialogTitle>
          <DialogDescription>
            Renseignez les informations de votre transport
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations client en lecture seule */}
          {currentClient && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Nom de la société</label>
                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium">
                  {currentClient.company}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">N° SIRET</label>
                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium">
                  {currentClient.siret}
                </div>
              </div>
            </div>
          )}


          {/* Type de transport */}
          <div>
            <Label htmlFor="type">Type de transport *</Label>
            <Select value={formValues.type} onValueChange={handleChange("type")}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Sélectionnez" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medical">Médical</SelectItem>
                <SelectItem value="juridique">Juridique</SelectItem>
                <SelectItem value="optique">Optique</SelectItem>
                <SelectItem value="express">Express</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
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

          {/* Poids et Volume */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Poids (kg) *</Label>
              <Input
                id="weight"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0.1"
                placeholder="0,5"
                value={formValues.weight}
                onChange={(event) => handleChange("weight")(event.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="volume">Volume (m³) *</Label>
              <Input
                id="volume"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                placeholder="0,20"
                value={formValues.volume}
                onChange={(event) => handleChange("volume")(event.target.value)}
                required
              />
            </div>
          </div>

          {/* Instructions particulières */}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
              disabled={isSubmitting}
            >
              {showInstructions ? "Masquer" : "Ajouter"} instructions particulières
            </Button>
            {showInstructions && (
              <div className="mt-4">
                <Label htmlFor="notes">Instructions pour le chauffeur</Label>
                <Textarea
                  id="notes"
                  placeholder="Indications d'accès, codes, consignes spécifiques..."
                  rows={4}
                  value={formValues.notes}
                  onChange={(event) => handleChange("notes")(event.target.value)}
                />
              </div>
            )}
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
