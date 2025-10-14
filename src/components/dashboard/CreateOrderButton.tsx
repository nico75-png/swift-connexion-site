import { useState } from "react";
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

/**
 * Bouton pour créer une commande (admin)
 * Ouvre un dialog avec formulaire
 */
const CreateOrderButton = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Commande créée",
      description: "La commande a été créée avec succès.",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="cta">
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
          {/* Sélection client */}
          <div>
            <Label htmlFor="client">Client *</Label>
            <Select required>
              <SelectTrigger id="client">
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Cabinet Dupont</SelectItem>
                <SelectItem value="2">Optique Vision</SelectItem>
                <SelectItem value="3">Lab Médical</SelectItem>
                <SelectItem value="4">Avocat & Associés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type de transport */}
          <div>
            <Label htmlFor="type">Type de transport *</Label>
            <Select required>
              <SelectTrigger id="type">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="express">Express</SelectItem>
                <SelectItem value="fragile">Fragile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Départ */}
            <div>
              <Label htmlFor="pickup">Adresse de départ *</Label>
              <Input id="pickup" placeholder="Adresse complète" required />
            </div>

            {/* Arrivée */}
            <div>
              <Label htmlFor="delivery">Adresse de livraison *</Label>
              <Input id="delivery" placeholder="Adresse complète" required />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" required />
            </div>

            {/* Heure */}
            <div>
              <Label htmlFor="time">Heure *</Label>
              <Input id="time" type="time" required />
            </div>
          </div>

          {/* Options */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="weight">Poids (kg)</Label>
              <Input id="weight" type="number" step="0.1" placeholder="Ex: 2.5" />
            </div>
            <div>
              <Label htmlFor="volume">Volume (m³)</Label>
              <Input id="volume" type="number" step="0.01" placeholder="Ex: 0.05" />
            </div>
            <div>
              <Label htmlFor="driver">Affecter chauffeur</Label>
              <Select>
                <SelectTrigger id="driver">
                  <SelectValue placeholder="Auto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automatique</SelectItem>
                  <SelectItem value="1">Marc D.</SelectItem>
                  <SelectItem value="2">Julie L.</SelectItem>
                  <SelectItem value="3">Pierre M.</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <Label htmlFor="notes">Instructions particulières</Label>
            <Textarea id="notes" placeholder="Notes pour le chauffeur..." rows={3} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="cta">
              Créer la commande
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrderButton;
