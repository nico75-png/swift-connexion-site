import { useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, FileDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const statusKeyFromValue = (status = "") => {
  const normalized = status.toLowerCase();
  if (normalized.includes("livr")) return "delivered";
  if (normalized.includes("annul")) return "cancelled";
  if (normalized.includes("attente") || normalized.includes("préparation")) return "pending";
  if (normalized.includes("transit") || normalized.includes("cours")) return "transit";
  return normalized;
};

const baseButtonClasses =
  "flex h-11 flex-1 min-w-0 items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2";

const variantClasses = {
  primary: "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-sm",
  secondary: "border border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF]",
  tertiary: "bg-[#F9FAFB] text-[#1F2937] hover:bg-[#F3F4F6]",
};

const disabledClasses =
  "disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:border-[#D1D5DB] disabled:shadow-none disabled:hover:bg-[#E5E7EB] disabled:hover:text-[#9CA3AF]";

const OrderActionsBar = ({
  status,
  onOpenMap,
  onCallDriver,
  onDownloadPdf,
  isDownloading = false,
  driverPhone,
  deliveryNoteAvailable = true,
}) => {
  const statusKey = useMemo(() => statusKeyFromValue(status), [status]);

  const isPending = statusKey === "pending";
  const isTransit = statusKey === "transit";
  const isDelivered = statusKey === "delivered";
  const isCancelled = statusKey === "cancelled";

  const canInitiateCall = Boolean(onCallDriver || driverPhone);

  const trackDisabled = !isTransit || isPending;
  const showCallButton = !isDelivered && !isCancelled;
  const callDisabled = isPending || !canInitiateCall;
  const downloadDisabled = isPending || !deliveryNoteAvailable || isDownloading;
  const showDownloadTooltip = !deliveryNoteAvailable;

  const handleOpenMap = () => {
    if (trackDisabled) return;
    if (onOpenMap) {
      onOpenMap();
    }
  };

  const handleCallDriver = () => {
    if (callDisabled) return;
    if (onCallDriver) {
      onCallDriver();
      return;
    }
    if (driverPhone && typeof window !== "undefined") {
      const sanitized = driverPhone.replace(/\s+/g, "");
      window.open(`tel:${sanitized}`);
    }
  };

  const handleDownload = () => {
    if (downloadDisabled) return;
    if (onDownloadPdf) {
      onDownloadPdf();
    }
  };

  const renderActionButton = ({
    label,
    icon: Icon,
    variant,
    onClick,
    disabled,
    ariaLabel,
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(baseButtonClasses, variantClasses[variant], disabledClasses)}
    >
      <Icon className="h-5 w-5" aria-hidden />
      <span className="truncate">{label}</span>
    </button>
  );

  const downloadButton = renderActionButton({
    label: isDownloading ? "Téléchargement..." : "Télécharger le bon de livraison",
    icon: FileDown,
    variant: "tertiary",
    onClick: handleDownload,
    disabled: downloadDisabled,
    ariaLabel: "Télécharger le bon de livraison",
  });

  return (
    <TooltipProvider delayDuration={120}>
      <motion.aside
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="rounded-xl bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.05)] sm:p-5"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 sm:justify-between">
          {renderActionButton({
            label: "Suivre ma livraison",
            icon: MapPin,
            variant: "primary",
            onClick: handleOpenMap,
            disabled: trackDisabled,
            ariaLabel: "Suivre la livraison en temps réel",
          })}

          {showCallButton
            ? renderActionButton({
                label: "Appeler le chauffeur",
                icon: Phone,
                variant: "secondary",
                onClick: handleCallDriver,
                disabled: callDisabled,
                ariaLabel: "Appeler le chauffeur",
              })
            : null}

          {showDownloadTooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>{downloadButton}</TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[220px] text-center text-xs font-medium">
                Disponible après validation.
              </TooltipContent>
            </Tooltip>
          ) : (
            downloadButton
          )}
        </div>

        <p className="mt-4 text-center text-[13px] leading-5 text-[#6B7280]">
          <strong>Le bon de livraison est disponible après validation.</strong>
        </p>
      </motion.aside>
    </TooltipProvider>
  );
};

export default OrderActionsBar;
