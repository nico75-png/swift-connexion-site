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
  const forbidden = order.status === "LIVRE" || order.status === "ANNULEE";

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

  const cancelTooltipContent = forbidden
    ? "Cette commande est déjà livrée ou annulée."
    : "Annulation indisponible pour ce statut.";

  return (
    <div className="space-y-2">
      <Button variant="outline" className="w-full justify-start" onClick={onDuplicate}>
        Dupliquer la commande
      </Button>
      <Button variant="outline" className="w-full justify-start" onClick={onContactClient}>
        Contacter le client
      </Button>
      {cancelable ? (
        cancelButton
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>{cancelButton}</TooltipTrigger>
          <TooltipContent>{cancelTooltipContent}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export default QuickActions;
