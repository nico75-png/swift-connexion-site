import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { AdminOrderDetail } from "@/services/orders.service";

interface QuickActionsProps {
  order: AdminOrderDetail;
  onDuplicate: () => void;
  onContactClient: () => void;
  onCancelOrder: () => void;
  isCancelDisabled?: boolean;
}

const QuickActions = ({
  order,
  onDuplicate,
  onContactClient,
  onCancelOrder,
  isCancelDisabled = false,
}: QuickActionsProps) => {
  const cancelable = !isCancelDisabled;
  const isCancelled = order.status === "ANNULEE";
  const isDelivered = order.status === "LIVRE";
  const actionsLocked = isCancelled;

  const duplicateButton = (
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={onDuplicate}
      disabled={actionsLocked}
    >
      Dupliquer la commande
    </Button>
  );

  const contactButton = (
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={onContactClient}
      disabled={actionsLocked}
    >
      Contacter le client
    </Button>
  );

  const cancelButton = (
    <Button
      variant="outline"
      className="w-full justify-start text-destructive hover:text-destructive"
      onClick={onCancelOrder}
      disabled={!cancelable}
    >
      Annuler la commande
    </Button>
  );

  const cancelTooltipContent = isDelivered || isCancelled
    ? "Cette commande est déjà livrée ou annulée."
    : "Annulation indisponible pour ce statut.";

  const lockedTooltipContent = "Commande annulée : actions indisponibles.";

  return (
    <div className="space-y-2">
      {actionsLocked ? (
        <Tooltip>
          <TooltipTrigger asChild>{duplicateButton}</TooltipTrigger>
          <TooltipContent>{lockedTooltipContent}</TooltipContent>
        </Tooltip>
      ) : (
        duplicateButton
      )}
      {actionsLocked ? (
        <Tooltip>
          <TooltipTrigger asChild>{contactButton}</TooltipTrigger>
          <TooltipContent>{lockedTooltipContent}</TooltipContent>
        </Tooltip>
      ) : (
        contactButton
      )}
      {cancelable ? (
        cancelButton
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>{cancelButton}</TooltipTrigger>
          <TooltipContent>{cancelTooltipContent}</TooltipContent>
        </Tooltip>
      )}
      {actionsLocked && (
        <p className="text-xs text-muted-foreground">Toutes les actions sont désactivées pour une commande annulée.</p>
      )}
    </div>
  );
};

export default QuickActions;
