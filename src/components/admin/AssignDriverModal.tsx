import { useEffect, useMemo, useState } from "react";

import { Calendar, Clock, Filter, Phone, Search } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import {
  assignDriverNow,
  formatDateTime,
  isDriverAvailable,
  isFuture,
  rescheduleDriverAssignment,
  scheduleDriverAssignment,
  type Driver,
  type Order,
  type ScheduledAssignment,
} from "@/lib/mockData";
import { useDrivers } from "@/hooks/useMockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AssignMode = "now" | "later";

interface AssignDriverModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  initialMode?: AssignMode;
  scheduledAssignment?: ScheduledAssignment | null;
}

const statusStyles: Record<string, string> = {
  Disponible: "bg-success/10 text-success border-success/20",
  "En course": "bg-info/10 text-info border-info/20",
  "En pause": "bg-warning/10 text-warning border-warning/20",
};

const AssignDriverModal = ({ order, open, onClose, initialMode = "now", scheduledAssignment }: AssignDriverModalProps) => {
  const drivers = useDrivers();
  const { toast } = useToast();
  const [mode, setMode] = useState<AssignMode>(initialMode);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setSearchTerm("");
      setStatusFilter("all");
      setZoneFilter("all");
      setSelectedDriver(null);
      setScheduledDate("");
      setScheduledTime("");
      setError("");

      if (scheduledAssignment) {
        const scheduledAt = scheduledAssignment.scheduledAt;
        const scheduledDateObj = new Date(scheduledAt);
        setScheduledDate(scheduledDateObj.toISOString().slice(0, 10));
        setScheduledTime(scheduledDateObj.toISOString().slice(11, 16));
        setSelectedDriver(scheduledAssignment.driverId);
      }
    }
  }, [open, initialMode, scheduledAssignment]);

  const availableZones = useMemo(() => {
    const zones = new Set<string>();
    drivers.forEach((driver) => zones.add(driver.zone));
    return Array.from(zones);
  }, [drivers]);

  const filteredDrivers = useMemo(() => {
    return drivers
      .filter((driver) => {
        const term = searchTerm.toLowerCase().trim();
        if (term && !driver.name.toLowerCase().includes(term) && !driver.phone.includes(term)) {
          return false;
        }
        if (statusFilter !== "all" && driver.status !== statusFilter) {
          return false;
        }
        if (zoneFilter !== "all" && driver.zone !== zoneFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [drivers, searchTerm, statusFilter, zoneFilter]);

  const resetAndClose = () => {
    onClose();
  };

  const handleConfirm = async () => {
    if (!order) {
      return;
    }

    if (!selectedDriver) {
      setError("Sélectionnez un chauffeur");
      return;
    }

    const driver = drivers.find((item) => item.id === selectedDriver);
    if (!driver) {
      setError("Sélectionnez un chauffeur");
      return;
    }

    if (!driver.isActive) {
      setError("Ce chauffeur n'est pas actif pour cette date");
      return;
    }

    if (driver.status === "En pause") {
      setError("Chauffeur en pause — sélection impossible");
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "now") {
        const now = new Date();
        const start = now.toISOString();
        const fallbackEnd = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
        const end =
          order.windowEnd && new Date(order.windowEnd).getTime() > now.getTime()
            ? order.windowEnd
            : fallbackEnd;

        if (!isDriverAvailable(driver.id, start, end)) {
          setError("Chauffeur indisponible sur ce créneau");
          setSubmitting(false);
          return;
        }

        assignDriverNow(order.id, driver.id, {
          start,
          end,
          source: "manual",
        });

        toast({
          title: "Chauffeur affecté",
          description: `${driver.name} a été affecté à la commande ${order.id}`,
        });
      } else {
        if (!scheduledDate || !scheduledTime) {
          setError("Veuillez choisir une date et une heure futures");
          setSubmitting(false);
          return;
        }

        const scheduledAtLocal = new Date(`${scheduledDate}T${scheduledTime}`);
        const scheduledAtIso = scheduledAtLocal.toISOString();

        if (!isFuture(scheduledAtIso)) {
          setError("Veuillez choisir une date et une heure futures");
          setSubmitting(false);
          return;
        }

        const window = order.windowStart && order.windowEnd
          ? { start: order.windowStart, end: order.windowEnd }
          : { start: scheduledAtIso, end: new Date(scheduledAtLocal.getTime() + 60 * 60 * 1000).toISOString() };

        if (!isDriverAvailable(driver.id, window.start, window.end)) {
          setError(`Conflit horaire détecté avec la commande ${order.id}`);
          setSubmitting(false);
          return;
        }

        if (scheduledAssignment) {
          rescheduleDriverAssignment(scheduledAssignment.id, scheduledAtIso, window);
        } else {
          scheduleDriverAssignment(order.id, driver.id, scheduledAtIso, window);
        }

        toast({
          title: scheduledAssignment ? "Planification mise à jour" : "Affectation planifiée",
          description: `${driver.name} sera affecté le ${formatDateTime(scheduledAtIso)}`,
        });
      }

      resetAndClose();
    } catch (caughtError) {
      console.error(caughtError);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDisabled = useMemo(() => {
    if (!selectedDriver) {
      return true;
    }
    if (mode === "later") {
      return submitting || !scheduledDate || !scheduledTime;
    }
    return submitting;
  }, [mode, scheduledDate, scheduledTime, selectedDriver, submitting]);

  const handleModeChange = (value: string) => {
    setMode(value as AssignMode);
    setError("");
  };

  const renderDriverCard = (driver: Driver) => {
    const disabled = !driver.isActive || driver.status === "En pause";
    const selected = selectedDriver === driver.id;

    return (
      <label
        key={driver.id}
        className={`block rounded-lg border p-4 transition-base cursor-pointer focus-within:ring-2 focus-within:ring-primary/50 ${
          selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input
          type="radio"
          name="driver"
          value={driver.id}
          checked={selected}
          disabled={disabled}
          onChange={() => {
            setSelectedDriver(driver.id);
            setError("");
          }}
          className="sr-only"
        />
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-base font-semibold">{driver.name}</p>
            <a href={`tel:${driver.phone}`} className="text-sm text-primary inline-flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {driver.phone}
            </a>
            <p className="text-sm text-muted-foreground">{driver.vehicle}</p>
            <div className="flex gap-2 pt-2">
              <Badge variant="outline">{driver.zone}</Badge>
              <Badge variant="outline" className={statusStyles[driver.status] || ""}>
                {driver.status}
              </Badge>
            </div>
            {driver.nextSlot && (
              <p className="text-xs text-muted-foreground pt-2">Prochain créneau : {formatDateTime(driver.nextSlot.start)}</p>
            )}
            {!driver.isActive && (
              <p className="text-xs text-destructive font-medium pt-2">Chauffeur inactif sur la période</p>
            )}
            {driver.status === "En pause" && (
              <p className="text-xs text-warning font-medium pt-2">En pause — sélection impossible</p>
            )}
          </div>
        </div>
      </label>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(value) => (!value ? resetAndClose() : undefined)}>
      <DialogContent
        className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        aria-labelledby="assign-driver-title"
        role="dialog"
        aria-modal="true"
      >
        <DialogHeader>
          <DialogTitle id="assign-driver-title">Affecter un chauffeur</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={handleModeChange} className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="now">Affecter maintenant</TabsTrigger>
            <TabsTrigger value="later">Affecter plus tard</TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-6">
            <section className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[1fr,150px,150px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom ou téléphone"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Disponibilité</SelectItem>
                    <SelectItem value="Disponible">Disponible</SelectItem>
                    <SelectItem value="En course">En course</SelectItem>
                    <SelectItem value="En pause">En pause</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={zoneFilter} onValueChange={setZoneFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les zones</SelectItem>
                    {availableZones.map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                {filteredDrivers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun chauffeur ne correspond aux critères.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredDrivers.map((driver) => renderDriverCard(driver))}
                  </div>
                )}
              </div>
            </section>

            {mode === "later" && (
              <section className="space-y-4" aria-describedby="assign-later-help">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="assign-date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Date
                    </Label>
                    <Input
                      id="assign-date"
                      type="date"
                      value={scheduledDate}
                      onChange={(event) => setScheduledDate(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assign-time" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Heure
                    </Label>
                    <Input
                      id="assign-time"
                      type="time"
                      value={scheduledTime}
                      onChange={(event) => setScheduledTime(event.target.value)}
                    />
                  </div>
                </div>
                {order?.windowStart && order?.windowEnd ? (
                  <p className="text-sm text-muted-foreground">
                    Fenêtre estimée : {formatDateTime(order.windowStart)} → {formatDateTime(order.windowEnd)}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Fenêtre par défaut de 1h appliquée si aucun horaire n'est défini.
                  </p>
                )}
                <p id="assign-later-help" className="text-xs text-muted-foreground">
                  Le chauffeur sera affecté automatiquement à l'heure choisie.
                </p>
              </section>
            )}

            {error && <p className="text-sm font-medium text-destructive" aria-live="assertive">{error}</p>}
          </div>
        </Tabs>

        <DialogFooter className="sticky bottom-0 mt-6 flex flex-col gap-2 bg-card/90 pt-4 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={resetAndClose} className="w-full sm:w-auto">
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={confirmDisabled}
            className="w-full sm:w-auto"
          >
            {mode === "now" ? "Confirmer l'affectation" : "Planifier l'affectation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignDriverModal;

