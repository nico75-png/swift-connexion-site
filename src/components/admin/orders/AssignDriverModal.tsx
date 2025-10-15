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
import { useDriversStore, useOrdersStore } from "@/providers/AdminDataProvider";
import { hasTimeOverlap, type ScheduledAssignmentStatus, type Driver } from "@/lib/stores/driversOrders.store";
import { useToast } from "@/hooks/use-toast";
import { driverStatusBadgeClass, driverStatusLabel } from "./driverUtils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AssignDriverModalProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludeDriverIds?: string[];
}

const availabilityFilters = [
  { value: "all", label: "Tous" },
  { value: "AVAILABLE", label: "Disponible" },
  { value: "ON_TRIP", label: "En course" },
  { value: "PAUSED", label: "En pause" },
] as const;

const blockingScheduledStatuses = new Set<ScheduledAssignmentStatus>(["PENDING", "PROCESSING"]);

const getNextDriverUnavailability = (items: Driver["unavailabilities"] = []) => {
  const now = Date.now();
  return (items ?? [])
    .slice()
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .find((item) => new Date(item.end).getTime() > now);
};

const AssignDriverModal = ({ orderId, open, onOpenChange, excludeDriverIds = [] }: AssignDriverModalProps) => {
  const { toast } = useToast();
  const { orders, assignments, scheduledAssignments, assignDriver, reassignDriver } = useOrdersStore();
  const { drivers } = useDriversStore();
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<typeof availabilityFilters[number]["value"]>("AVAILABLE");
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const order = useMemo(() => orders.find((item) => item.id === orderId), [orderId, orders]);
  const selectedDriver = useMemo(() => drivers.find((driver) => driver.id === selectedDriverId) || null, [drivers, selectedDriverId]);
  const orderScheduleLabel = useMemo(() => {
    if (!order) return "";
    const start = format(new Date(order.schedule.start), "dd MMM yyyy · HH'h'mm", { locale: fr });
    const end = format(new Date(order.schedule.end), "HH'h'mm", { locale: fr });
    return `${start} → ${end}`;
  }, [order]);

  const conflictingAssignment = useMemo(() => {
    if (!order || !selectedDriver) return undefined;
    return assignments.find((assignment) =>
      assignment.driverId === selectedDriver.id &&
      assignment.orderId !== order.id &&
      assignment.status !== "CANCELLED" &&
      hasTimeOverlap(order.schedule.start, order.schedule.end, assignment.start, assignment.end),
    );
  }, [assignments, order, selectedDriver]);

  const conflictingScheduled = useMemo(() => {
    if (!order || !selectedDriver) return undefined;
    return scheduledAssignments.find((scheduled) =>
      scheduled.driverId === selectedDriver.id &&
      scheduled.orderId !== order.id &&
      blockingScheduledStatuses.has(scheduled.status) &&
      hasTimeOverlap(order.schedule.start, order.schedule.end, scheduled.start, scheduled.end),
    );
  }, [order, scheduledAssignments, selectedDriver]);

  const validationError = useMemo(() => {
    if (!selectedDriver) return null;
    if (selectedDriver.lifecycleStatus === "INACTIF") {
      return "Ce chauffeur est inactif";
    }
    if (!selectedDriver.active) {
      return "Ce chauffeur est indisponible sur ce créneau";
    }
    if (selectedDriver.status === "PAUSED") {
      return "Chauffeur en pause — sélection impossible";
    }
    if (conflictingAssignment) {
      return `Conflit horaire détecté avec la commande #${conflictingAssignment.orderId}`;
    }
    if (conflictingScheduled) {
      return `Conflit horaire détecté avec une planification pour la commande #${conflictingScheduled.orderId}`;
    }
    return null;
  }, [conflictingAssignment, conflictingScheduled, selectedDriver]);

  useEffect(() => {
    if (open) {
      const excluded = new Set(excludeDriverIds);
      const defaultDriverId = order?.driverId ?? null;
      setSearch("");
      setAvailabilityFilter("AVAILABLE");
      setFormError(null);
      setSelectedDriverId(defaultDriverId && excluded.has(defaultDriverId) ? null : defaultDriverId);
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [excludeDriverIds, open, order?.driverId]);

  useEffect(() => {
    if (selectedDriverId && excludeDriverIds.includes(selectedDriverId)) {
      setSelectedDriverId(null);
    }
  }, [excludeDriverIds, selectedDriverId]);

  useEffect(() => {
    if (selectedDriver) {
      setFormError(null);
    }
  }, [selectedDriver]);

  const filteredDrivers = useMemo(() => {
    const query = search.toLowerCase();
    const excluded = new Set(excludeDriverIds);
    return drivers.filter((driver) => {
      const matchesSearch =
        driver.name.toLowerCase().includes(query) ||
        driver.phone.replace(/\s/g, "").includes(query.replace(/\s/g, ""));
      const matchesStatus = availabilityFilter === "all" || driver.status === availabilityFilter;
      const notExcluded = !excluded.has(driver.id);
      return matchesSearch && matchesStatus && driver.lifecycleStatus !== "INACTIF" && notExcluded;
    });
  }, [drivers, search, availabilityFilter, excludeDriverIds]);

  const canConfirm = Boolean(selectedDriver && !validationError);
  const isReassign = Boolean(order?.driverId && selectedDriverId && order.driverId !== selectedDriverId);

  const handleClose = () => {
    setFormError(null);
    setSelectedDriverId(null);
    onOpenChange(false);
  };

  const handleOpenStateChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setFormError(null);
      setSelectedDriverId(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!order) {
      setFormError("Commande introuvable");
      return;
    }
    if (!selectedDriverId) {
      setFormError("Sélectionnez un chauffeur");
      return;
    }
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const result = isReassign
      ? reassignDriver(order.id, selectedDriverId)
      : assignDriver(order.id, selectedDriverId);

    if (!result.success) {
      setFormError(result.error ?? "Une erreur est survenue");
      toast({
        title: "Affectation impossible",
        description: result.error ?? "Veuillez réessayer.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "✅ Chauffeur affecté",
      description: `${selectedDriver?.name ?? "Chauffeur"} assigné à la commande ${order.id}.`,
    });
    handleClose();
  };

  const renderDriverCard = (driver: typeof drivers[number]) => {
    const isSelected = selectedDriverId === driver.id;
    const nextUnavailability = getNextDriverUnavailability(driver.unavailabilities);
    const overlappingAssignment = order
      ? assignments.find(
          (assignment) =>
            assignment.driverId === driver.id &&
            assignment.orderId !== order.id &&
            assignment.status !== "CANCELLED" &&
            hasTimeOverlap(order.schedule.start, order.schedule.end, assignment.start, assignment.end),
        )
      : undefined;
    const overlappingScheduled = order
      ? scheduledAssignments.find(
          (scheduled) =>
            scheduled.driverId === driver.id &&
            scheduled.orderId !== order.id &&
            blockingScheduledStatuses.has(scheduled.status) &&
            hasTimeOverlap(order.schedule.start, order.schedule.end, scheduled.start, scheduled.end),
        )
      : undefined;

    const conflictMessage = overlappingAssignment
      ? `Conflit horaire détecté avec la commande #${overlappingAssignment.orderId}`
      : overlappingScheduled
        ? `Conflit horaire détecté avec une planification pour la commande #${overlappingScheduled.orderId}`
        : null;

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

          {isSelected && conflictMessage && (
            <p className="text-sm text-destructive" role="alert">
              {conflictMessage}
            </p>
          )}

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
        aria-describedby={formError || validationError ? "assign-driver-error" : undefined}
        className="max-w-3xl w-[95vw] p-0 sm:p-0 overflow-hidden sm:rounded-2xl"
      >
        <form id="form-assign-driver" className="flex h-full max-h-[90vh] flex-col" onSubmit={handleSubmit}>
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle id="assignDriverTitle">Affecter un chauffeur</DialogTitle>
            {order && (
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{order.client} · {order.type}</p>
                <p>{orderScheduleLabel}</p>
              </div>
            )}
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
            {(formError || validationError) && (
              <p className="text-sm text-destructive" id="assign-driver-error">
                {formError || validationError}
              </p>
            )}
          </div>

          <DialogFooter className="px-6 pb-6 pt-2 gap-2 sm:gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={!canConfirm}>
              {isReassign ? "Confirmer le remplacement" : "Confirmer l'affectation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignDriverModal;
