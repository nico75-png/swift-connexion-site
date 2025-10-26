import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import type { TrackingOrder } from "./LiveTrackingSection";

type OrderDetailsSlideOverProps = {
  order: TrackingOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const OrderDetailsSlideOver = ({ order, open, onOpenChange }: OrderDetailsSlideOverProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md border-l border-slate-200 bg-white" side="right">
        <SheetHeader className="gap-3 text-left">
          <SheetTitle className="text-lg font-semibold text-slate-900">
            {order?.code ?? "Commande"}
          </SheetTitle>
          <SheetDescription className="text-xs text-slate-500">
            Statut {order?.status ?? "En transit"}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4 text-sm text-slate-600">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Chauffeur</h3>
            <p className="mt-1 text-sm text-slate-700">{order?.driver.name}</p>
            <p className="text-xs text-slate-500">{order?.driver.vehicle}</p>
            <p className="text-xs text-slate-500">Plaque {order?.driver.licensePlate}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Livraison</h3>
            <p className="mt-1 text-sm text-slate-700">Origine : {order?.origin}</p>
            <p className="text-sm text-slate-700">Destination : {order?.destination}</p>
            <p className="text-xs text-slate-500">
              Distance restante {order ? `${order.distanceRemainingKm.toFixed(1)} km` : "–"}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Colis</h3>
            <p className="mt-1 text-sm text-slate-700">{order?.packages}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contacts</h3>
            <p className="mt-1 text-sm text-slate-700">{order?.contact.email}</p>
            <p className="text-sm text-slate-700">{order?.contact.phone}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Suivi</h3>
            <p className="mt-1 text-sm text-slate-700">Avancement {order ? `${order.progress.toFixed(0)}%` : "–"}</p>
            <p className="text-xs text-slate-500">Dernière mise à jour {order ? new Date(order.lastUpdateAt).toLocaleTimeString("fr-FR") : "–"}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default OrderDetailsSlideOver;
