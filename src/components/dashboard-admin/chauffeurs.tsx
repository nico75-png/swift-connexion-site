import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Gauge, MapPinned, Radio, ShieldCheck } from "lucide-react";
import TrackingMap from "@/components/tracking/TrackingMap";
import type { TrackingOrder } from "@/components/tracking/LiveTrackingSection";

const drivers = [
  {
    id: "DRV-8421",
    name: "Marc Leroy",
    zone: "Île-de-France",
    status: "Disponible",
    completed: 128,
    delays: 2,
    score: 96,
    lastMission: "Livraison express #CMD-54820",
  },
  {
    id: "DRV-8420",
    name: "Nadia Bensaïd",
    zone: "Auvergne-Rhône-Alpes",
    status: "En tournée",
    completed: 114,
    delays: 1,
    score: 92,
    lastMission: "Collecte Pharmaceutique #CMD-54812",
  },
  {
    id: "DRV-8419",
    name: "Alex Robin",
    zone: "PACA",
    status: "Disponible",
    completed: 102,
    delays: 4,
    score: 88,
    lastMission: "Dernier km #CMD-54818",
  },
];

const statusMap: Record<string, string> = {
  Disponible: "bg-[#10B981]/10 text-[#047857]",
  "En tournée": "bg-[#2563EB]/10 text-[#2563EB]",
  Indisponible: "bg-[#EF4444]/10 text-[#B91C1C]",
};

const liveOrder: TrackingOrder = {
  id: "order-admin-1",
  code: "CMD-2025-483",
  status: "En transit",
  driver: {
    name: "Amadou Diallo",
    avatar: "🚚",
    vehicle: "Renault Master E-Tech",
    licensePlate: "AZ-458-KL",
    phone: "+33 6 45 89 77 21",
  },
  eta: "16h10",
  origin: "HUB Paris Nord",
  destination: "Pharmacie Lafayette, 10 Rue Oberkampf",
  packages: "22 colis médicaux, signature requise",
  color: "#2563EB",
  route: [
    { lat: 48.8675, lng: 2.3332 },
    { lat: 48.8701, lng: 2.3498 },
    { lat: 48.8725, lng: 2.3631 },
    { lat: 48.8752, lng: 2.3786 },
  ],
  driverPosition: { lat: 48.8701, lng: 2.3498 },
  clientPosition: { lat: 48.8621, lng: 2.3795 },
  progress: 52,
  totalDistanceKm: 18,
  distanceRemainingKm: 8.4,
  lastUpdateAt: Date.now() - 45_000,
  contact: { email: "dispatch@swift.fr", phone: "+33 1 45 22 33 90" },
  messages: [],
};

