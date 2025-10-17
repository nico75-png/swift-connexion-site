import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cancelOrder } from "@/services/orders.service";

const CANCEL_REASONS = [
  { value: "CLIENT_REQUEST", label: "Demande du client" },
  { value: "MISSING_INFORMATION", label: "Informations manquantes" },
  { value: "PRICING", label: "Tarif non validé" },
  { value: "OTHER", label: "Autre" },
] as const;

type CancelReason = (typeof CANCEL_REASONS)[number]["value"];

interface OrderCancelModalProps {
  orderId: string;
  orderNumber: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const OrderCancelModal = ({ orderId, orderNumber, open, onClose, onSuccess }: OrderCancelModalProps) => {
  const { toast } = useToast();
  const [reason, setReason] = useState<CancelReason | null>(null);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requiresDetails = useMemo(() => reason === "OTHER", [reason]);

  useEffect(() => {
    if (!open) {
      setReason(null);
      setDetails("");
      setIsSubmitting(false);
      setError(null);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!reason) {
      setError("Sélectionnez un motif d'annulation.");
      return;
    }
    if (requiresDetails && !details.trim()) {
      setError("Veuillez préciser le motif.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const reasonLabel = CANCEL_REASONS.find((item) => item.value === reason)?.label ?? "Motif";
      await cancelOrder(orderId, {
        reason,
        note: details.trim() || undefined,
        author: "admin",
      });

      toast({
        title: "Commande annulée",
        description: `La commande ${orderNumber} a été annulée (${reasonLabel.toLowerCase()}).`,
      });
      onSuccess?.();
      onClose();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Impossible d'annuler la commande.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isConfirmDisabled =
    !reason || (requiresDetails && details.trim().length === 0) || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Annuler la commande</DialogTitle>
          <DialogDescription>
            Indiquez un motif d'annulation pour la commande {orderNumber}. L'action est définitive.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Motif</Label>
            <Select
              value={reason ?? undefined}
              onValueChange={(value) => setReason(value as CancelReason)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="cancel-reason">
                <SelectValue placeholder="Sélectionnez un motif" />
              </SelectTrigger>
              <SelectContent>
                {CANCEL_REASONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {requiresDetails && (
            <div className="space-y-2">
              <Label htmlFor="cancel-details">Précisions</Label>
              <Textarea
                id="cancel-details"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                rows={4}
                placeholder="Expliquez la raison de l'annulation"
                disabled={isSubmitting}
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Fermer
          </Button>
          <Button onClick={handleConfirm} disabled={isConfirmDisabled} variant="destructive">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderCancelModal;
