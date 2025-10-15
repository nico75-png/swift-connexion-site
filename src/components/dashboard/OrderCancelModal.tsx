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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { ClientOrder } from "@/lib/reorder";
import {
  ORDER_CANCELLATION_REASON_LABELS,
  ORDER_CANCELLATION_REASON_OPTIONS,
  doesCancelReasonRequireDetails,
  type CancelOrderReason,
} from "@/lib/orders/cancellation";
import { cancelOrder } from "@/services/orders/cancelOrder";

interface OrderCancelModalProps {
  orderId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: (order: ClientOrder) => void;
}

const OrderCancelModal = ({ orderId, open, onClose, onSuccess }: OrderCancelModalProps) => {
  const { toast } = useToast();
  const [reason, setReason] = useState<CancelOrderReason | null>(null);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setReason(null);
      setDetails("");
      setIsSubmitting(false);
      setError(null);
    }
  }, [open]);

  const requiresDetails = useMemo(() => doesCancelReasonRequireDetails(reason), [reason]);

  const isSubmitDisabled =
    !reason || (requiresDetails && details.trim().length === 0) || isSubmitting;

  const handleConfirm = async () => {
    if (!reason) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const updatedOrder = await cancelOrder(orderId, {
        reason,
        details,
      });

      const reasonLabel = ORDER_CANCELLATION_REASON_LABELS[reason];
      toast({
        title: "Commande annulée",
        description: `La commande ${updatedOrder.id} est maintenant annulée (${reasonLabel.toLowerCase()}).`,
      });

      onSuccess?.(updatedOrder);
      onClose();
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Impossible d’annuler la commande.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Annuler la commande</DialogTitle>
          <DialogDescription>
            Sélectionnez un motif d’annulation. Cette action est définitive et ne pourra pas être
            annulée.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Motif</Label>
            <Select
              value={reason ?? undefined}
              onValueChange={(value) => setReason(value as CancelOrderReason)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="cancel-reason">
                <SelectValue placeholder="Sélectionner un motif" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_CANCELLATION_REASON_OPTIONS.map((option) => (
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
                placeholder="Indiquez la raison de l’annulation"
                disabled={isSubmitting}
                required
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Merci de nous aider à comprendre votre demande.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Fermer
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitDisabled} variant="destructive">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Valider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderCancelModal;
