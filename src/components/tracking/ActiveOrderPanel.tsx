import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { TrackingOrder } from "./LiveTrackingSection";

type ActiveOrderPanelProps = {
  orders: TrackingOrder[];
  onContact: (order: TrackingOrder, mode?: "call" | "chat" | "message") => void;
  onViewDetails: (order: TrackingOrder) => void;
};

const ActiveOrderPanel = ({ orders, onContact, onViewDetails }: ActiveOrderPanelProps) => {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-600">Aucune commande active pour le moment.</p>
      </div>
    );
  }

  const content = orders.map((order) => (
    <motion.article
      key={order.id}
      layout
      className="flex min-w-[260px] flex-1 flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      transition={{ type: "spring", stiffness: 160, damping: 20 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{order.code}</h3>
          <p className="text-xs text-slate-500">
            {order.driver.name} • {order.driver.vehicle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#EFF6FF] px-2 py-1 text-[11px] font-semibold text-[#2563EB]">
            ETA {order.eta}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-500 transition-colors duration-150 ease-out hover:text-[#2563EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2"
                aria-label={`Options pour ${order.driver.name}`}
              >
                ⋯
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuItem onSelect={() => onContact(order, "call")}>
                📞 Appeler le chauffeur
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onContact(order, "chat")}>
                💬 Ouvrir le chat
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onContact(order, "message")}>
                ✉️ Envoyer un message
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="space-y-1">
          <p>
            <span className="font-semibold text-slate-700">Distance</span> {order.distanceRemainingKm.toFixed(1)} km
          </p>
          <p>
            <span className="font-semibold text-slate-700">Véhicule</span> {order.driver.licensePlate}
          </p>
        </div>
        <div className="rounded-full bg-[#EFF6FF] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#2563EB]">
          {order.status}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          className="h-11 flex-1 rounded-lg bg-[#2563EB] text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1D4ED8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2"
          onClick={() => onContact(order)}
        >
          Contacter le chauffeur
        </Button>
        <Button
          variant="outline"
          className="h-11 flex-1 rounded-lg border-[#2563EB] bg-white text-sm font-semibold text-[#2563EB] transition-colors duration-150 ease-out hover:bg-[#EFF6FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2"
          onClick={() => onViewDetails(order)}
        >
          Voir la fiche commande
        </Button>
      </div>
    </motion.article>
  ));

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          {orders.length > 1 ? `Commandes actives (${orders.length})` : "Commande active"}
        </h2>
        <span className="text-xs text-slate-500">Synchronisé en continu</span>
      </div>
      <AnimatePresence initial={false}>
        {orders.length > 1 ? (
          <motion.div
            key="multiple"
            className="flex gap-4 overflow-x-auto pb-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {content}
          </motion.div>
        ) : (
          <motion.div
            key="single"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ActiveOrderPanel;
