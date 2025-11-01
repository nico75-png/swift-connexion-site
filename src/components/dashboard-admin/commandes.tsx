import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DateRange } from "react-day-picker";
import { CalendarRange, ChevronDown, Download, Filter, MapPinned, Search, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import type { UseOrdersResult } from "@/hooks/useOrders";

interface CommandesProps {
  onCreateOrder?: () => void;
  ordersState: UseOrdersResult;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-[#F97316]/10 text-[#B45309]",
  scheduled: "bg-[#2563EB]/10 text-[#2563EB]",
  in_transit: "bg-[#2563EB]/10 text-[#2563EB]",
  delivered: "bg-[#10B981]/10 text-[#047857]",
  cancelled: "bg-[#EF4444]/10 text-[#B91C1C]",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  scheduled: "Planifiée",
  in_transit: "En cours",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const FILTER_OPTIONS = [
  { id: "all" as const, label: "Toutes" },
  { id: "active" as const, label: "En cours" },
  { id: "delivered" as const, label: "Livrées" },
  { id: "cancelled" as const, label: "Annulées" },
];

const MotionTableRow = motion(TableRow);

const Commandes = ({ onCreateOrder, ordersState }: CommandesProps) => {
  const {
    orders,
    unassignedOrders,
    summary,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    advancedFilters,
    setAdvancedFilters,
    availablePackageTypes,
    drivers,
    assignDriver,
    isAssigning,
    exportOrders,
    isExporting,
  } = ordersState;

  const [dispatchSelection, setDispatchSelection] = useState<Record<string, string>>({});
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const selectedRange = useMemo<DateRange | undefined>(() => {
    if (!dateRange.start && !dateRange.end) {
      return undefined;
    }
    return {
      from: dateRange.start ?? undefined,
      to: dateRange.end ?? undefined,
    };
  }, [dateRange.end, dateRange.start]);

  const periodLabel = useMemo(() => {
    if (!dateRange.start && !dateRange.end) {
      return "Période";
    }
    const formatter = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" });
    const from = dateRange.start ? formatter.format(dateRange.start) : "—";
    const to = dateRange.end ? formatter.format(dateRange.end) : "—";
    return `${from} → ${to}`;
  }, [dateRange.end, dateRange.start]);

  const handleDispatch = async (orderId: string) => {
    const driverId = dispatchSelection[orderId];
    if (!driverId) {
      toast({ title: "Sélection requise", description: "Choisissez un chauffeur disponible." });
      return;
    }

    const result = await assignDriver(orderId, driverId);
    if (!result.success) {
      toast({
        title: "Affectation impossible",
        description: result.message ?? "Une erreur est survenue lors de l'affectation.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Course affectée",
      description: `Le chauffeur a été notifié pour la commande ${orderId}.`,
    });

    setDispatchSelection((previous) => {
      const next = { ...previous };
      delete next[orderId];
      return next;
    });
  };

  const handleExport = async () => {
    const result = await exportOrders();
    if (!result.success) {
      toast({
        title: "Export impossible",
        description: result.message ?? "Aucun fichier généré.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Export terminé", description: "Le fichier CSV a été téléchargé." });
  };

  const togglePackageFilter = (value: string, checked: boolean) => {
    const current = new Set(advancedFilters.packageTypes);
    if (checked) {
      current.add(value);
    } else {
      current.delete(value);
    }
    setAdvancedFilters({ packageTypes: Array.from(current), driverId: advancedFilters.driverId });
  };

  const handleDriverFilterChange = (value: string) => {
    const driverValue = value === "__none__" ? undefined : value;
    setAdvancedFilters({ packageTypes: advancedFilters.packageTypes, driverId: driverValue });
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#0F172A] p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">Gestion des commandes</p>
          <h1 className="mt-2 font-['Inter'] text-3xl font-semibold">Pilotez vos livraisons en temps réel</h1>
          <p className="mt-2 text-sm text-white/70">
            Planifiez, suivez et ajustez les commandes clients en un coup d'œil.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="rounded-2xl border-white/40 bg-white/10 px-4 py-2 text-white shadow-sm transition hover:bg-white/20"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" /> {isExporting ? "Export…" : "Exporter"}
          </Button>
          <Button
            className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[#2563EB] shadow-lg transition hover:bg-slate-100"
            onClick={onCreateOrder}
          >
            + Créer une commande
          </Button>
        </div>
      </header>

      <Card className="rounded-3xl border-none bg-white/95 shadow-lg">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-200/70 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-xl">Suivi des commandes</CardTitle>
            <CardDescription>Filtrez par statut ou par période pour isoler vos priorités</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-11 w-56 rounded-2xl border border-slate-200 bg-slate-50 pl-10 text-sm text-slate-700 placeholder:text-slate-400"
                placeholder="Rechercher une commande"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            <Popover open={isPeriodOpen} onOpenChange={setIsPeriodOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="inline-flex items-center gap-2 rounded-2xl border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-[#2563EB]/40 hover:text-[#2563EB]"
                >
                  <CalendarRange className="h-4 w-4" />
                  {periodLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto rounded-2xl border border-slate-200 bg-white p-0 shadow-lg">
                <Calendar
                  mode="range"
                  numberOfMonths={2}
                  selected={selectedRange}
                  onSelect={(range) => {
                    setDateRange({ start: range?.from ?? null, end: range?.to ?? null });
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="inline-flex items-center gap-2 rounded-2xl border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-[#2563EB]/40 hover:text-[#2563EB]"
                >
                  <Filter className="h-4 w-4" />
                  Filtres avancés
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
                <div className="space-y-4 text-sm text-slate-600">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Types de commandes</p>
                    <div className="mt-3 space-y-2">
                      {availablePackageTypes.length === 0 ? (
                        <p className="text-xs text-slate-400">Aucun type détecté.</p>
                      ) : (
                        availablePackageTypes.map((type) => {
                          const checked = advancedFilters.packageTypes.includes(type);
                          return (
                            <label key={type} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-2">
                              <span className="text-sm font-medium text-slate-700">{type}</span>
                              <Checkbox checked={checked} onCheckedChange={(value) => togglePackageFilter(type, Boolean(value))} />
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Chauffeur</p>
                    <Select
                      value={advancedFilters.driverId ?? "__none__"}
                      onValueChange={handleDriverFilterChange}
                    >
                      <SelectTrigger className="rounded-2xl border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="__none__">Tous les chauffeurs</SelectItem>
                        <SelectItem value="__unassigned__">Sans chauffeur affecté</SelectItem>
                        {drivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            {FILTER_OPTIONS.map((filter) => (
              <Button
                key={filter.id}
                variant={statusFilter === filter.id ? "default" : "outline"}
                className={
                  statusFilter === filter.id
                    ? "rounded-2xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow"
                    : "rounded-2xl border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-[#2563EB]/40 hover:text-[#2563EB]"
                }
                onClick={() => setStatusFilter(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200/70">
            <Table>
              <TableHeader className="bg-slate-50/90 text-xs uppercase tracking-[0.15em] text-slate-500">
                <TableRow>
                  <TableHead className="px-6 py-4">Commande</TableHead>
                  <TableHead className="px-6 py-4">Client</TableHead>
                  <TableHead className="px-6 py-4">Chauffeur</TableHead>
                  <TableHead className="px-6 py-4">Statut</TableHead>
                  <TableHead className="px-6 py-4">Date</TableHead>
                  <TableHead className="px-6 py-4">ETA</TableHead>
                  <TableHead className="px-6 py-4 text-right">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {error && (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-6 text-sm text-rose-600">
                      {error}
                    </TableCell>
                  </TableRow>
                )}
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-6 text-center text-sm text-slate-500">
                      Chargement des commandes…
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-6 text-center text-sm text-slate-500">
                      Aucune commande ne correspond à vos filtres.
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence initial={false}>
                    {orders.map((order) => (
                      <MotionTableRow
                        key={order.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm text-slate-700"
                      >
                        <TableCell className="px-6 py-4 font-semibold text-slate-900">{order.id}</TableCell>
                        <TableCell className="px-6 py-4">{order.clientName}</TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-[#2563EB]/10 text-xs font-semibold text-[#2563EB]">
                                {(order.driverName ?? "ND")
                                  .split(" ")
                                  .filter(Boolean)
                                  .map((part) => part[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{order.driverName ?? "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge
                            className={`rounded-2xl px-3 py-1 text-xs font-semibold ${
                              STATUS_STYLES[order.status] ?? "bg-slate-200/80 text-slate-600"
                            }`}
                          >
                            {STATUS_LABELS[order.status] ?? order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4">{order.dateLabel}</TableCell>
                        <TableCell className="px-6 py-4">{order.etaLabel}</TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Badge className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {order.packageType ?? "—"}
                          </Badge>
                        </TableCell>
                      </MotionTableRow>
                    ))}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-3xl border-none bg-slate-50/90 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#10B981]/10 text-[#047857]">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Livraisons en route</p>
                  <p className="text-lg font-semibold text-slate-900">{summary.missions} missions</p>
                </div>
              </div>
            </Card>
            <Card className="rounded-3xl border-none bg-slate-50/90 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                  <MapPinned className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Dernière mise à jour</p>
                  <p className="text-lg font-semibold text-slate-900">{summary.lastUpdateLabel}</p>
                </div>
              </div>
            </Card>
            <Card className="rounded-3xl border-none bg-slate-50/90 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F97316]/10 text-[#B45309]">
                  <ChevronDown className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Commandes à prioriser</p>
                  <p className="text-lg font-semibold text-slate-900">{summary.urgent} urgences</p>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-none bg-white/95 shadow-lg">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-200/70 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl">Courses non affectées</CardTitle>
            <CardDescription>Attribuez rapidement les livraisons urgentes</CardDescription>
          </div>
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-[#2563EB]/40 hover:text-[#2563EB]"
            onClick={onCreateOrder}
          >
            + Nouvelle course
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
          {unassignedOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200/70 bg-slate-50/60 p-6 text-sm text-slate-500">
              Toutes les courses sont affectées.
            </div>
          ) : (
            unassignedOrders.map((order) => (
              <div key={order.id} className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{order.id}</p>
                    <p className="text-xs text-slate-500">
                      {(order.pickupAddress ?? "Pickup à définir")}
                      {" → "}
                      {(order.deliveryAddress ?? "Livraison à définir")}
                    </p>
                  </div>
                  <Badge className="rounded-2xl bg-[#2563EB]/10 px-3 py-1 text-xs font-semibold text-[#2563EB]">{order.packageType ?? "—"}</Badge>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {order.amount != null
                    ? order.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
                    : "Montant à confirmer"}
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Select
                    value={dispatchSelection[order.id] ?? ""}
                    onValueChange={(value) =>
                      setDispatchSelection((previous) => ({
                        ...previous,
                        [order.id]: value,
                      }))
                    }
                  >
                    <SelectTrigger className="rounded-2xl border-slate-200">
                      <SelectValue placeholder="Assigner un chauffeur" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.length === 0 ? (
                        <SelectItem value="" disabled>
                          Aucun chauffeur disponible
                        </SelectItem>
                      ) : (
                        drivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name}
                            {driver.vehicleType && ` · ${driver.vehicleType}`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    className="rounded-2xl bg-[#2563EB] text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                    onClick={() => handleDispatch(order.id)}
                    disabled={isAssigning}
                  >
                    {isAssigning ? "Assignation…" : "Dispatcher"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Commandes;
