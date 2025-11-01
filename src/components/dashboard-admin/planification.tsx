import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Calendar, MapPin, Radio, RefreshCw, Users } from "lucide-react";

interface PlanificationProps {
  onDispatch?: () => void;
}

const planningSlots = [
  {
    id: "slot-1",
    time: "08:00",
    driver: "Marc Leroy",
    route: "Paris → Clichy → Levallois",
    status: "Confirmée",
  },
  {
    id: "slot-2",
    time: "09:30",
    driver: "Nadia Bensaïd",
    route: "Paris → Orly → Massy",
    status: "En ajustement",
  },
  {
    id: "slot-3",
    time: "11:15",
    driver: "Alex Robin",
    route: "Paris → Nanterre",
    status: "Incident",
  },
  {
    id: "slot-4",
    time: "13:00",
    driver: "Yanis Ben Amar",
    route: "Paris → Roissy",
    status: "Confirmée",
  },
];

const drivers = ["Marc Leroy", "Nadia Bensaïd", "Alex Robin", "Yanis Ben Amar", "Chloé Martin"];

const statusClassMap: Record<string, string> = {
  Confirmée: "bg-[#10B981]/10 text-[#047857]",
  "En ajustement": "bg-[#F59E0B]/10 text-[#B45309]",
  Incident: "bg-[#EF4444]/10 text-[#B91C1C]",
};

const incidents = [
  {
    id: "incident-1",
    label: "Trafic dense A86",
    description: "Proposer un reroutage via A15 pour l'équipe Alex",
    severity: "Élevée",
  },
  {
    id: "incident-2",
    label: "Véhicule en maintenance",
    description: "Prévoir un remplacement sur la tournée Roissy",
    severity: "Modérée",
  },
];

const Planification = ({ onDispatch }: PlanificationProps) => {
  const [selectedSlot, setSelectedSlot] = useState<typeof planningSlots[number] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDriver, setNewDriver] = useState<string>(drivers[0]);
  const [note, setNote] = useState("Brief chauffeur : vérifier les points de livraison sensibles.");

  const confirmedCount = useMemo(
    () => planningSlots.filter((slot) => slot.status === "Confirmée").length,
    [],
  );

  const openDialog = (slot: typeof planningSlots[number]) => {
    setSelectedSlot(slot);
    setNewDriver(slot.driver);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedSlot) {
      return;
    }
    toast({
      title: "Planification mise à jour",
      description: `${selectedSlot.driver} remplacé par ${newDriver}.`,
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/95 px-6 py-5 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0B2D55]">Planification</p>
          <h1 className="mt-2 font-['Inter'] text-3xl font-semibold text-slate-900">Agenda des tournées & incidents</h1>
          <p className="mt-2 text-sm text-slate-600">
            Ajustez vos ressources, réaffectez un chauffeur ou signalez un incident critique en temps réel.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-[#0B2D55]/40 hover:text-[#0B2D55]"
            onClick={onDispatch}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Dispatcher une tournée
          </Button>
          <Button className="rounded-2xl bg-[#0B2D55] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#091a33]">
            Exporter le planning
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="rounded-3xl border-none bg-white/95 shadow-lg">
          <CardHeader className="flex flex-col gap-4 border-b border-slate-200/70 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl">Tournées du jour</CardTitle>
              <CardDescription>Analysez la disponibilité des chauffeurs</CardDescription>
            </div>
            <Badge className="rounded-2xl bg-[#0B2D55]/10 px-3 py-1 text-[#0B2D55]">
              {confirmedCount} confirmées
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {planningSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-col gap-3 rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 shadow-sm transition hover:border-[#0B2D55]/40 hover:bg-white"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-[#0B2D55]" />
                    <span className="font-semibold text-slate-900">{slot.time}</span>
                    <span className="hidden text-xs text-slate-500 sm:inline">{slot.route}</span>
                  </div>
                  <Badge className={`rounded-2xl px-3 py-1 text-xs font-semibold ${statusClassMap[slot.status]}`}>
                    {slot.status}
                  </Badge>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="h-4 w-4 text-[#0B2D55]" />
                    <span className="font-semibold text-slate-900">{slot.driver}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <MapPin className="h-4 w-4 text-[#0B2D55]" />
                    {slot.route}
                  </div>
                  <Button
                    size="sm"
                    className="rounded-2xl bg-[#0B2D55] text-xs font-semibold text-white hover:bg-[#091a33]"
                    onClick={() => openDialog(slot)}
                  >
                    Réaffecter / noter
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none bg-white/95 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Incidents & alertes</CardTitle>
            <CardDescription>Suivi temps réel des anomalies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[340px] rounded-3xl border border-slate-200 bg-white/95">
              <div className="space-y-4 p-4 text-sm text-slate-600">
                {incidents.map((incident) => (
                  <div key={incident.id} className="space-y-2 rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-900">{incident.label}</span>
                      <Badge className="rounded-2xl bg-[#EF4444]/10 px-3 py-1 text-xs font-semibold text-[#B91C1C]">
                        {incident.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">{incident.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-2xl border-slate-200 text-xs text-slate-600 hover:border-[#0B2D55]/40 hover:text-[#0B2D55]"
                      onClick={onDispatch}
                    >
                      Ouvrir le rapport dispatch
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-500">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Radio className="h-4 w-4 text-[#0B2D55]" /> Flux radio
              </p>
              <p className="mt-2">
                14h05 – Retard signalé porte de Clichy.
                <br />14h12 – Reprise circulation, tournée maintenue.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-xl">
          {selectedSlot && (
            <>
              <DialogHeader>
                <DialogTitle>Réaffecter la tournée de {selectedSlot.driver}</DialogTitle>
                <DialogDescription>
                  Créneau {selectedSlot.time} · {selectedSlot.route}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Nouveau chauffeur</label>
                  <Select value={newDriver} onValueChange={setNewDriver}>
                    <SelectTrigger className="rounded-2xl border-slate-200">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver} value={driver}>
                          {driver}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Points de contrôle</label>
                  <Textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    className="min-h-[140px] rounded-2xl border-slate-200"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Notifier</label>
                  <Input
                    placeholder="dispatch@swift-connexion.fr"
                    className="rounded-2xl border-slate-200"
                    onFocus={() => toast({ title: "Notification activée", description: "Le dispatch recevra un résumé détaillé." })}
                  />
                </div>
              </div>
              <DialogFooter className="flex items-center justify-between gap-3">
                <Button variant="outline" className="rounded-2xl border-slate-200" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button className="rounded-2xl bg-[#0B2D55] text-white hover:bg-[#091a33]" onClick={handleSave}>
                  Enregistrer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Planification;
