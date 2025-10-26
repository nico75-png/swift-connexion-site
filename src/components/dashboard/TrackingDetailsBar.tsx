import { LiveOrder } from "./TrackingCard";
import { Button } from "@/components/ui/button";
import { Phone, FileText } from "lucide-react";

type TrackingDetailsBarProps = {
  order: LiveOrder | null;
};

export const TrackingDetailsBar = ({ order }: TrackingDetailsBarProps) => {
  if (!order) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-slate-500">Commande active</p>
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
          <p className="text-base font-semibold text-slate-900">{order.orderNumber}</p>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="font-medium text-slate-900">{order.driver.name}</span>
            <span className="hidden text-slate-400 md:inline">•</span>
            <span>{order.driver.vehicle}</span>
            <span className="hidden text-slate-400 md:inline">•</span>
            <span className="text-slate-500">Arrivée estimée {order.eta}</span>
            <span className="hidden text-slate-400 md:inline">•</span>
            <span className="text-slate-500">{order.distanceRemainingKm.toFixed(1)} km restants</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <Button variant="secondary" className="flex items-center gap-2" size="sm">
          <Phone className="h-4 w-4" />
          Contacter le chauffeur
        </Button>
        <Button variant="outline" className="flex items-center gap-2 border-slate-200" size="sm">
          <FileText className="h-4 w-4" />
          Voir la fiche commande
        </Button>
      </div>
    </div>
  );
};

export default TrackingDetailsBar;
