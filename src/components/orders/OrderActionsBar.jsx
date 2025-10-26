import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Phone, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = "default",
  tooltip,
  className,
  disabled,
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        variant={variant}
        size="lg"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "flex-1 min-w-[3rem] gap-2 rounded-xl transition-all duration-200 ease-in-out",
          "sm:flex-none sm:min-w-[12rem]",
          variant === "default"
            ? "bg-sky-600 text-white hover:bg-sky-700"
            : variant === "secondary"
            ? "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
            : "bg-transparent text-slate-600 hover:bg-slate-100",
          disabled ? "opacity-60 cursor-not-allowed" : "",
          className
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span className="hidden text-sm font-medium sm:inline">{label}</span>
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="sm:hidden">
      <p className="text-xs font-medium text-slate-100">{tooltip || label}</p>
    </TooltipContent>
  </Tooltip>
);

const OrderActionsBar = memo(function OrderActionsBar({
  trackingUrl,
  onTrack,
  driverPhone,
  onContact,
  deliveryNoteUrl,
  onDownload,
}) {
  const handleTrack = useCallback(() => {
    if (onTrack) {
      onTrack();
      return;
    }
    if (trackingUrl && typeof window !== "undefined") {
      window.open(trackingUrl, "_blank", "noopener,noreferrer");
    }
  }, [onTrack, trackingUrl]);

  const handleContact = useCallback(() => {
    if (onContact) {
      onContact();
      return;
    }
    if (driverPhone && typeof window !== "undefined") {
      window.open(`tel:${driverPhone}`);
    }
  }, [driverPhone, onContact]);

  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload();
      return;
    }
    if (deliveryNoteUrl && typeof window !== "undefined") {
      window.open(deliveryNoteUrl, "_blank", "noopener,noreferrer");
    }
  }, [deliveryNoteUrl, onDownload]);

  return (
    <TooltipProvider delayDuration={150}>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm"
      >
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <ActionButton
              icon={trackingUrl ? Navigation : MapPin}
              label="Ouvrir la carte en direct"
              tooltip="Suivre la livraison"
              onClick={handleTrack}
              variant="default"
            />
            <ActionButton
              icon={Phone}
              label="Appeler le chauffeur"
              tooltip="Contacter le chauffeur"
              onClick={handleContact}
              variant="secondary"
              disabled={!driverPhone && !onContact}
            />
            <ActionButton
              icon={FileDown}
              label="Télécharger le bon de livraison"
              tooltip="Télécharger le bon"
              onClick={handleDownload}
              variant="ghost"
              disabled={!deliveryNoteUrl && !onDownload}
            />
          </div>
          <p className="text-xs text-slate-500">
            Le bon de livraison est disponible après validation
          </p>
        </div>
      </motion.div>
    </TooltipProvider>
  );
});

export default OrderActionsBar;
