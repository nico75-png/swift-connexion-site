import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, Plus, Phone, Car, Mail } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { useDriversStore } from "@/providers/AdminDataProvider";
import {
  type Driver,
  type DriverWorkflowStatus,
  normalizeDriverPhone,
  normalizeDriverPlate,
} from "@/lib/stores/driversOrders.store";

const vehicleOptions = [
  { value: "Vélo", label: "Vélo" },
  { value: "Scooter", label: "Scooter" },
  { value: "Moto", label: "Moto" },
  { value: "Voiture", label: "Voiture" },
  { value: "Utilitaire", label: "Utilitaire" },
  { value: "Fourgon", label: "Fourgon" },
];

const statusLabels: Record<DriverWorkflowStatus, string> = {
  ACTIF: "Actif",
  EN_PAUSE: "En pause",
  EN_COURSE: "En course",
};

const statusBadgeClasses: Record<DriverWorkflowStatus, string> = {
  ACTIF: "bg-emerald-100 text-emerald-700 border-emerald-200",
  EN_COURSE: "bg-amber-100 text-amber-700 border-amber-200",
  EN_PAUSE: "bg-slate-200 text-slate-700 border-slate-300",
};

const phonePattern = /^\+?\d[\d\s]{8,16}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const platePattern = /^[A-Z0-9\- ]{5,10}$/i;

const mapLegacyStatusToWorkflow = (driver: Driver): DriverWorkflowStatus => {
  if (driver.workflowStatus) {
    return driver.workflowStatus;
  }
  switch (driver.status) {
    case "ON_TRIP":
      return "EN_COURSE";
    case "PAUSED":
      return "EN_PAUSE";
    default:
      return "ACTIF";
  }
};

interface FormState {
  fullname: string;
  phone: string;
  email: string;
  vehicleType: string;
  capacityKg: string;
  plate: string;
  status: DriverWorkflowStatus;
  comment: string;
}

const initialFormState: FormState = {
  fullname: "",
  phone: "",
  email: "",
  vehicleType: "",
  capacityKg: "",
  plate: "",
  status: "ACTIF",
  comment: "",
};

