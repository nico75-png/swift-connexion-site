import { CheckCircle2, Circle, Dot, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stateColor = (position) => {
  switch (position) {
    case "past":
      return "bg-slate-200 text-slate-400";
    case "current":
      return "bg-sky-500 text-white";
    default:
      return "bg-slate-100 text-slate-300";
  }
};

const HistoryTimeline = ({ history = [], onDownloadPdf, isDownloading }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Historique</h3>
        <p className="text-sm text-slate-500">
          Suivi chronologique des événements de la commande
        </p>
      </div>
      <ol className="relative ml-4 space-y-8 border-l-2 border-sky-100 pl-6">
        {history.map((step, index) => {
          const position = step.position ?? (index === 0 ? "current" : index < history.length - 1 ? "past" : "future");
          const Icon = position === "current" ? Dot : position === "past" ? CheckCircle2 : Circle;
          const titleClass =
            position === "future"
              ? "text-slate-400"
              : position === "past"
              ? "text-slate-600"
              : "text-slate-900";
          const descriptionClass =
            position === "future"
              ? "text-slate-400"
              : position === "past"
              ? "text-slate-500"
              : "text-slate-600";
          return (
            <li key={`${step.title}-${index}`} className="relative">
              <span
                className={cn(
                  "absolute -left-[38px] flex h-7 w-7 items-center justify-center rounded-full border-4 border-white",
                  stateColor(position),
                )}
                aria-hidden
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="flex flex-col gap-1">
                <p className={`text-sm font-semibold ${titleClass}`}>{step.title}</p>
                <p className={`text-sm ${descriptionClass}`}>{step.description}</p>
                <span className="text-xs uppercase tracking-wide text-slate-400">{step.timestamp}</span>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-8 flex justify-end">
        <Button
          variant="outline"
          onClick={onDownloadPdf}
          disabled={isDownloading}
          className="rounded-xl border-sky-200 text-sky-600 hover:bg-sky-50"
        >
          <FileDown className="mr-2 h-4 w-4" />
          {isDownloading ? "Préparation..." : "Télécharger le bon de commande"}
        </Button>
      </div>
    </div>
  );
};

export default HistoryTimeline;
