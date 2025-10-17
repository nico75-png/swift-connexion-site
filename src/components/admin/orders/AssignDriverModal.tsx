import { useEffect, useMemo, useRef, useState } from "react";
import { Phone, Search, Truck, UserCheck, CalendarClock, Info, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useDriversStore, useOrdersStore } from "@/providers/AdminDataProvider";
import { isDriverAssignable, type Driver } from "@/lib/stores/driversOrders.store";
import { useToast } from "@/hooks/use-toast";
import { driverStatusBadgeClass, driverStatusLabel } from "./driverUtils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { assignDriver as assignDriverService } from "@/lib/services/orders.service";
import { formatError } from "@/lib/errors";
import { resolveOrderStatus } from "@/lib/orders/status";

interface AssignDriverModalProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludedDriverIds?: string[];
  isImmediateAssign?: boolean;
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
  excludedDriverIds: excludedDriverIdsProp,
  isImmediateAssign = false,
}: AssignDriverModalProps) => {
  const { toast } = useToast();
  const { orders, assignments, scheduledAssignments, refetchOrder } = useOrdersStore();
  const { drivers } = useDriversStore();
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<typeof availabilityFilters[number]["value"]>("AVAILABLE");
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const order = useMemo(() => orders.find((item) => item.id === orderId) ?? null, [orderId, orders]);
  const selectedDriver = useMemo(
    () => drivers.find((driver) => driver.id === selectedDriverId) ?? null,
    [drivers, selectedDriverId],
  );
  const excludedDriverIds = useMemo(() => excludedDriverIdsProp ?? [], [excludedDriverIdsProp]);

  const normalizedStatus = useMemo(() => (order ? resolveOrderStatus(order.status) : ""), [order]);

  const orderScheduleLabel = useMemo(() => {
    if (!order || !order.schedule) return "";
    const start = format(new Date(order.schedule.start), "dd MMM yyyy · HH'h'mm", { locale: fr });
    const end = format(new Date(order.schedule.end), "HH'h'mm", { locale: fr });
    return `${start} → ${end}`;
  }, [order]);

  const assignabilityMap = useMemo(() => {
    if (!order || !order.schedule) {
      return new Map<string, ReturnType<typeof isDriverAssignable>>();
    }
    const map = new Map<string, ReturnType<typeof isDriverAssignable>>();
    drivers.forEach((driver) => {
      map.set(
        driver.id,
        isDriverAssignable(driver, order.schedule.start, order.schedule.end, {
          currentOrderId: order.id,
        }),
      );
    });
    return map;
  }, [drivers, order, assignments, scheduledAssignments]);

  const validationError = useMemo(() => {
    if (!order || !selectedDriver) return null;
    if (excludedDriverIds.includes(selectedDriver.id)) {
      return "Ce chauffeur est indisponible pour cette commande";
    }
    const result = assignabilityMap.get(selectedDriver.id);
    if (!result) {
      return "Ce chauffeur est introuvable";
    }
    return result.assignable ? null : result.reason ?? null;
  }, [assignabilityMap, order, selectedDriver, excludedDriverIds]);

  useEffect(() => {
    if (open) {
      setSearch("");
      setAvailabilityFilter("AVAILABLE");
      setFormError(null);
      setIsSubmitting(false);
      setSelectedDriverId(isImmediateAssign ? null : order?.driverId ?? null);
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [open, order?.driverId, isImmediateAssign]);

  useEffect(() => {
    if (selectedDriver) {
      setFormError(null);
    }
  }, [selectedDriver]);

  useEffect(() => {
    if (selectedDriverId && excludedDriverIds.includes(selectedDriverId)) {
      setSelectedDriverId(null);
    }
  }, [selectedDriverId, excludedDriverIds]);

  const filteredDrivers = useMemo(() => {
    const query = search.toLowerCase();
    return drivers.filter((driver) => {
      const matchesSearch =
        driver.name.toLowerCase().includes(query) ||
        driver.phone.replace(/\s/g, "").includes(query.replace(/\s/g, ""));
      const matchesStatus = availabilityFilter === "all" || driver.status === availabilityFilter;
      const isExcluded = excludedDriverIds.includes(driver.id);
      return matchesSearch && matchesStatus && driver.lifecycleStatus !== "INACTIF" && !isExcluded;
    });
  }, [drivers, search, availabilityFilter, excludedDriverIds]);

  const isReassign = Boolean(order?.driverId && selectedDriverId && order.driverId !== selectedDriverId);
  const isStatusAssignable = normalizedStatus === "EN_ATTENTE_AFFECTATION";

  const statusTooltip = useMemo(() => {
    if (!order) return null;
    if (normalizedStatus === "LIVREE") {
      return "Commande livrée : affectation impossible.";
    }
    if (normalizedStatus === "ANNULEE") {
      return "Commande annulée : affectation interdite.";
    }
    if (!isStatusAssignable) {
      return "Cette commande n'est pas en attente d'affectation.";
    }
    return null;
  }, [order, normalizedStatus, isStatusAssignable]);

  const handleClose = () => {
    setFormError(null);
    setSelectedDriverId(null);
    onOpenChange(false);
  };

  const handleOpenStateChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setFormError(null);
      setSelectedDriverId(null);
      setIsSubmitting(false);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onAssign();
  };

  const onAssign = async () => {
    if (!order) {
      setFormError("Commande introuvable");
      return;
    }

    if (!selectedDriverId) {
      setFormError("Sélectionnez un chauffeur");
      return;
    }

    if (!isStatusAssignable) {
      setFormError(statusTooltip ?? "Cette commande ne peut pas être affectée.");
      return;
    }

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      await assignDriverService(order.id, selectedDriverId);
      await Promise.resolve(refetchOrder(order.id));
      toast({
        title: "✅ Chauffeur affecté",
        description: `${selectedDriver?.name ?? "Chauffeur"} assigné à la commande ${order.id}.`,
      });
      handleClose();
    } catch (error) {
      const message = formatError(error);
      setFormError(message);
      toast({
        title: "Affectation impossible",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDriverCard = (driver: typeof drivers[number]) => {
    const isSelected = selectedDriverId === driver.id;
    const nextUnavailability = getNextDriverUnavailability(driver.unavailabilities);
    const assignability = order ? assignabilityMap.get(driver.id) : undefined;
    const conflictMessage = assignability?.assignable ? null : assignability?.reason ?? null;

    const isInactive = driver.lifecycleStatus === "INACTIF";
    const isExcluded = excludedDriverIds.includes(driver.id);
    const isSelectable = !isExcluded && driver.status !== "PAUSED" && driver.active && !isInactive;

    return (
      <li
        key={driver.id}
        className={cn(
          "border rounded-lg p-4 transition-all",
          "hover:border-primary/70 hover:shadow-sm",
          isSelected ? "border-primary ring-2 ring-primary/20" : "border-border",
          isSelectable ? "cursor-pointer" : "opacity-60",
        )}
        role={isSelectable ? "button" : undefined}
        tabIndex={isSelectable ? 0 : -1}
        onClick={() => {
          if (isSelectable) {
            setSelectedDriverId(driver.id);
          }
        }}
        onKeyDown={(event) => {
          if (!isSelectable) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setSelectedDriverId(driver.id);
          }
        }}
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
              {isInactive && <p className="mt-1 text-sm text-amber-600">Ce chauffeur est inactif.</p>}
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

          {isExcluded && (
            <p className="text-sm text-amber-600" role="alert">
              Chauffeur exclu pour cette commande.
            </p>
          )}

          {nextUnavailability && (
            <Alert className="border-dashed border border-border bg-muted/40">
              <AlertDescription className="text-sm text-muted-foreground">
                Prochaine indisponibilité : {" "}
                {`${format(new Date(nextUnavailability.start), "dd MMM yyyy · HH'h'mm", { locale: fr })} → ${format(new Date(nextUnavailability.end), "HH'h'mm", { locale: fr })}`}
                {nextUnavailability.reason ? ` — ${nextUnavailability.reason}` : ""}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              variant={isSelected ? "default" : "outline"}
              onClick={(event) => {
                event.stopPropagation();
                if (isSelectable) {
                  setSelectedDriverId(driver.id);
                }
              }}
              disabled={!isSelectable}
            >
              {isSelected ? "Sélectionné" : "Sélectionner"}
            </Button>
          </div>
        </div>
      </li>
    );
  };

  const confirmButton = (
    <Button
      type="submit"
      disabled={
        !selectedDriverId ||
        Boolean(validationError) ||
        isSubmitting ||
        !isStatusAssignable
      }
    >
      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
      {isReassign ? "Confirmer le remplacement" : "Confirmer l'affectation"}
    </Button>
  );

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
            {statusTooltip ? (
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>{confirmButton}</TooltipTrigger>
                <TooltipContent>{statusTooltip}</TooltipContent>
              </Tooltip>
            ) : (
              confirmButton
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignDriverModal;