const AdminDrivers = () => {
  const { ready, drivers, createDriver } = useDriversStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DriverWorkflowStatus>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const addDriverButtonRef = useRef<HTMLButtonElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const phoneFieldRef = useRef<HTMLInputElement>(null);
  const plateFieldRef = useRef<HTMLInputElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isModalOpen) {
      wasOpenRef.current = true;
      window.setTimeout(() => {
        firstFieldRef.current?.focus();
      }, 20);
    } else if (wasOpenRef.current) {
      addDriverButtonRef.current?.focus();
      wasOpenRef.current = false;
    }
  }, [isModalOpen]);

  const resetForm = () => {
    setFormData(initialFormState);
    setFormErrors({});
    setTouched({});
    setSubmitAttempted(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setIsModalOpen(open);
  };

  const validateField = useCallback((field: keyof FormState, value: string): string | undefined => {
    const trimmed = value.trim();
    switch (field) {
      case "fullname":
        return trimmed.length >= 2 ? undefined : "Veuillez saisir le nom complet";
      case "phone":
        return phonePattern.test(trimmed) ? undefined : "Numéro de téléphone invalide";
      case "email":
        return emailPattern.test(trimmed) ? undefined : "Email invalide";
      case "vehicleType":
        return trimmed ? undefined : "Veuillez choisir un type de véhicule";
      case "capacityKg":
        return Number(trimmed) > 0 ? undefined : "Capacité invalide";
      case "plate":
        return platePattern.test(trimmed) ? undefined : "Immatriculation invalide";
      case "status":
        return trimmed ? undefined : "Statut invalide";
      default:
        return undefined;
    }
  }, []);

  const requiredFields: Array<keyof FormState> = [
    "fullname",
    "phone",
    "email",
    "vehicleType",
    "capacityKg",
    "plate",
    "status",
  ];

  const isSubmitDisabled = useMemo(() => {
    const hasEmptyRequired = requiredFields.some((field) => {
      const value = formData[field];
      return field === "status" ? !value : value.trim() === "";
    });
    if (hasEmptyRequired) {
      return true;
    }
    return requiredFields.some((field) => Boolean(validateField(field, formData[field])));
  }, [formData, validateField]);

  const enhancedDrivers = useMemo(() => {
    if (!ready || !drivers) {
      return [];
    }
    return drivers
      .map((driver) => {
        const workflowStatus = mapLegacyStatusToWorkflow(driver);
        const createdAtTime = driver.createdAt ? Date.parse(driver.createdAt) : 0;
        const displayCapacity = driver.vehicle?.capacityKg
          ? `${driver.vehicle.capacityKg} kg`
          : driver.vehicle?.capacity ?? "-";
        const displayPlate = driver.vehicle?.registration ?? driver.plate ?? driver.plateNormalized ?? "-";
        const email = driver.email ?? "";
        const fullname = driver.fullname ?? driver.name;
        return {
          ...driver,
          fullname,
          email,
          workflowStatus,
          createdAtTime: Number.isFinite(createdAtTime) ? createdAtTime : 0,
          displayCapacity,
          displayPlate,
        };
      })
      .sort((a, b) => b.createdAtTime - a.createdAtTime || a.fullname.localeCompare(b.fullname));
  }, [drivers, ready]);

  const filteredDrivers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return enhancedDrivers.filter((driver) => {
      const matchesSearch =
        term.length === 0 ||
        [
          driver.fullname,
          driver.email,
          driver.phone,
          driver.displayPlate,
          driver.vehicle?.type,
          normalizeDriverPhone(driver.phone ?? ""),
          normalizeDriverPlate(driver.displayPlate ?? ""),
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(term));

      const matchesStatus = statusFilter === "all" || driver.workflowStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enhancedDrivers, searchTerm, statusFilter]);

  const statusCounts = useMemo(() => ({
    ACTIF: enhancedDrivers.filter((driver) => driver.workflowStatus === "ACTIF").length,
    EN_COURSE: enhancedDrivers.filter((driver) => driver.workflowStatus === "EN_COURSE").length,
    EN_PAUSE: enhancedDrivers.filter((driver) => driver.workflowStatus === "EN_PAUSE").length,
  }), [enhancedDrivers]);

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field] || submitAttempted) {
      setFormErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFormErrors((prev) => ({ ...prev, [field]: validateField(field, formData[field]) }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);

    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        nextErrors[field] = error;
      }
    });

    if (Object.values(nextErrors).some(Boolean)) {
      setFormErrors((prev) => ({ ...prev, ...nextErrors }));
      return;
    }

    const result = createDriver({
      fullname: formData.fullname.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      vehicleType: formData.vehicleType,
      capacityKg: Number(formData.capacityKg),
      plate: formData.plate.trim(),
      status: formData.status,
      comment: formData.comment.trim() ? formData.comment.trim() : undefined,
    });

    if (!result.success) {
      if (result.reason === "PHONE_EXISTS") {
        setFormErrors((prev) => ({ ...prev, phone: result.message }));
        setTouched((prev) => ({ ...prev, phone: true }));
        phoneFieldRef.current?.focus();
      } else if (result.reason === "PLATE_EXISTS") {
        setFormErrors((prev) => ({ ...prev, plate: result.message }));
        setTouched((prev) => ({ ...prev, plate: true }));
        plateFieldRef.current?.focus();
      }
      return;
    }

    toast({ title: "✅ Chauffeur ajouté" });
    resetForm();
    setIsModalOpen(false);
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />} topbar={<Topbar />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1F1F1F]">Gestion des chauffeurs</h1>
          <p className="mt-1 text-muted-foreground">Ajoutez et gérez vos chauffeurs en temps réel.</p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un chauffeur..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="bg-white pl-10 text-[#1F1F1F]"
              aria-label="Recherche de chauffeur"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
            <SelectTrigger className="w-full bg-white text-[#1F1F1F] md:w-48" aria-label="Filtrer par statut">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="ACTIF">Actifs</SelectItem>
              <SelectItem value="EN_COURSE">En course</SelectItem>
              <SelectItem value="EN_PAUSE">En pause</SelectItem>
            </SelectContent>
          </Select>
          <Button
            id="btn-add-driver"
            ref={addDriverButtonRef}
            variant="cta"
            onClick={() => setIsModalOpen(true)}
            className="bg-[#FFB800] text-[#1F1F1F] hover:bg-[#ffcb33]"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Ajouter un chauffeur
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-[#F5F7FA] shadow-soft">
          <div className="overflow-x-auto">
            <Table id="table-drivers" className="min-w-full">
              <TableHeader>
                <TableRow className="bg-white">
                  <TableHead className="font-semibold text-[#1F1F1F]">Nom</TableHead>
                  <TableHead className="font-semibold text-[#1F1F1F]">Téléphone</TableHead>
                  <TableHead className="font-semibold text-[#1F1F1F]">Email</TableHead>
                  <TableHead className="font-semibold text-[#1F1F1F]">Véhicule</TableHead>
                  <TableHead className="font-semibold text-[#1F1F1F]">Immatriculation</TableHead>
                  <TableHead className="font-semibold text-[#1F1F1F]">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => (
                  <TableRow key={driver.id} className="bg-white/60 hover:bg-white">
                    <TableCell className="font-semibold text-[#1F1F1F]">{driver.fullname}</TableCell>
                    <TableCell>
                      <a
                        href={`tel:${driver.phone}`}
                        className="flex items-center gap-2 text-[#0F3556] hover:underline"
                      >
                        <Phone className="h-3 w-3" aria-hidden />
                        {driver.phone}
                      </a>
                    </TableCell>
                    <TableCell>
                      {driver.email ? (
                        <a
                          href={`mailto:${driver.email}`}
                          className="flex items-center gap-2 text-[#0F3556] hover:underline"
                        >
                          <Mail className="h-3 w-3" aria-hidden />
                          {driver.email}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Non renseigné</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-[#1F1F1F]">
                        <Car className="h-4 w-4 text-muted-foreground" aria-hidden />
                        <span className="capitalize">{driver.vehicle?.type ?? "-"}</span>
                        <span className="text-sm text-muted-foreground">{driver.displayCapacity}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm uppercase text-[#1F1F1F]">
                      {driver.displayPlate}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${statusBadgeClasses[driver.workflowStatus]} border`}
                      >
                        {statusLabels[driver.workflowStatus]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredDrivers.length === 0 && (
            <div className="bg-white py-12 text-center">
              <p className="text-muted-foreground">Aucun chauffeur trouvé</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-white p-4 shadow-soft">
            <p className="text-xs text-muted-foreground">Total chauffeurs</p>
            <p className="text-2xl font-bold text-[#1F1F1F]">{enhancedDrivers.length}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-soft">
            <p className="text-xs font-semibold text-emerald-700">Actifs</p>
            <p className="text-2xl font-bold text-emerald-700">{statusCounts.ACTIF}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-soft">
              <p className="text-xs font-semibold text-amber-700">En course</p>
              <p className="text-2xl font-bold text-amber-700">{statusCounts.EN_COURSE}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-100 p-4 shadow-soft">
              <p className="text-xs font-semibold text-slate-700">En pause</p>
              <p className="text-2xl font-bold text-slate-700">{statusCounts.EN_PAUSE}</p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          id="modal-add-driver"
          aria-labelledby="add-driver-title"
          aria-describedby="add-driver-description"
          role="dialog"
          aria-modal="true"
          className="max-h-[95vh] w-[90vw] max-w-2xl overflow-y-auto rounded-2xl border-none bg-[#F5F7FA] p-0 shadow-2xl focus:outline-none"
        >
          <DialogHeader className="bg-[#0F3556] px-6 py-5 text-white">
            <DialogTitle id="add-driver-title" className="text-2xl font-semibold">
              Ajouter un chauffeur
            </DialogTitle>
            <DialogDescription id="add-driver-description" className="text-white/80">
              Renseignez les informations du chauffeur. Tous les champs sont obligatoires sauf le commentaire.
            </DialogDescription>
          </DialogHeader>

          <form id="form-add-driver" onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="driver-fullname">Nom & prénom</Label>
                <Input
                  id="driver-fullname"
                  ref={firstFieldRef}
                  value={formData.fullname}
                  onChange={(event) => handleInputChange("fullname", event.target.value)}
                  onBlur={() => handleBlur("fullname")}
                  aria-invalid={Boolean(formErrors.fullname)}
                  aria-describedby={formErrors.fullname ? "driver-fullname-error" : undefined}
                  required
                />
                {formErrors.fullname && (
                  <p id="driver-fullname-error" className="text-sm text-destructive">
                    {formErrors.fullname}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="driver-phone">Téléphone</Label>
                <Input
                  id="driver-phone"
                  ref={phoneFieldRef}
                  type="tel"
                  inputMode="tel"
                  pattern="\\+?\\d[\\d\\s]{8,16}"
                  value={formData.phone}
                  onChange={(event) => handleInputChange("phone", event.target.value)}
                  onBlur={() => handleBlur("phone")}
                  aria-invalid={Boolean(formErrors.phone)}
                  aria-describedby={formErrors.phone ? "driver-phone-error" : undefined}
                  placeholder="Ex : +33 6 12 34 56 78"
                  required
                />
                {formErrors.phone && (
                  <p id="driver-phone-error" className="text-sm text-destructive">
                    {formErrors.phone}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="driver-email">Email</Label>
                <Input
                  id="driver-email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => handleInputChange("email", event.target.value)}
                  onBlur={() => handleBlur("email")}
                  aria-invalid={Boolean(formErrors.email)}
                  aria-describedby={formErrors.email ? "driver-email-error" : undefined}
                  required
                />
                {formErrors.email && (
                  <p id="driver-email-error" className="text-sm text-destructive">
                    {formErrors.email}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="driver-vehicle">Type de véhicule</Label>
                <Select
                  value={formData.vehicleType}
                  onValueChange={(value) => {
                    handleInputChange("vehicleType", value);
                    setTouched((prev) => ({ ...prev, vehicleType: true }));
                    setFormErrors((prev) => ({ ...prev, vehicleType: validateField("vehicleType", value) }));
                  }}
                >
                  <SelectTrigger
                    id="driver-vehicle"
                    aria-invalid={Boolean(formErrors.vehicleType)}
                    aria-describedby={formErrors.vehicleType ? "driver-vehicle-error" : undefined}
                    className="bg-white"
                  >
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.vehicleType && (
                  <p id="driver-vehicle-error" className="text-sm text-destructive">
                    {formErrors.vehicleType}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="driver-capacity">Capacité max (kg)</Label>
                <Input
                  id="driver-capacity"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={formData.capacityKg}
                  onChange={(event) => handleInputChange("capacityKg", event.target.value)}
                  onBlur={() => handleBlur("capacityKg")}
                  aria-invalid={Boolean(formErrors.capacityKg)}
                  aria-describedby={formErrors.capacityKg ? "driver-capacity-error" : undefined}
                  required
                />
                {formErrors.capacityKg && (
                  <p id="driver-capacity-error" className="text-sm text-destructive">
                    {formErrors.capacityKg}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="driver-plate">Immatriculation</Label>
                <Input
                  id="driver-plate"
                  ref={plateFieldRef}
                  value={formData.plate}
                  onChange={(event) => handleInputChange("plate", event.target.value.toUpperCase())}
                  onBlur={() => handleBlur("plate")}
                  aria-invalid={Boolean(formErrors.plate)}
                  aria-describedby={formErrors.plate ? "driver-plate-error" : undefined}
                  pattern="[A-Z0-9\\- ]{5,10}"
                  placeholder="AA-123-AA"
                  required
                />
                {formErrors.plate && (
                  <p id="driver-plate-error" className="text-sm text-destructive">
                    {formErrors.plate}
                  </p>
                )}
              </div>
            </div>

            <fieldset
              className="space-y-3"
              aria-required="true"
              aria-describedby={formErrors.status ? "driver-status-error" : undefined}
            >
              <legend className="text-sm font-medium text-[#1F1F1F]">Statut</legend>
              <RadioGroup
                value={formData.status}
                onValueChange={(value: DriverWorkflowStatus) => {
                  handleInputChange("status", value);
                  setTouched((prev) => ({ ...prev, status: true }));
                  setFormErrors((prev) => ({ ...prev, status: validateField("status", value) }));
                }}
                className="grid gap-3 sm:grid-cols-3"
              >
                {(
                  ["ACTIF", "EN_COURSE", "EN_PAUSE"] as DriverWorkflowStatus[]
                ).map((value) => (
                  <div
                    key={value}
                    className="flex items-center gap-2 rounded-lg border border-border bg-white p-3 shadow-sm"
                  >
                    <RadioGroupItem value={value} id={`status-${value}`} />
                    <Label htmlFor={`status-${value}`} className="cursor-pointer text-sm font-medium">
                      {statusLabels[value]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {formErrors.status && (
                <p id="driver-status-error" className="text-sm text-destructive">{formErrors.status}</p>
              )}
            </fieldset>

            <div className="flex flex-col gap-2">
              <Label htmlFor="driver-comment">Commentaire (optionnel)</Label>
              <Textarea
                id="driver-comment"
                value={formData.comment}
                onChange={(event) => handleInputChange("comment", event.target.value)}
                placeholder="Informations complémentaires"
                rows={3}
              />
            </div>

            <DialogFooter className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button
                type="submit"
                variant="cta"
                disabled={isSubmitDisabled}
                className="bg-[#FFB800] text-[#1F1F1F] hover:bg-[#ffcb33] disabled:opacity-50"
              >
                Ajouter le chauffeur
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminDrivers;