const Chauffeurs = () => {
  const [selectedDriver, setSelectedDriver] = useState(drivers[0].id);

  const selectedDriverName = useMemo(() => drivers.find((driver) => driver.id === selectedDriver)?.name ?? "", [selectedDriver]);

  const handleBroadcast = () => {
    toast({
      title: "Note envoyée",
      description: `Un briefing a été transmis à ${selectedDriverName || "l'équipe"}.`,
    });
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl bg-[#0F172A] p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#60A5FA]">Flotte chauffeurs</p>
          <h1 className="mt-2 font-['Inter'] text-3xl font-semibold">Disponibilité et performance</h1>
          <p className="mt-2 text-sm text-white/70">
            Supervisez l'activité de vos chauffeurs et anticipez les besoins de renfort.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[#2563EB] shadow-lg transition hover:bg-slate-100">
            + Ajouter un chauffeur
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl border-white/30 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
          >
            Exporter le planning
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {drivers.map((driver) => (
          <Card key={driver.id} className="rounded-3xl border-none bg-white/95 shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-[#2563EB]/10 text-sm font-semibold text-[#2563EB]">
                  {driver.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{driver.name}</CardTitle>
                <CardDescription>{driver.id}</CardDescription>
              </div>
              <Badge className={`ml-auto rounded-2xl px-3 py-1 text-xs font-semibold ${statusMap[driver.status]}`}>
                {driver.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl bg-slate-50/80 p-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <MapPinned className="h-4 w-4 text-[#2563EB]" />
                  Zone d'intervention : <span className="font-semibold text-slate-900">{driver.zone}</span>
                </div>
                <div className="mt-3 text-xs text-slate-500">Dernière mission : {driver.lastMission}</div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-[#2563EB]/10 px-3 py-3 text-center text-sm text-[#2563EB]">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#1D4ED8]">Livraisons</p>
                  <p className="mt-1 text-lg font-semibold text-[#1D4ED8]">{driver.completed}</p>
                </div>
                <div className="rounded-2xl bg-[#10B981]/10 px-3 py-3 text-center text-sm text-[#047857]">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#047857]">Score qualité</p>
                  <p className="mt-1 text-lg font-semibold">{driver.score}%</p>
                </div>
                <div className="rounded-2xl bg-[#F97316]/10 px-3 py-3 text-center text-sm text-[#B45309]">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#B45309]">Retards</p>
                  <p className="mt-1 text-lg font-semibold">{driver.delays}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Taux de ponctualité</span>
                    <span className="font-semibold text-slate-900">{driver.score}%</span>
                  </div>
                  <Progress value={driver.score} className="mt-2 h-2 rounded-full bg-slate-100" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Taux d'incident</span>
                    <span className="font-semibold text-slate-900">{Math.max(0, 100 - driver.score - 2)}%</span>
                  </div>
                  <Progress value={Math.max(0, 100 - driver.score - 2)} className="mt-2 h-2 rounded-full bg-slate-100" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#10B981]" />
                  Documents et certifications à jour
                </span>
                <Button
                  variant="ghost"
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-[#2563EB] shadow-sm hover:border-[#2563EB]/40 hover:bg-[#2563EB]/10"
                >
                  Voir le dossier
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-3xl border-none bg-white/95 shadow-lg">
        <CardHeader className="flex flex-col gap-2 border-b border-slate-200/70 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl">Suivi géographique</CardTitle>
            <CardDescription>Localisation estimée des équipes terrain</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1 rounded-2xl bg-[#2563EB]/10 px-3 py-1 text-[#2563EB]">
              <Radio className="h-4 w-4" /> Mise à jour 45 sec
            </span>
            <span className="flex items-center gap-1 rounded-2xl bg-[#10B981]/10 px-3 py-1 text-[#047857]">
              <Gauge className="h-4 w-4" /> 112 chauffeurs en route
            </span>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-inner">
            <TrackingMap order={liveOrder} lastUpdateLabel="Mise à jour en temps réel" className="h-[320px]" disableInteractions={false} />
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">État de la flotte</p>
              <ul className="mt-3 space-y-2 text-xs">
                <li className="flex items-center justify-between">
                  <span>Véhicules disponibles</span>
                  <span className="rounded-full bg-[#10B981]/10 px-2 py-0.5 text-[#047857]">72</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Maintenance programmée</span>
                  <span className="rounded-full bg-[#F97316]/10 px-2 py-0.5 text-[#B45309]">6</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Incidents en cours</span>
                  <span className="rounded-full bg-[#EF4444]/10 px-2 py-0.5 text-[#B91C1C]">2</span>
                </li>
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <p className="font-semibold text-slate-900">Briefing quotidien</p>
              <p className="mt-2 text-xs">
                ✔️ Rotation équipes matin validée
                <br />✔️ Chauffeurs renfort disponibles à 14h
                <br />⚠️ Vérifier les chargements réfrigérés
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger className="rounded-2xl border-slate-200 text-xs text-slate-600">
                    <SelectValue placeholder="Choisir un chauffeur" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="rounded-2xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1D4ED8]"
                  onClick={handleBroadcast}
                >
                  Envoyer une note de service
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full rounded-2xl border-slate-200 text-sm text-slate-600 transition hover:border-[#2563EB]/40 hover:text-[#2563EB]"
              onClick={() => toast({ title: "Incident signalé", description: "Le dispatch analyse la situation en cours." })}
            >
              Signaler un incident terrain
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chauffeurs;
