import { useEffect, useState, useMemo } from "react";
import { Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { SECTOR_DISPLAY_MAP } from "@/lib/stores/data/adminOrderSeeds";

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
  const navigate = useNavigate();

  // Calcul du tarif estimé en temps réel
  const estimatedPrice = useMemo(() => {
    const weightKg = Number.parseFloat(formValues.weight) || 0;
    const volumeM3 = Number.parseFloat(formValues.volume) || 0;
    if (weightKg <= 0 && volumeM3 <= 0) return null;
    return Number((25 + weightKg * 1.5 + volumeM3 * 4).toFixed(2));
  }, [formValues.weight, formValues.volume]);

  // Validation des champs en temps réel
  const fieldValidation = useMemo(() => {
    const isDateTimeFuture = () => {
      if (!formValues.date || !formValues.time) return false;
      const scheduleStart = new Date(`${formValues.date}T${formValues.time}`);
      return !Number.isNaN(scheduleStart.getTime()) && scheduleStart.getTime() > Date.now();
    };

    return {
      type: !!formValues.type,
      pickup: !!formValues.pickup.trim(),
      delivery: !!formValues.delivery.trim(),
      date: !!formValues.date,
      time: !!formValues.time,
      dateTimeFuture: isDateTimeFuture(),
      weight: Number.parseFloat(formValues.weight) > 0,
      volume: Number.parseFloat(formValues.volume) > 0,
    };
  }, [formValues]);

  const isFormValid = Object.entries(fieldValidation).every(([key, valid]) => 
    key === "dateTimeFuture" ? valid : valid
  ) && fieldValidation.dateTimeFuture;

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

      const sectorLabel = currentClient?.sector
        ? SECTOR_DISPLAY_MAP[currentClient.sector.toUpperCase()] ?? "B2B Express"
        : "B2B Express";

      const newOrder: Order = {
        id,
        client: currentClient.company,
        sector: sectorLabel,
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
      
      // Redirection vers la page de détail de la commande
      navigate(`/dashboard-client/commandes/${newOrder.id}`);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une commande</DialogTitle>
          <DialogDescription>
            Renseignez les informations de votre transport
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1.5fr,1fr] gap-6">
          <div className="space-y-6">
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
              <Label htmlFor="type" className="flex items-center gap-2">
                Type de transport *
                {fieldValidation.type && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              </Label>
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
                <Label htmlFor="pickup" className="flex items-center gap-2">
                  Adresse de départ *
                  {fieldValidation.pickup && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                </Label>
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
                <Label htmlFor="delivery" className="flex items-center gap-2">
                  Adresse de livraison *
                  {fieldValidation.delivery && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                </Label>
                <Input
                  id="delivery"
                  placeholder="Adresse complète"
                  value={formValues.delivery}
                  onChange={(event) => handleChange("delivery")(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Date & Heure *
                {fieldValidation.dateTimeFuture ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (formValues.date && formValues.time && !fieldValidation.dateTimeFuture) ? (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                ) : null}
              </Label>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  id="date"
                  type="date"
                  value={formValues.date}
                  onChange={(event) => handleChange("date")(event.target.value)}
                  required
                />
                <Input
                  id="time"
                  type="time"
                  value={formValues.time}
                  onChange={(event) => handleChange("time")(event.target.value)}
                  required
                />
              </div>
              {formValues.date && formValues.time && !fieldValidation.dateTimeFuture && (
                <p className="text-xs text-destructive">La date et l'heure doivent être dans le futur</p>
              )}
            </div>

            {/* Poids et Volume */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight" className="flex items-center gap-2">
                  Poids (kg) *
                  {fieldValidation.weight && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                </Label>
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
                <Label htmlFor="volume" className="flex items-center gap-2">
                  Volume (m³) *
                  {fieldValidation.volume && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                </Label>
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
            <div className="flex justify-end gap-3 pt-4 border-t lg:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="cta" disabled={isSubmitting || !isFormValid}>
                Créer la commande
              </Button>
            </div>
          </div>

          {/* Récapitulatif en temps réel */}
          <aside className="lg:row-span-2 space-y-4">
            <div className="sticky top-4 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Récapitulatif</h3>
                <p className="text-sm text-muted-foreground">Aperçu de votre commande</p>
              </div>

              <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
                {/* Statut du formulaire */}
                <div className="flex items-center gap-2 text-sm">
                  {isFormValid ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="font-medium text-emerald-600">Formulaire complet</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      <span className="text-muted-foreground">Remplissez tous les champs</span>
                    </>
                  )}
                </div>

                {/* Détails */}
                <div className="space-y-3 text-sm">
                  {currentClient && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Société</p>
                      <p className="font-medium">{currentClient.company}</p>
                    </div>
                  )}
                  
                  {formValues.type && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{formValues.type}</p>
                    </div>
                  )}
                  
                  {(formValues.pickup || formValues.delivery) && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Trajet</p>
                      <p className="text-xs">
                        {formValues.pickup || "..."} 
                        <span className="mx-1">→</span>
                        {formValues.delivery || "..."}
                      </p>
                    </div>
                  )}
                  
                  {(formValues.date || formValues.time) && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Date & Heure</p>
                      <p className="text-xs">{formValues.date || "..."} à {formValues.time || "..."}</p>
                    </div>
                  )}
                  
                  {(formValues.weight || formValues.volume) && (
                    <div className="flex gap-4">
                      {formValues.weight && (
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">Poids</p>
                          <p className="text-xs font-medium">{formValues.weight} kg</p>
                        </div>
                      )}
                      {formValues.volume && (
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">Volume</p>
                          <p className="text-xs font-medium">{formValues.volume} m³</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tarif estimé */}
                {estimatedPrice !== null && (
                  <div className="pt-4 border-t">
                    <p className="text-xs uppercase text-muted-foreground mb-1">Tarif estimé</p>
                    <p className="text-2xl font-semibold text-primary">{estimatedPrice.toFixed(2)} €</p>
                    <p className="text-xs text-muted-foreground mt-1">Calcul indicatif - Tarif final confirmé après validation</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrderButton;
