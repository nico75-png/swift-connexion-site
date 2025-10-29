import { CalendarClock, AlertCircle, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Event {
  id: number;
  title: string;
  time: string;
  type: "briefing" | "urgent" | "invoice";
  icon: React.ElementType;
  color: string;
}

const EVENTS: Event[] = [
  {
    id: 1,
    title: "Briefing client transport",
    time: "Aujourd'hui • 14:00",
    type: "briefing",
    icon: CalendarClock,
    color: "bg-orange-500",
  },
  {
    id: 2,
    title: "Suivi des colis express",
    time: "Dans 2 h",
    type: "urgent",
    icon: AlertCircle,
    color: "bg-blue-500",
  },
  {
    id: 3,
    title: "Relance factures en attente",
    time: "Demain • 09:30",
    type: "invoice",
    icon: FileText,
    color: "bg-emerald-500",
  },
];

const UpcomingEvents = () => {
  return (
    <Card className="rounded-3xl border-none bg-background/80 shadow-sm ring-1 ring-black/5">
      <CardHeader>
        <CardTitle className="text-xl">Événements à venir</CardTitle>
        <CardDescription>Actions prioritaires et rendez-vous</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {EVENTS.map((event) => (
            <li
              key={event.id}
              className="flex items-start gap-4 rounded-2xl border border-muted-foreground/20 bg-muted/10 p-4 transition-all duration-300 hover:border-muted-foreground/30 hover:shadow-sm"
            >
              <div className={cn("rounded-xl p-2.5", event.color)}>
                <event.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{event.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{event.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;
