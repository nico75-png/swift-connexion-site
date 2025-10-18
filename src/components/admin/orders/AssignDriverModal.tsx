import { useEffect, useMemo, useRef, useState } from "react";
import { Phone, Search, Truck, UserCheck, CalendarClock, Info, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useDriversStore } from "@/providers/AdminDataProvider";
import { type Driver } from "@/lib/stores/driversOrders.store";
import { driverStatusBadgeClass, driverStatusLabel } from "./driverUtils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  type AssignmentRequirements,
  evaluateDriverCompatibility,
} from "@/lib/utils/driver-compatibility";

interface AssignDriverModalProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned?: (driverId: string) => void;
  currentDriverId?: string | null;
  allowAssignment?: boolean;
  requirements?: AssignmentRequirements;
}

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
  requirements = {},
}: AssignDriverModalProps) => {
  const { drivers } = useDriversStore();
  const [search, setSearch] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("all");
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const selectedDriver = useMemo(
    () => drivers.find((driver) => driver.id === selectedDriverId) || null,
    [drivers, selectedDriverId],
  );

  const selectedDriverCompatibility = useMemo(() => {
    if (!selectedDriver) {
      return null;
    }
    return evaluateDriverCompatibility(selectedDriver, requirements);
  }, [selectedDriver, requirements]);

  useEffect(() => {
    if (open) {
      setSearch("");
      setVehicleTypeFilter("all");
      setShowAvailableOnly(true);
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

  useEffect(() => {
    if (selectedDriverCompatibility?.assignable) {
      setFormError(null);
    }
  }, [selectedDriverCompatibility]);

  const vehicleTypeOptions = useMemo(() => {
    const values = new Set<string>();
    drivers.forEach((driver) => {
      if (driver.vehicle?.type) {
        values.add(driver.vehicle.type);
      }
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [drivers]);

  const filteredDrivers = useMemo(() => {
    const query = search.toLowerCase();
    return drivers
      .filter((driver) => {
        const matchesSearch =
          driver.name.toLowerCase().includes(query) ||
          driver.phone.replace(/\s/g, "").includes(query.replace(/\s/g, ""));
        const matchesVehicle =
          vehicleTypeFilter === "all" || driver.vehicle?.type === vehicleTypeFilter;
        const matchesAvailability = !showAvailableOnly || driver.status === "AVAILABLE";
        return (
          matchesSearch &&
          matchesVehicle &&
          matchesAvailability &&
          driver.lifecycleStatus !== "INACTIF"
        );
      })
      .sort((a, b) => {
        const aCompatibility = evaluateDriverCompatibility(a, requirements);
        const bCompatibility = evaluateDriverCompatibility(b, requirements);
        if (aCompatibility.assignable !== bCompatibility.assignable) {
          return aCompatibility.assignable ? -1 : 1;
        }
        if (aCompatibility.isAvailable !== bCompatibility.isAvailable) {
          return aCompatibility.isAvailable ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
  }, [drivers, search, vehicleTypeFilter, showAvailableOnly, requirements]);

  const canConfirm = Boolean(selectedDriverCompatibility?.assignable && allowAssignment);

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

    if (!selectedDriverCompatibility?.assignable) {
      setFormError(
        selectedDriverCompatibility?.reasons[0] ?? "Ce chauffeur ne peut pas être affecté à la commande",
      );
      return;
    }

    onAssigned?.(selectedDriverId);
  };

  const renderDriverCard = (driver: typeof drivers[number]) => {
    const isSelected = selectedDriverId === driver.id;
    const nextUnavailability = getNextDriverUnavailability(driver.unavailabilities);
    const vehicleType = driver.vehicle?.type ?? "Véhicule";
    const vehicleCapacity = driver.vehicle?.capacity ?? "Capacité inconnue";
    const vehicleRegistration = driver.vehicle?.registration;
    const isInactive = driver.lifecycleStatus === "INACTIF";
    const compatibility = evaluateDriverCompatibility(driver, requirements);
    const disableSelection = !compatibility.assignable;
    const formattedCapacityKg =
      compatibility.capacityKg != null
        ? `${compatibility.capacityKg.toLocaleString("fr-FR")} kg`
        : "Non renseigné";
    const formattedCapacityVolume =
      compatibility.capacityVolumeM3 != null
        ? `${compatibility.capacityVolumeM3.toLocaleString("fr-FR")} m³`
        : null;
    const formattedWeightRequirement =
      requirements.weight && requirements.weight > 0
        ? `${Number(requirements.weight).toLocaleString("fr-FR")} kg`
        : null;
    const formattedVolumeRequirement =
      requirements.volume && requirements.volume > 0
        ? `${Number(requirements.volume).toLocaleString("fr-FR")} m³`
        : null;

    return (
      <li
        key={driver.id}
        className={cn(
          "border rounded-lg p-4 transition-all",
          "hover:border-primary/70 hover:shadow-sm",
          isSelected ? "border-primary ring-2 ring-primary/20" : "border-border",
          disableSelection && "opacity-90",
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
              <div>
                <p className="font-medium text-foreground">{vehicleType}</p>
                <p className="text-xs text-muted-foreground">
                  {vehicleCapacity}
                  {vehicleRegistration ? ` · ${vehicleRegistration}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Prochain créneau</p>
                <p className="font-medium text-foreground">{driver.nextFreeSlot}</p>
              </div>
            </div>
            <div className="md:col-span-2 flex flex-wrap items-center gap-3 text-xs">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Poids max · {formattedCapacityKg}
              </Badge>
              {formattedCapacityVolume && (
                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                  Volume max · {formattedCapacityVolume}
                </Badge>
              )}
              {formattedWeightRequirement && (
                <Badge variant="outline">Poids requis · {formattedWeightRequirement}</Badge>
              )}
              {formattedVolumeRequirement && (
                <Badge variant="outline">Volume requis · {formattedVolumeRequirement}</Badge>
              )}
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

          {compatibility.reasons.length > 0 && (
            <Alert variant="destructive" className="border-destructive/40 bg-destructive/10">
              <AlertDescription className="text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>
                  {compatibility.reasons.map((reason, index) => (
                    <span key={`${reason}-${index}`} className="block">
                      {reason}
                      {index < compatibility.reasons.length - 1 ? <br /> : null}
                    </span>
                  ))}
                </span>
              </AlertDescription>
            </Alert>
          )}

          {compatibility.warnings.length > 0 && compatibility.reasons.length === 0 && (
            <Alert className="border-amber-200 bg-amber-50 text-amber-900">
              <AlertDescription className="text-sm flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5" />
                <span>
                  {compatibility.warnings.map((warning, index) => (
                    <span key={`${warning}-${index}`} className="block">
                      {warning}
                      {index < compatibility.warnings.length - 1 ? <br /> : null}
                    </span>
                  ))}
                </span>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              variant={isSelected ? "default" : "outline"}
              onClick={() => setSelectedDriverId(driver.id)}
              disabled={disableSelection}
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
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="filter-vehicle">Type de véhicule</Label>
                  <Select
                    value={vehicleTypeFilter}
                    onValueChange={(value) => setVehicleTypeFilter(value)}
                  >
                    <SelectTrigger id="filter-vehicle">
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      {vehicleTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
                  <div className="pr-3">
                    <p className="text-sm font-medium text-foreground">Disponibles uniquement</p>
                    <p className="text-xs text-muted-foreground">
                      Masquer les chauffeurs en pause ou déjà en course.
                    </p>
                  </div>
                  <Switch checked={showAvailableOnly} onCheckedChange={setShowAvailableOnly} />
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
              Affecter ce chauffeur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignDriverModal;
