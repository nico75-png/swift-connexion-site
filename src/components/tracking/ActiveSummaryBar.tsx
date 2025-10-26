import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

export type SummaryCounts = {
  inTransit: number;
  waiting: number;
  deliveredToday: number;
};

type ActiveSummaryBarProps = {
  summary: SummaryCounts;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastUpdateLabel: string;
};

const REFRESH_DURATION = 0.8;

const ActiveSummaryBar = ({ summary, onRefresh, isRefreshing = false, lastUpdateLabel }: ActiveSummaryBarProps) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isRefreshing) {
      void controls.start({ rotate: 360, transition: { duration: REFRESH_DURATION, ease: "easeOut" } });
    }
  }, [controls, isRefreshing]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-[#F9FAFB] px-5 py-3 shadow-sm">
      <p className="text-sm font-medium text-[#4B5563]">
        {summary.inTransit} commande{summary.inTransit > 1 ? "s" : ""} en transit • {summary.waiting} en attente • {summary.deliveredToday}
        {" "}
        livrée{summary.deliveredToday > 1 ? "s" : ""} aujourd’hui
      </p>
      <div className="flex items-center gap-3 text-xs text-[#4B5563]">
        <span aria-live="polite" aria-atomic className="rounded-full bg-white px-3 py-1 font-medium shadow">
          Dernière mise à jour {lastUpdateLabel}
        </span>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-10 min-w-[44px] items-center justify-center rounded-lg bg-white px-3 text-sm font-semibold text-[#2563EB] shadow transition-colors duration-150 ease-out hover:bg-[#EFF6FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2"
          aria-label="Actualiser le suivi"
        >
          <motion.span animate={controls} initial={false} className="text-lg leading-none">
            🔄
          </motion.span>
        </button>
      </div>
    </div>
  );
};

export default ActiveSummaryBar;
