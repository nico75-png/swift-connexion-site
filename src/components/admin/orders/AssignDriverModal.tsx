import { useEffect, useMemo, useRef, useState } from "react";
import { Phone, Search, Truck, UserCheck, CalendarClock, Info } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useDriversStore } from "@/providers/AdminDataProvider";
import { type Driver } from "@/lib/stores/driversOrders.store";
import { driverStatusBadgeClass, driverStatusLabel } from "./driverUtils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AssignDriverModalProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned?: (driverId: string) => void;
  currentDriverId?: string | null;
  allowAssignment?: boolean;
}

const availabilityFilters = [
  { value: "all", label: "Tous" },
  { value: "AVAILABLE", label: "Disponible" },
  { value: "ON_TRIP", label: "En course" },
  { value: "PAUSED", label: "En pause" },
] as const;

const getNextDriverUnavailability = (items: Driver["unavailabilities"] = []) => {
  const now = Date.now();
  return (items ?? [])
    .slice()
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .find((item) => new Date(item.end).getTime() > now);
};

const AssignDriverModal = ({
  orderId,
  open,
  onOpenChange,
  onAssigned,
  currentDriverId = null,
  allowAssignment = true,
}: AssignDriverModalProps) => {
  const { drivers } = useDriversStore();
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<typeof availabilityFilters[number]["value"]>("AVAILABLE");
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const selectedDriver = useMemo(
    () => drivers.find((driver) => driver.id === selectedDriverId) || null,
    [drivers, selectedDriverId],
  );

  useEffect(() => {
    if (open) {
      setSearch("");
      setAvailabilityFilter("AVAILABLE");
      setFormError(null);
      setSelectedDriverId(currentDriverId);
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [open, currentDriverId]);

  useEffect(() => {
    if (selectedDriverId) {
      setFormError(null);
    }
  }, [selectedDriverId]);

  const filteredDrivers = useMemo(() => {
    const query = search.toLowerCase();
    return drivers.filter((driver) => {
      const matchesSearch =
        driver.name.toLowerCase().includes(query) ||
        driver.phone.replace(/\s/g, "").includes(query.replace(/\s/g, ""));
      const matchesStatus = availabilityFilter === "all" || driver.status === availabilityFilter;
      return matchesSearch && matchesStatus && driver.lifecycleStatus !== "INACTIF";
    });
  }, [drivers, search, availabilityFilter]);

  const canConfirm = Boolean(selectedDriverId && allowAssignment);

  const handleOpenStateChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setFormError(null);
      setSelectedDriverId(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDriverId) {
      setFormError("Sélectionnez un chauffeur");
      return;
    }
    if (!allowAssignment) {
      setFormError("L'affectation n'est pas autorisée pour ce statut");
      return;
    }

    onAssigned?.(selectedDriverId);
  };

  const renderDriverCard = (driver: typeof drivers[number]) => {
    const isSelected = selectedDriverId === driver.id;
    const nextUnavailability = getNextDriverUnavailability(driver.unavailabilities);
    const isInactive = driver.lifecycleStatus === "INACTIF";

    return (
      <li
        key={driver.id}
        className={cn(
          "border rounded-lg p-4 transition-all",
          "hover:border-primary/70 hover:shadow-sm",
          isSelected ? "border-primary ring-2 ring-primary/20" : "border-border",
        )}
      >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-base font-semibold text-foreground flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  {driver.name}
                </p>
                <a
                  href={`tel:${driver.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  {driver.phone}
                </a>
                {isInactive && (
                  <p className="mt-1 text-sm text-amber-600">Ce chauffeur est inactif.</p>
                )}
              </div>
              <Badge variant="outline" className={cn("capitalize", driverStatusBadgeClass[driver.status])}>
                {driverStatusLabel[driver.status]}
              </Badge>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <span>
                {driver.vehicle.type} · {driver.vehicle.capacity}
                {driver.vehicle.registration ? ` · ${driver.vehicle.registration}` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Prochain créneau</p>
                <p className="font-medium text-foreground">{driver.nextFreeSlot}</p>
              </div>
            </div>
          </div>

          {nextUnavailability && (
            <Alert className="border-dashed border border-border bg-muted/40">
              <AlertDescription className="text-sm text-muted-foreground">
                Prochaine indisponibilité :
                {" "}
                {`${format(new Date(nextUnavailability.start), "dd MMM yyyy · HH'h'mm", { locale: fr })} → ${format(new Date(nextUnavailability.end), "HH'h'mm", { locale: fr })}`}
                {nextUnavailability.reason ? ` — ${nextUnavailability.reason}` : ""}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              variant={isSelected ? "default" : "outline"}
              onClick={() => setSelectedDriverId(driver.id)}
              disabled={driver.status === "PAUSED" || !driver.active || isInactive}
            >
              {isSelected ? "Sélectionné" : "Sélectionner"}
            </Button>
          </div>
        </div>
      </li>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenStateChange}>
      <DialogContent
        id="modal-assign-driver"
        aria-labelledby="assignDriverTitle"
        aria-describedby={formError ? "assign-driver-error" : undefined}
        className="max-w-3xl w-[95vw] p-0 sm:p-0 overflow-hidden sm:rounded-2xl"
      >
        <form id="form-assign-driver" className="flex h-full max-h-[90vh] flex-col" onSubmit={handleSubmit}>
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle id="assignDriverTitle">Affecter un chauffeur</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Sélectionnez un chauffeur disponible pour la commande {orderId ?? ""}.
            </p>
          </DialogHeader>

          <div className="px-6 pb-4 space-y-4">
            <Alert className="bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary" aria-hidden />
                <AlertDescription className="text-sm text-primary">
                  Règle One Connexion : tous les chauffeurs sont habilités à intervenir sur toutes les zones.
                </AlertDescription>
              </div>
            </Alert>
            <div className="grid gap-4 md:grid-cols-[1.5fr,1fr]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Label htmlFor="driver-search" className="sr-only">Recherche chauffeur</Label>
                <Input
                  id="driver-search"
                  ref={searchRef}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Recherche par nom ou téléphone"
                  className="pl-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-availability">Disponibilité</Label>
                <div id="filter-availability" className="flex gap-2 flex-wrap">
                  {availabilityFilters.map((filter) => (
                    <Button
                      key={filter.value}
                      type="button"
                      size="sm"
                      variant={availabilityFilter === filter.value ? "default" : "outline"}
                      onClick={() => setAvailabilityFilter(filter.value)}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 px-6" type="always">
            <ul className="space-y-3 pb-6">
              {filteredDrivers.length === 0 && (
                <li className="text-sm text-muted-foreground py-12 text-center">
                  Aucun chauffeur ne correspond à ces critères.
                </li>
              )}
              {filteredDrivers.map((driver) => renderDriverCard(driver))}
            </ul>
          </ScrollArea>

          <div className="px-6 pb-2" aria-live="polite" aria-atomic="true">
            {formError && (
              <p className="text-sm text-destructive" id="assign-driver-error">
                {formError}
              </p>
            )}
          </div>

          <DialogFooter className="px-6 pb-6 pt-2 gap-2 sm:gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={!canConfirm}>
              Confirmer l'affectation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignDriverModal;
