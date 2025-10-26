import { useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, FileDown, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  transit: {
    label: "En transit",
    badgeClass: "bg-sky-100 text-sky-700 border border-sky-200",
    iconColor: "text-sky-500",
    actions: { map: true, call: true, pdf: true },
  },
  pending: {
    label: "En attente",
    badgeClass: "bg-amber-100 text-amber-700 border border-amber-200",
    iconColor: "text-amber-500",
    actions: { map: false, call: false, pdf: false },
  },
  delivered: {
    label: "Livrée",
    badgeClass: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    iconColor: "text-emerald-500",
    actions: { map: false, call: false, pdf: true },
  },
  cancelled: {
    label: "Annulée",
    badgeClass: "bg-rose-100 text-rose-700 border border-rose-200",
    iconColor: "text-rose-500",
    actions: { map: false, call: false, pdf: true },
  },
};

const DEFAULT_STATUS = {
  label: "Suivi",
  badgeClass: "bg-slate-100 text-slate-700 border border-slate-200",
  iconColor: "text-slate-500",
  actions: { map: false, call: false, pdf: true },
};

const ACTIONS = [
  {
    key: "map",
    label: "Ouvrir la carte en direct",
    icon: MapPin,
    variant: "default",
  },
  {
    key: "call",
    label: "Appeler le chauffeur",
    icon: Phone,
    variant: "secondary",
  },
  {
    key: "pdf",
    label: "Télécharger le bon de commande",
    icon: FileDown,
    variant: "outline",
  },
];

const statusKeyFromValue = (status = "") => {
  const normalized = status.toLowerCase();
  if (normalized.includes("livr")) return "delivered";
  if (normalized.includes("transit") || normalized.includes("cours")) return "transit";
  if (normalized.includes("annul")) return "cancelled";
  if (normalized.includes("attente") || normalized.includes("préparation")) return "pending";
  return normalized;
};

const OrderActionsBar = ({
  status,
  onOpenMap,
  onCallDriver,
  onDownloadPdf,
  isDownloading,
  driverPhone,
}) => {
  const statusConfig = useMemo(() => {
    const key = statusKeyFromValue(status);
    return STATUS_CONFIG[key] ?? DEFAULT_STATUS;
  }, [status]);

  const renderButton = ({ key, label, icon: Icon, variant }) => {
    const isActionAvailable = statusConfig.actions[key] ?? true;
    const isDisabled = !isActionAvailable || (key === "call" && !driverPhone);

    const button = (
      <Button
        key={key}
        onClick={
          key === "map"
            ? onOpenMap
            : key === "call"
            ? onCallDriver
            : onDownloadPdf
        }
        variant={variant}
        size="lg"
        disabled={isDisabled || (key === "pdf" && isDownloading)}
        className={cn(
          "h-14 flex-1 rounded-xl text-sm font-semibold shadow-none transition-all duration-150",
          "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-300",
          {
            "opacity-60 cursor-not-allowed": isDisabled,
            "bg-slate-900 text-white hover:bg-slate-800": variant === "default",
          },
        )}
      >
        <Icon className="mr-2 h-5 w-5" />
        {key === "pdf" && isDownloading ? "Génération..." : label}
      </Button>
    );

    if (statusConfig.label === STATUS_CONFIG.pending.label && !isActionAvailable) {
      return (
        <Tooltip key={key}>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent className="max-w-xs text-center">
            Disponible après attribution du chauffeur
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <TooltipProvider delayDuration={100}>
      <motion.aside
        layout
        transition={{ type: "spring", damping: 20, stiffness: 180 }}
        className={cn(
          "z-30 flex w-full flex-col gap-3 rounded-2xl bg-white/95 p-4 shadow-md backdrop-blur",
          "md:sticky md:top-4 md:flex-row md:items-center md:gap-4 md:p-5",
          "md:shadow-sm md:backdrop-blur-none",
          "fixed bottom-6 left-4 right-4 md:relative md:bottom-auto md:left-auto md:right-auto",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                statusConfig.iconColor,
                "bg-slate-100",
              )}
              aria-hidden
            >
              <Truck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Statut</p>
              <p className="text-base font-semibold text-slate-900">{statusConfig.label}</p>
            </div>
          </div>
          <span
            className={cn(
              "hidden items-center rounded-full px-3 py-1 text-xs font-semibold md:inline-flex",
              statusConfig.badgeClass,
            )}
          >
            {statusConfig.label}
          </span>
        </div>

        <div className="flex flex-col gap-3 md:flex-1 md:flex-row">
          {ACTIONS.map(renderButton)}
        </div>

        <p className="text-center text-xs font-medium text-slate-500 md:text-right">
          Le bon de livraison est disponible après validation.
        </p>
      </motion.aside>
    </TooltipProvider>
  );
};

export default OrderActionsBar;
