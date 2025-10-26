import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const formatCurrency = (value, currency = "EUR") => {
  if (value == null || Number.isNaN(Number(value))) {
    return "—";
  }

  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
    }).format(Number(value));
  } catch (error) {
    return `${value} ${currency}`;
  }
};

const formatDateTime = (isoDate) => {
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

const SectionCard = ({ title, description, children, className }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: "easeOut" }}
    className={cn(
      "group rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm transition-all duration-200 ease-in-out",
      "hover:shadow-md hover:-translate-y-0.5",
      className
    )}
  >
    <header className="mb-4 space-y-1">
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</h3>
      {description ? <p className="text-sm text-slate-500">{description}</p> : null}
    </header>
    {children}
  </motion.section>
);

const TimelineItem = ({ label, date, isLast }) => (
  <div className="relative flex gap-3 pb-6 last:pb-0">
    <div className="flex flex-col items-center">
      <span className="mt-1 h-2.5 w-2.5 rounded-full border border-white bg-sky-500 shadow" />
      {!isLast ? <span className="mt-1 flex-1 w-px bg-slate-200" /> : null}
    </div>
    <div className="space-y-1">
      <p className="text-sm font-medium text-slate-800">{label}</p>
      <p className="text-xs text-slate-500">{date}</p>
    </div>
  </div>
);

const OrderDetailsContent = memo(function OrderDetailsContent({ order }) {
  const payment = order?.payment ?? {};
  const items = Array.isArray(order?.items) ? order.items : [];
  const delivery = order?.delivery ?? {};
  const driver = order?.driver ?? {};

  const timeline = useMemo(() => {
    if (Array.isArray(order?.timeline) && order.timeline.length > 0) {
      return order.timeline.map((event) => ({
        label: event?.label || event?.title || "Mise à jour",
        date: formatDateTime(event?.date || event?.timestamp),
      }));
    }

    if (Array.isArray(order?.history) && order.history.length > 0) {
      return order.history.map((event) => ({
        label: event?.label || event?.status || "Mise à jour",
        date: formatDateTime(event?.date || event?.timestamp),
      }));
    }

    const fallback = [];
    fallback.push({ label: "Commande créée", date: formatDateTime(order?.created_at) });
    if (driver?.name) {
      fallback.push({
        label: `Chauffeur assigné${driver?.name ? ` · ${driver.name}` : ""}`,
        date: formatDateTime(driver?.assigned_at || order?.driver_assigned_at || order?.updated_at),
      });
    }
    if (order?.status_label) {
      fallback.push({
        label: order.status_label,
        date: formatDateTime(order?.delivered_at || order?.updated_at),
      });
    }
    return fallback;
  }, [driver?.assigned_at, driver?.name, order]);

  return (
    <div className="space-y-6 px-6 pb-6 pt-4">
      <SectionCard title="Livraison" description="Coordonnées et organisation du trajet">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3 text-sm text-slate-600">
            <p className="text-base font-semibold text-slate-900">{delivery?.address || "Adresse non renseignée"}</p>
            <p>
              Créneau : <span className="font-medium text-slate-800">{delivery?.time_slot || "—"}</span>
            </p>
            <p>
              Statut logistique : <span className="font-medium text-slate-800">{delivery?.status || "—"}</span>
            </p>
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <p className="text-base font-semibold text-slate-900">{driver?.name || "Chauffeur non attribué"}</p>
            <p>Véhicule : {driver?.vehicle || "—"}</p>
            <p>Contact : {driver?.phone || "—"}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Produits / Courses" description="Détail des articles pris en charge">
        {items.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">
                    Article
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">
                    Quantité
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">
                    Prix unitaire
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {items.map((item, index) => (
                  <tr key={`${item?.sku || item?.name || index}-${index}`} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{item?.name || "Produit"}</p>
                      {item?.description ? (
                        <p className="text-xs text-slate-500">{item.description}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item?.quantity ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(item?.unit_price, order?.currency)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency((item?.unit_price || 0) * (item?.quantity || 0), order?.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
            Aucun article renseigné pour cette commande.
          </p>
        )}
      </SectionCard>

      <SectionCard title="Paiement" description="Synthèse du règlement" className="bg-slate-900 text-slate-100">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between text-slate-200">
            <span>Sous-total</span>
            <span>{formatCurrency(payment?.subtotal ?? order?.total_amount, order?.currency)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-200">
            <span>Frais de service</span>
            <span>{formatCurrency(payment?.fees ?? 0, order?.currency)}</span>
          </div>
          <Separator className="border-slate-700" />
          <div className="flex items-center justify-between text-base font-semibold text-white">
            <span>Total payé</span>
            <span>{formatCurrency(order?.total_amount, order?.currency)}</span>
          </div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Mode de paiement : {payment?.method || "Non communiqué"}
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Historique" description="Suivi des étapes clés">
        <div className="relative">
          <div className="absolute inset-y-2 left-2 hidden w-px bg-slate-200 sm:block" aria-hidden="true" />
          <div className="space-y-4">
            {timeline.length > 0 ? (
              timeline.map((event, index) => (
                <TimelineItem
                  key={`${event?.label}-${index}`}
                  label={event?.label || "Mise à jour"}
                  date={event?.date || "—"}
                  isLast={index === timeline.length - 1}
                />
              ))
            ) : (
              <p className="rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                Aucun événement enregistré pour l’instant.
              </p>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
});

export default OrderDetailsContent;
