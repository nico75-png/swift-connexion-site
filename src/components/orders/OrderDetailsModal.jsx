import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import OrderHeader from "./OrderHeader";
import OrderActionsBar from "./OrderActionsBar";
import OrderDetailsContent from "./OrderDetailsContent";

const formatFullDateTime = (isoDate) => {
  if (!isoDate) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoDate));
  } catch (error) {
    return "—";
  }
};

const OrderDetailsModal = ({ order, open, onClose }) => {
  const deliveryDate = order?.delivery?.expected_date || order?.delivery?.planned_date;

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose?.()}>
      <AnimatePresence>
        {open && order ? (
          <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex max-h-[90vh] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
            >
              <OrderHeader
                orderNumber={order?.order_number || order?.id}
                status={order?.status}
                statusLabel={order?.status_label}
                createdAt={order?.created_at}
                updatedAt={order?.updated_at}
                expectedDeliveryDate={deliveryDate}
              />

              <OrderActionsBar
                trackingUrl={order?.tracking_url || order?.delivery?.tracking_url}
                driverPhone={order?.driver?.phone}
                deliveryNoteUrl={order?.delivery_note_url || order?.delivery?.document_url}
              />

              <div className="flex-1 overflow-y-auto">
                <OrderDetailsContent order={order} />
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Dernière mise à jour :
                  <span className="font-medium text-slate-700">
                    {" "}
                    {formatFullDateTime(order?.updated_at || order?.created_at)}
                  </span>
                </p>
                <Button variant="outline" onClick={() => onClose?.()} className="transition-all duration-200 ease-in-out">
                  Fermer la fiche
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        ) : null}
      </AnimatePresence>
    </Dialog>
  );
};

export default OrderDetailsModal;
