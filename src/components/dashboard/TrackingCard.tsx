import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export type DriverInfo = {
  name: string;
  avatar: string;
  vehicle: string;
};

export type LiveOrder = {
  id: string;
  orderNumber: string;
  driver: DriverInfo;
  eta: string;
  status: string;
  progress: number;
  distanceRemainingKm: number;
};

type TrackingCardProps = {
  order: LiveOrder;
  isActive: boolean;
  onSelect: (orderId: string) => void;
};

const progressBarStyles = "h-2 rounded-full bg-slate-200 overflow-hidden";

export const TrackingCard = ({ order, isActive, onSelect }: TrackingCardProps) => {
  return (
    <motion.button
      type="button"
      layout
      role="button"
      aria-pressed={isActive}
      onClick={() => onSelect(order.id)}
      className={`group flex w-full snap-start flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 focus-visible:ring-blue-300 ${
        isActive ? "ring-1 ring-blue-400 shadow-lg" : "hover:-translate-y-0.5 hover:shadow-xl"
      }`}
      whileHover={{ scale: isActive ? 1 : 1.02 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Commande</p>
          <p className="mt-1 text-base font-semibold text-slate-900">{order.orderNumber}</p>
        </div>
        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-xs text-blue-700">
          En transit 🚚
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg">{order.driver.avatar}</div>
        <div>
          <p className="text-sm font-medium text-slate-900">{order.driver.name}</p>
          <p className="text-xs text-slate-500">{order.driver.vehicle}</p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-500">Arrivée prévue</p>
        <p className="text-sm font-semibold text-slate-900">{order.eta}</p>
      </div>

      <div className="space-y-2">
        <div className={progressBarStyles}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 transition-all duration-500"
            style={{ width: `${Math.min(order.progress, 100)}%` }}
            aria-hidden
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{Math.round(order.progress)}% parcourus</span>
          <span>{order.distanceRemainingKm.toFixed(1)} km restants</span>
        </div>
      </div>

      <motion.span
        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        layout="position"
      >
        Suivre sur la carte
      </motion.span>
    </motion.button>
  );
};

export default TrackingCard;
