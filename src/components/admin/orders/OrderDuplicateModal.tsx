import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { Order } from "@/lib/stores/driversOrders.store";
import { createDuplicateDraftFromOrder, type OrderDuplicateDraft } from "./OrderDuplicate";
import { createOrderFromDuplicateDraft } from "@/services/orders/duplicateOrder";

interface OrderDuplicateModalProps {
  sourceOrder: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (order: Order) => void;
}

const OrderDuplicateModal = ({ sourceOrder, open, onOpenChange, onCreated }: OrderDuplicateModalProps) => {
  const [formValues, setFormValues] = useState<OrderDuplicateDraft>(() => createDuplicateDraftFromOrder(sourceOrder));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultDraft = useMemo(() => createDuplicateDraftFromOrder(sourceOrder), [sourceOrder]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setFormValues(defaultDraft);
    setIsSubmitting(false);
    setError(null);
  }, [open, defaultDraft]);

  const handleChange = (field: keyof OrderDuplicateDraft) => (value: string) => {
    setFormValues((previous) => ({ ...previous, [field]: value }));
  };

  const handleOptionToggle = (option: keyof OrderDuplicateDraft["options"]) => (checked: boolean) => {
    setFormValues((previous) => ({
      ...previous,
      options: { ...previous.options, [option]: checked },
    }));
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      onOpenChange(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const newOrder = await createOrderFromDuplicateDraft({
        client: formValues.client,
        type: formValues.type,
        sector: sourceOrder.sector,
        pickupAddress: formValues.pickupAddress,
        dropoffAddress: formValues.dropoffAddress,
        date: formValues.date,
        time: formValues.time,
        weight: formValues.weight,
        volume: formValues.volume,
        instructions: formValues.instructions,
        zoneRequirement: formValues.zoneRequirement,
        amount: formValues.amount,
        sourceOrderId: sourceOrder.id,
        options: formValues.options,
      });

      onCreated?.(newOrder);
      onOpenChange(false);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Impossible de dupliquer la commande.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCreateDisabled =
    isSubmitting ||
    !formValues.client.trim() ||
    !formValues.pickupAddress.trim() ||
    !formValues.dropoffAddress.trim() ||
    !formValues.date ||
    !formValues.time ||
    !formValues.weight.trim() ||
    !formValues.volume.trim();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Dupliquer la commande</DialogTitle>
          <DialogDescription>
            Les informations de la commande {sourceOrder.id} sont pré-remplies. Modifiez-les si nécessaire puis créez le brouillon.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="duplicate-client">Client</Label>
            <Input
              id="duplicate-client"
              value={formValues.client}
              onChange={(event) => handleChange("client")(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="duplicate-type">Type</Label>
            <Input
              id="duplicate-type"
              value={formValues.type}
              onChange={(event) => handleChange("type")(event.target.value)}
              placeholder="Standard, Express, ..."
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="duplicate-pickup">Adresse d'enlèvement</Label>
            <Input
              id="duplicate-pickup"
              value={formValues.pickupAddress}
              onChange={(event) => handleChange("pickupAddress")(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="duplicate-dropoff">Adresse de livraison</Label>
            <Input
              id="duplicate-dropoff"
              value={formValues.dropoffAddress}
              onChange={(event) => handleChange("dropoffAddress")(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Options</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 text-sm">
                <Checkbox
                  checked={formValues.options.express}
                  onCheckedChange={(checked) => handleOptionToggle("express")(Boolean(checked))}
                  disabled={isSubmitting}
                />
                <span>Express</span>
              </label>
              <label className="flex items-center gap-3 text-sm">
                <Checkbox
                  checked={formValues.options.fragile}
                  onCheckedChange={(checked) => handleOptionToggle("fragile")(Boolean(checked))}
                  disabled={isSubmitting}
                />
                <span>Fragile</span>
              </label>
              <label className="flex items-center gap-3 text-sm">
                <Checkbox
                  checked={formValues.options.temperatureControlled}
                  onCheckedChange={(checked) =>
                    handleOptionToggle("temperatureControlled")(Boolean(checked))
                  }
                  disabled={isSubmitting}
                />
                <span>Température dirigée</span>
              </label>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="duplicate-date">Date</Label>
              <Input
                id="duplicate-date"
                type="date"
                value={formValues.date}
                onChange={(event) => handleChange("date")(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duplicate-time">Heure</Label>
              <Input
                id="duplicate-time"
                type="time"
                value={formValues.time}
                onChange={(event) => handleChange("time")(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="duplicate-weight">Poids (kg)</Label>
              <Input
                id="duplicate-weight"
                value={formValues.weight}
                onChange={(event) => handleChange("weight")(event.target.value)}
                inputMode="decimal"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duplicate-volume">Volume (m³)</Label>
              <Input
                id="duplicate-volume"
                value={formValues.volume}
                onChange={(event) => handleChange("volume")(event.target.value)}
                inputMode="decimal"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="duplicate-instructions">Instructions</Label>
            <Textarea
              id="duplicate-instructions"
              value={formValues.instructions}
              onChange={(event) => handleChange("instructions")(event.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isCreateDisabled}>
            {isSubmitting ? "Création..." : "Créer la nouvelle commande"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDuplicateModal;
