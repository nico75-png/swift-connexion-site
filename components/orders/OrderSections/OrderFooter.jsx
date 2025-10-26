import { Button } from "@/components/ui/button";

const OrderFooter = ({ lastUpdated, onClose }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <p className="text-sm text-slate-400">Dernière mise à jour : {lastUpdated ?? "-"}</p>
        <div className="w-full pt-3 md:w-auto md:pt-0">
          <Button
            variant="secondary"
            onClick={onClose}
            className="h-12 w-full rounded-xl px-6 font-semibold md:w-auto"
          >
            Fermer la fiche
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderFooter;
