import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

import type { TrackingOrder } from "./LiveTrackingSection";

type ActiveOrdersListProps = {
  orders: TrackingOrder[];
  selectedOrderId: string | null;
  onSelect: (orderId: string) => void;
  onViewDetails: (order: TrackingOrder) => void;
};


const ActiveOrdersList = ({ orders, selectedOrderId, onSelect, onViewDetails }: ActiveOrdersListProps) => {
  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl bg-[#F9FAFB] p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Commandes en transit</h2>
          <p className="text-xs text-slate-500">Suivez en temps réel les livraisons actives</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow">
          {orders.length} en cours
        </span>
      </div>
      <ul className="flex flex-col gap-3" role="list">
        {orders.map((order, index) => {
          const isActive = order.id === selectedOrderId;

          return (
            <motion.li
              key={order.id}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={listVariants}
              className="list-none"
            >
              <article
                className={cn(
                  "group flex flex-col gap-3 rounded-xl border border-transparent bg-white p-4 shadow-sm transition-colors duration-200 ease-out",
                  isActive && "border-[#2563EB] bg-[#EFF6FF]",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelect(order.id)}
                    className="flex flex-1 items-start gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2"
                  >
                    <span
                      aria-hidden
                      className="mt-1 h-3 w-3 flex-none rounded-full"
                      style={{ backgroundColor: order.color }}
                    />
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-slate-900">{order.code}</h3>
                      <p className="text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{order.driver.name}</span> • {order.driver.vehicle} • {order.driver.licensePlate}
                      </p>
                    </div>
                  </button>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow">
                    {order.driver.avatar}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex-1">
                    <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full"
                        style={{
                          backgroundImage: "linear-gradient(90deg, #2563EB 0%, #60A5FA 100%)",
                          width: `${order.progress}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-500">
                      <span>{order.progress.toFixed(0)}%</span>
                      <span>{order.distanceRemainingKm.toFixed(1)} km restants</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-right text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">ETA {order.eta}</span>
                    <span>{order.status}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelect(order.id)}
                    className="inline-flex h-10 min-w-[44px] items-center justify-center rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1D4ED8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2"
                  >
                    Suivre sur la carte
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewDetails(order)}
                    className="text-xs font-semibold text-[#2563EB] transition-colors duration-150 ease-out hover:text-[#1D4ED8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2"
                  >
                    Détails
                  </button>
                </div>
              </article>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
};

export default ActiveOrdersList;
