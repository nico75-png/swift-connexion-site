import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLE_MAP = {
  delivered: "bg-green-100 text-green-800",
  delivered_on: "bg-green-100 text-green-800",
  livree: "bg-green-100 text-green-800",
  "livrée": "bg-green-100 text-green-800",
  "en cours": "bg-blue-100 text-blue-800",
  "en cours de livraison": "bg-blue-100 text-blue-800",
  in_transit: "bg-blue-100 text-blue-800",
  pending: "bg-gray-100 text-gray-800",
  awaiting: "bg-gray-100 text-gray-800",
  "en attente": "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  canceled: "bg-red-100 text-red-800",
  "commande annulée": "bg-red-100 text-red-800",
  annulée: "bg-red-100 text-red-800",
};

const formatShortDate = (isoDate) => {
  if (!isoDate) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(isoDate));
  } catch (error) {
    return "—";
  }
};

const formatStatusKey = (statusLabel = "") => {
  const base = statusLabel.toLowerCase().replace(/_/g, " ").trim();
  const accentless = base.normalize("NFD").replace(/\p{Diacritic}/gu, "");

  if (accentless.includes("livree")) {
    return "livrée";
  }

  if (accentless.includes("cours")) {
    return "en cours de livraison";
  }

  if (accentless.includes("attente")) {
    return "en attente";
  }

  if (accentless.includes("annule")) {
    return "commande annulée";
  }

  return base;
};

const OrderHeader = memo(function OrderHeader({
  orderNumber,
  status,
  statusLabel,
  createdAt,
  updatedAt,
  expectedDeliveryDate,
}) {
  const statusKey = useMemo(() => formatStatusKey(statusLabel || status), [status, statusLabel]);
  const badgeStyles = STATUS_STYLE_MAP[statusKey] || STATUS_STYLE_MAP[status] || "bg-slate-100 text-slate-700";

  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-3 border-b border-slate-200 px-6 pb-6 pt-7"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Commande</span>
          <p className="text-3xl font-semibold tracking-tight text-slate-900">#{orderNumber}</p>
        </div>
        <motion.div
          key={statusKey}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex items-center"
        >
          <Badge
            className={cn(
              "rounded-full px-4 py-1 text-sm font-semibold shadow-sm transition-all duration-200 ease-in-out",
              "ring-1 ring-inset ring-black/5",
              badgeStyles
            )}
          >
            {statusLabel || statusKey}
          </Badge>
        </motion.div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span>
          Créée le {formatShortDate(createdAt)} — MAJ le {formatShortDate(updatedAt || createdAt)}
        </span>
        {expectedDeliveryDate ? (
          <span className="bg-slate-100 text-slate-700 rounded-full px-3 py-1 text-xs font-medium">
            Livraison prévue le {formatShortDate(expectedDeliveryDate)}
          </span>
        ) : null}
      </div>
    </motion.header>
  );
});

export default OrderHeader;
