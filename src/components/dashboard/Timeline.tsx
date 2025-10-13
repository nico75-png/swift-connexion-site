import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface TimelineStep {
  label: string;
  time: string;
  status: "done" | "current" | "pending" | "cancelled";
}

interface TimelineProps {
  steps: TimelineStep[];
}

/**
 * Composant Timeline pour afficher les étapes d'une commande
 */
const Timeline = ({ steps }: TimelineProps) => {
  const getIcon = (status: TimelineStep["status"]) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "current":
        return <Clock className="h-5 w-5 text-primary animate-pulse" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-4">
          {/* Icône */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            {getIcon(step.status)}
          </div>

          {/* Contenu */}
          <div className="flex-1">
            <p className={`font-medium ${step.status === "pending" ? "text-muted-foreground" : ""}`}>
              {step.label}
            </p>
            <p className="text-sm text-muted-foreground">{step.time}</p>
          </div>

          {/* Ligne verticale (sauf pour le dernier) */}
          {index < steps.length - 1 && (
            <div className="absolute left-[1.25rem] mt-12 h-8 w-0.5 bg-border" />
          )}
        </div>
      ))}
    </div>
  );
};

export default Timeline;
