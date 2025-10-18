import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cancelOrder } from "@/services/orders.service";

interface OrderCancelModalProps {
  orderId: string;
  orderNumber: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const OrderCancelModal = ({ orderId, orderNumber, open, onClose, onSuccess }: OrderCancelModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
      setError(null);
    }
  }, [open]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await cancelOrder(orderId, {
        reason: "ADMIN_CONFIRMED",
        author: "admin",
      });

      toast({
        title: "Commande annulée",
        description: "Commande annulée avec succès.",
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

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Annuler la commande</DialogTitle>
          <DialogDescription>
            Confirmez l'annulation de la commande {orderNumber}. L'action est définitive.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-3">
            <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
            <p className="text-sm">
              <strong className="block">Voulez-vous vraiment annuler cette commande ?</strong>
              Cette action ne peut pas être annulée.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting} variant="destructive">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Oui, annuler la commande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderCancelModal;
