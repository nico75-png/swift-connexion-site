import { KeyboardEvent } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type OrderStatus = "Livrée" | "En attente" | "En transit" | "Annulée";

type AssociatedOrder = {
  id: string;
  code?: string;
  date: string;
  status: OrderStatus;
  total: number;
};

type ModalCommandesAssocieesProps = {
  isOpen: boolean;
  invoiceNumber: string;
  orders: AssociatedOrder[];
  totalAmount: number;
  onClose: () => void;
  onSelectOrder: (orderId: string) => void;
  onViewAll: () => void;
  formatCurrency: (value: number) => string;
  formatDate: (value: string) => string;
};

const STATUS_STYLES: Record<OrderStatus, { badge: string; icon: string }> = {
  "Livrée": { badge: "bg-[#DCFCE7] text-[#16A34A]", icon: "✅" },
  "En attente": { badge: "bg-[#FEF3C7] text-[#B45309]", icon: "⏳" },
  "En transit": { badge: "bg-[#DBEAFE] text-[#2563EB]", icon: "🚚" },
  "Annulée": { badge: "bg-[#FEE2E2] text-[#DC2626]", icon: "❌" },
};

const handleRowKeyDown = (
  event: KeyboardEvent<HTMLTableRowElement>,
  callback: () => void,
) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    callback();
  }
};

const ModalCommandesAssociees = ({
  isOpen,
  invoiceNumber,
  orders,
  totalAmount,
  onClose,
  onSelectOrder,
  onViewAll,
  formatCurrency,
  formatDate,
}: ModalCommandesAssocieesProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent className="max-w-[700px] rounded-[14px] border border-slate-100 bg-white p-0 shadow-[0_28px_70px_rgba(15,23,42,0.20)]">
        <div className="flex flex-col">
          <header className="border-b border-slate-200 bg-[#F9FAFB] px-6 py-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#2563EB]">
                Commandes associées
              </p>
              <h2 className="text-xl font-semibold text-[#111827]">
                Commandes associées à la facture {invoiceNumber}
              </h2>
              <p className="text-sm text-[#6B7280]">
                Liste des cours inclus dans la facturation du mois.
              </p>
            </div>
          </header>

          <ScrollArea className="max-h-[360px] px-6">
            <table className="mt-6 w-full border-separate border-spacing-y-2 text-sm text-[#111827]">
              <thead className="text-xs uppercase tracking-wide text-[#6B7280]">
                <tr>
                  <th className="rounded-l-xl bg-[#F3F4F6] px-4 py-2 text-left font-medium">Commande</th>
                  <th className="bg-[#F3F4F6] px-4 py-2 text-left font-medium">Date</th>
                  <th className="bg-[#F3F4F6] px-4 py-2 text-left font-medium">Statut</th>
                  <th className="rounded-r-xl bg-[#F3F4F6] px-4 py-2 text-right font-medium">Montant TTC</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const style = STATUS_STYLES[order.status];
                  return (
                    <tr
                      key={order.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectOrder(order.id)}
                      onKeyDown={(event) => handleRowKeyDown(event, () => onSelectOrder(order.id))}
                      className="group rounded-[12px] border border-transparent bg-white px-2 py-3 text-left transition-all duration-150 ease-out hover:-translate-y-[1px] hover:border-[#2563EB] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD] focus-visible:ring-offset-2"
                    >
                      <td className="px-4 py-2 align-middle">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-[#111827]">{order.code ?? order.id}</span>
                          <span className="text-xs text-[#6B7280]">Généré le {formatDate(order.date)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 align-middle text-sm text-[#111827]">
                        {formatDate(order.date)}
                      </td>
                      <td className="px-4 py-2 align-middle">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm transition-colors",
                            style.badge,
                          )}
                        >
                          <span aria-hidden>{style.icon}</span>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 align-middle text-right text-sm font-semibold text-[#111827]">
                        {formatCurrency(order.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollArea>

          <footer className="flex flex-col gap-4 border-t border-slate-200 bg-[#F9FAFB] px-6 py-5">
            <div className="text-sm font-medium text-[#111827]">
              Total des commandes : {orders.length} parcours – {formatCurrency(totalAmount)} TTC
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-11 border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#E5E7EB]"
              >
                Fermer
              </Button>
              <Button
                type="button"
                onClick={onViewAll}
                className="h-11 bg-[#2563EB] text-white shadow-[0_10px_25px_rgba(37,99,235,0.35)] transition-transform duration-150 hover:-translate-y-[1px] hover:bg-[#1D4ED8]"
              >
                Voir toutes les commandes du mois
              </Button>
            </div>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export type { AssociatedOrder, OrderStatus };
export { ModalCommandesAssociees };

