import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  delivered: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  pending: "bg-amber-100 text-amber-800 border border-amber-200",
  cancelled: "bg-rose-100 text-rose-700 border border-rose-200",
  in_transit: "bg-sky-100 text-sky-700 border border-sky-200",
};

const formatDate = (isoDate) =>
  isoDate
    ? new Intl.DateTimeFormat("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(isoDate))
    : "—";

const formatCurrency = (value, currency = "EUR") =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(value);

const SectionTitle = ({ title, description }) => (
  <header className="space-y-1">
    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
    {description ? <p className="text-sm text-slate-500">{description}</p> : null}
  </header>
);

const OrderDetailsModal = ({ order, open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose?.()}>
      <AnimatePresence>
        {open && order ? (
          <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
            >
              <div className="flex flex-col gap-6 px-6 pb-6 pt-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Commande</p>
                    <h2 className="text-2xl font-semibold text-slate-900">{order.order_number}</h2>
                    <p className="text-sm text-slate-500">Créée le {formatDate(order.created_at)}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "self-start rounded-full px-3 py-1 text-xs font-semibold capitalize",
                      STATUS_STYLES[order.status] || "bg-slate-100 text-slate-700 border border-slate-200",
                    )}
                  >
                    {order.status_label || order.status}
                  </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4 rounded-xl bg-slate-50/60 p-5">
                    <SectionTitle title="Chauffeur" description="Personne en charge de la livraison" />
                    <div className="space-y-2 text-sm text-slate-600">
                      <p className="text-base font-semibold text-slate-900">{order.driver?.name ?? "Non attribué"}</p>
                      <p>{order.driver?.vehicle}</p>
                      <p className="text-sm">Contact : {order.driver?.phone || "—"}</p>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-xl bg-slate-50/60 p-5">
                    <SectionTitle title="Livraison" description="Informations logistiques" />
                    <div className="space-y-2 text-sm text-slate-600">
                      <p className="text-base font-semibold text-slate-900">{order.delivery?.address}</p>
                      <p>Date prévue : {formatDate(order.delivery?.expected_date)}</p>
                      <p>Statut : {order.delivery?.status || "—"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionTitle title="Produits" description="Résumé des articles transportés" />
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-500">
                            Produit
                          </th>
                          <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-500">
                            Quantité
                          </th>
                          <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-500">
                            Prix unitaire
                          </th>
                          <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-500">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {order.items?.map((item) => (
                          <tr key={`${item.sku}-${item.quantity}`}>
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-900">{item.name}</div>
                              {item.description ? (
                                <p className="text-xs text-slate-500">{item.description}</p>
                              ) : null}
                            </td>
                            <td className="px-4 py-3 text-slate-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-slate-600">
                              {formatCurrency(item.unit_price, order.currency)}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-slate-900">
                              {formatCurrency(item.unit_price * item.quantity, order.currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4 rounded-xl bg-slate-900/95 p-6 text-slate-100">
                  <SectionTitle title="Paiement" description="Récapitulatif transactionnel" />
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Sous-total</span>
                      <span>{formatCurrency(order.payment?.subtotal ?? order.total_amount, order.currency)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Frais de service</span>
                      <span>{formatCurrency(order.payment?.fees ?? 0, order.currency)}</span>
                    </div>
                    <Separator className="border-slate-700" />
                    <div className="flex items-center justify-between text-base font-semibold text-white">
                      <span>Total payé</span>
                      <span>{formatCurrency(order.total_amount, order.currency)}</span>
                    </div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Mode de paiement : {order.payment?.method || "Non communiqué"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    Dernière mise à jour : {formatDate(order.updated_at || order.created_at)}
                  </p>
                  <Button variant="outline" onClick={() => onClose?.()} className="sm:w-auto">
                    Fermer la fiche
                  </Button>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        ) : null}
      </AnimatePresence>
    </Dialog>
  );
};

export default OrderDetailsModal;
