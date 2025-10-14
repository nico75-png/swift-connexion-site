import { useEffect, useMemo, useRef, useState } from "react";
import { Phone, Search, MapPin, Truck, UserCheck, CalendarClock } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useDriversStore, useOrdersStore } from "@/providers/AdminDataProvider";
import { hasTimeOverlap } from "@/lib/stores/driversOrders.store";
import { useToast } from "@/hooks/use-toast";
import { driverStatusBadgeClass, driverStatusLabel, zoneLabels } from "./driverUtils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AssignDriverModalProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const availabilityFilters = [
  { value: "all", label: "Tous" },
  { value: "AVAILABLE", label: "Disponible" },
  { value: "ON_TRIP", label: "En course" },
  { value: "PAUSED", label: "En pause" },
] as const;

const zoneFilters = [
  { value: "all", label: "Toutes les zones" },
  { value: "INTRA_PARIS", label: "Intra-Paris" },
  { value: "RING", label: "Petite/Grande Couronne" },
] as const;

const driverMatchesZone = (driverZone: string, filterValue: string) => {
  if (filterValue === "all") return true;
  if (filterValue === "RING") {
    return driverZone === "PETITE_COURONNE" || driverZone === "GRANDE_COURONNE";
  }
  return driverZone === filterValue;
};

const AssignDriverModal = ({ orderId, open, onOpenChange }: AssignDriverModalProps) => {
  const { toast } = useToast();
  const { orders, assignments, assignDriver, reassignDriver } = useOrdersStore();
  const { drivers } = useDriversStore();
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<typeof availabilityFilters[number]["value"]>("AVAILABLE");
  const [zoneFilter, setZoneFilter] = useState<typeof zoneFilters[number]["value"]>("all");
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
      hasTimeOverlap(order.schedule.start, order.schedule.end, assignment.start, assignment.end),
    );
  }, [assignments, order, selectedDriver]);

  const validationError = useMemo(() => {
    if (!selectedDriver) return null;
    if (!selectedDriver.active) {
      return "Ce chauffeur est indisponible sur ce créneau";
    }
    if (selectedDriver.status === "PAUSED") {
      return "Chauffeur en pause — sélection impossible";
    }
    if (order && selectedDriver.zone !== order.zoneRequirement) {
      return "Ce chauffeur n'intervient pas sur la zone demandée";
    }
    if (conflictingAssignment) {
      return `Conflit horaire détecté avec la commande #${conflictingAssignment.orderId}`;
    }
    return null;
  }, [conflictingAssignment, order, selectedDriver]);

  useEffect(() => {
    if (open) {
      setSearch("");
      setAvailabilityFilter("AVAILABLE");
      setZoneFilter("all");
      setFormError(null);
      setSelectedDriverId(order?.driverId ?? null);
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [open, order?.driverId]);

  useEffect(() => {
    if (selectedDriver) {
      setFormError(null);
    }
  }, [selectedDriver]);

  const filteredDrivers = useMemo(() => {
    const query = search.toLowerCase();
    return drivers.filter((driver) => {
      const matchesSearch =
        driver.name.toLowerCase().includes(query) ||
        driver.phone.replace(/\s/g, "").includes(query.replace(/\s/g, ""));
      const matchesStatus = availabilityFilter === "all" || driver.status === availabilityFilter;
      const matchesZone = driverMatchesZone(driver.zone, zoneFilter);
      return matchesSearch && matchesStatus && matchesZone;
    });
  }, [drivers, search, availabilityFilter, zoneFilter]);

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
    const hasConflict = conflictingAssignment && driver.id === selectedDriver?.id;

    return (
      <li key={driver.id} className={cn(
        "border rounded-lg p-4 transition-all", "hover:border-primary/70 hover:shadow-sm",
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-border",
      )}>
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
              <MapPin className="h-4 w-4 text-primary" />
              <span>{zoneLabels[driver.zone]}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Prochain créneau</p>
                <p className="font-medium text-foreground">{driver.nextFreeSlot}</p>
              </div>
            </div>
          </div>

          {hasConflict && (
            <p className="text-sm text-destructive" role="alert">
              {validationError}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              variant={isSelected ? "default" : "outline"}
              onClick={() => setSelectedDriverId(driver.id)}
              disabled={driver.status === "PAUSED" || !driver.active}
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
            <div className="grid gap-4 md:grid-cols-[1.5fr,repeat(2,minmax(0,1fr))]">
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
              <div className="space-y-2">
                <Label htmlFor="filter-zone">Zone</Label>
                <div id="filter-zone" className="flex gap-2 flex-wrap">
                  {zoneFilters.map((filter) => (
                    <Button
                      key={filter.value}
                      type="button"
                      size="sm"
                      variant={zoneFilter === filter.value ? "default" : "outline"}
                      onClick={() => setZoneFilter(filter.value)}
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
