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

const STORAGE_KEY = "oc_drivers";

export type DriverStatus = "ACTIF" | "INACTIF";

type VehicleType = "vélo" | "scooter" | "moto" | "voiture" | "utilitaire" | "fourgon";

interface DriverRecord {
  id: string;
  name: string;
  phoneRaw: string;
  phone: string;
  email: string;
  vehicleType: VehicleType;
  capacityKg: number;
  plateRaw: string;
  plate: string;
  status: DriverStatus;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

const VEHICLE_OPTIONS: Array<{ value: VehicleType; label: string }> = [
  { value: "vélo", label: "Vélo" },
  { value: "scooter", label: "Scooter" },
  { value: "moto", label: "Moto" },
  { value: "voiture", label: "Voiture" },
  { value: "utilitaire", label: "Utilitaire" },
  { value: "fourgon", label: "Fourgon" },
];

const STATUS_LABELS: Record<DriverStatus, string> = {
  ACTIF: "Actif",
  INACTIF: "Inactif",
};

const STATUS_BADGE_CLASSES: Record<DriverStatus, string> = {
  ACTIF: "bg-emerald-100 text-emerald-700 border-emerald-200",
  INACTIF: "bg-slate-200 text-slate-700 border-slate-300",
};

export const getFromStorage = <T,>(key: string, fallback: T = [] as T) => {
  if (typeof window === "undefined") {
    return fallback;
  }
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) {
      return fallback;
    }
    return JSON.parse(stored) as T;
  } catch (error) {
    console.error(`Failed to read storage key "${key}":`, error);
    return fallback;
  }
};

export const saveToStorage = (key: string, value: unknown) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write storage key "${key}":`, error);
  }
};

export const createId = (prefix: string) => `${prefix}-${Date.now()}`;

export const normalizePhoneFR06 = (input: string) => {
  const raw = input.trim();
  const normalized = raw.replace(/\D/g, "");
  return { raw, normalized };
};

export const formatPhoneFR10 = (normalized: string) => {
  if (normalized.length !== 10) {
    return normalized;
  }
  return normalized.replace(/(\d{2})(?=(\d{2})+(?!\d))/g, "$1 ").trim();
};

export const normalizePlate = (input: string) => input.toUpperCase().replace(/[\s-]/g, "");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
  fullname: string;
  phone: string;
  email: string;
  vehicleType: "" | VehicleType;
  capacityKg: string;
  plate: string;
  status: DriverStatus;
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
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DriverStatus>("all");
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
    if (typeof window === "undefined") {
      return;
    }
    const stored = getFromStorage<DriverRecord[]>(STORAGE_KEY, []);
    if (Array.isArray(stored) && stored.length > 0) {
      const sanitized = stored
        .filter((item): item is Partial<DriverRecord> & { fullname?: string } => Boolean(item) && typeof item === "object")
        .map((item) => {
          const normalizedPhone = typeof item.phone === "string" ? item.phone.replace(/\D/g, "") : "";
          const normalizedPlateValue = typeof item.plate === "string" ? item.plate : item.plateRaw ?? "";
          const plateRawValue =
            typeof item.plateRaw === "string"
              ? item.plateRaw
              : typeof normalizedPlateValue === "string"
                ? normalizedPlateValue
                : "";
          const vehicle = VEHICLE_OPTIONS.some((option) => option.value === item.vehicleType)
            ? (item.vehicleType as VehicleType)
            : "voiture";

          return {
            id: typeof item.id === "string" ? item.id : createId("DRV"),
            name:
              typeof item.name === "string"
                ? item.name
                : typeof item.fullname === "string"
                  ? item.fullname
                  : normalizedPhone
                    ? formatPhoneFR10(normalizedPhone)
                    : "Chauffeur",
            phoneRaw:
              typeof item.phoneRaw === "string"
                ? item.phoneRaw
                : normalizedPhone
                  ? formatPhoneFR10(normalizedPhone)
                  : "",
            phone: normalizedPhone,
            email: typeof item.email === "string" ? item.email : "",
            vehicleType: vehicle,
            capacityKg: Number(item.capacityKg) || 0,
            plateRaw: plateRawValue.toString().toUpperCase(),
            plate: normalizePlate(plateRawValue ?? ""),
            status: item.status === "INACTIF" ? "INACTIF" : "ACTIF",
            comment: typeof item.comment === "string" ? item.comment : "",
            createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
            updatedAt:
              typeof item.updatedAt === "string"
                ? item.updatedAt
                : typeof item.createdAt === "string"
                  ? item.createdAt
                  : new Date().toISOString(),
          } satisfies DriverRecord;
        });
      setDrivers(sanitized);
    }
    setIsStorageReady(true);
  }, []);

  useEffect(() => {
    if (!isStorageReady) {
      return;
    }
    saveToStorage(STORAGE_KEY, drivers);
  }, [drivers, isStorageReady]);

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
      case "phone": {
        const { normalized } = normalizePhoneFR06(trimmed);
        return /^06\d{8}$/.test(normalized)
          ? undefined
          : "Le numéro doit commencer par 06 et contenir 10 chiffres";
      }
      case "email":
        return emailPattern.test(trimmed) ? undefined : "Email invalide";
      case "vehicleType":
        return trimmed && VEHICLE_OPTIONS.some((option) => option.value === trimmed)
          ? undefined
          : "Veuillez choisir un type de véhicule";
      case "capacityKg":
        return Number(trimmed) > 0 ? undefined : "Capacité invalide";
      case "plate": {
        const normalizedPlateValue = normalizePlate(trimmed);
        return normalizedPlateValue.length >= 4 && /^[A-Z0-9]+$/.test(normalizedPlateValue)
          ? undefined
          : "Immatriculation invalide";
      }
      case "status":
        return STATUS_LABELS[value as DriverStatus] ? undefined : "Statut invalide";
      case "comment":
        return trimmed.length <= 500 ? undefined : "500 caractères maximum";
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
    const hasErrors = [...requiredFields, "comment"].some((field) =>
      Boolean(validateField(field, formData[field])),
    );
    return hasErrors;
  }, [formData, validateField]);

  const enhancedDrivers = useMemo(() => {
    return drivers
      .map((driver) => {
        const createdAtTime = Number(new Date(driver.createdAt).getTime()) || 0;
        const displayCapacity = `${new Intl.NumberFormat("fr-FR").format(driver.capacityKg)} kg`;
        const displayPlate = driver.plateRaw || driver.plate || "-";
        const displayPhone = formatPhoneFR10(driver.phone) || driver.phoneRaw;
        return {
          ...driver,
          createdAtTime,
          displayCapacity,
          displayPlate,
          displayPhone,
        };
      })
      .sort((a, b) => b.createdAtTime - a.createdAtTime || a.name.localeCompare(b.name));
  }, [drivers]);

  const filteredDrivers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return enhancedDrivers.filter((driver) => {
      const haystack = [
        driver.name,
        driver.email,
        driver.displayPhone,
        driver.phone,
        driver.plate,
        driver.displayPlate,
        driver.vehicleType,
        driver.comment,
      ]
        .filter(Boolean)
        .map((value) => value.toString().toLowerCase());

      const matchesSearch = term.length === 0 || haystack.some((value) => value.includes(term));
      const matchesStatus = statusFilter === "all" || driver.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enhancedDrivers, searchTerm, statusFilter]);

  const statusCounts = useMemo(
    () => ({
      ACTIF: enhancedDrivers.filter((driver) => driver.status === "ACTIF").length,
      INACTIF: enhancedDrivers.filter((driver) => driver.status === "INACTIF").length,
    }),
    [enhancedDrivers],
  );

  const phoneExists = useCallback(
    (normalized: string) => drivers.some((driver) => driver.phone === normalized),
    [drivers],
  );

  const plateExists = useCallback(
    (normalized: string) => drivers.some((driver) => driver.plate === normalized),
    [drivers],
  );

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
    [...requiredFields, "comment"].forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        nextErrors[field] = error;
      }
    });

    if (Object.values(nextErrors).some(Boolean)) {
      setFormErrors((prev) => ({ ...prev, ...nextErrors }));
      return;
    }

    const { raw: phoneRawInput, normalized: normalizedPhone } = normalizePhoneFR06(formData.phone);
    if (phoneExists(normalizedPhone)) {
      const message = "Un chauffeur avec ce téléphone existe déjà.";
      setFormErrors((prev) => ({ ...prev, phone: message }));
      setTouched((prev) => ({ ...prev, phone: true }));
      phoneFieldRef.current?.focus();
      return;
    }

    const plateNormalized = normalizePlate(formData.plate);
    if (plateExists(plateNormalized)) {
      const message = "Cette immatriculation est déjà utilisée.";
      setFormErrors((prev) => ({ ...prev, plate: message }));
      setTouched((prev) => ({ ...prev, plate: true }));
      plateFieldRef.current?.focus();
      return;
    }

    const timestamp = new Date().toISOString();
    const newDriver: DriverRecord = {
      id: createId("DRV"),
      name: formData.fullname.trim(),
      phoneRaw: phoneRawInput,
      phone: normalizedPhone,
      email: formData.email.trim(),
      vehicleType: formData.vehicleType as VehicleType,
      capacityKg: Number(formData.capacityKg),
      plateRaw: formData.plate.trim().toUpperCase(),
      plate: plateNormalized,
      status: formData.status,
      comment: formData.comment.trim().slice(0, 500),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setDrivers((prev) => [newDriver, ...prev]);

    toast({ title: "✅ Chauffeur créé" });
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
              <SelectItem value="INACTIF">Inactifs</SelectItem>
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
                    <TableCell className="font-semibold text-[#1F1F1F]">{driver.name}</TableCell>
                    <TableCell>
                      <a
                        href={`tel:${driver.phone}`}
                        className="flex items-center gap-2 text-[#0F3556] hover:underline"
                      >
                        <Phone className="h-3 w-3" aria-hidden />
                        {driver.displayPhone}
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
                        <span className="capitalize">{driver.vehicleType}</span>
                        <span className="text-sm text-muted-foreground">{driver.displayCapacity}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm uppercase text-[#1F1F1F]">
                      {driver.displayPlate}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${STATUS_BADGE_CLASSES[driver.status]} border`}
                      >
                        {STATUS_LABELS[driver.status]}
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
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-soft">
            <p className="text-xs font-semibold text-rose-700">Inactifs</p>
            <p className="text-2xl font-bold text-rose-700">{statusCounts.INACTIF}</p>
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
          className="flex max-h-screen w-full max-w-none flex-col overflow-y-auto rounded-none border-none bg-[#F5F7FA] p-0 shadow-2xl focus:outline-none sm:max-h-[95vh] sm:w-[90vw] sm:max-w-2xl sm:rounded-2xl"
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
                <Label htmlFor="driver-fullname">Nom complet</Label>
                <Input
                  id="driver-fullname"
                  ref={firstFieldRef}
                  value={formData.fullname}
                  onChange={(event) => handleInputChange("fullname", event.target.value)}
                  onBlur={() => handleBlur("fullname")}
                  aria-invalid={Boolean(formErrors.fullname)}
                  aria-describedby={formErrors.fullname ? "driver-fullname-error" : undefined}
                  autoComplete="name"
                  required
                />
                {formErrors.fullname && (
                  <p id="driver-fullname-error" className="text-sm text-destructive">
                    {formErrors.fullname}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="driver-phone">Téléphone mobile (06)</Label>
                <Input
                  id="driver-phone"
                  ref={phoneFieldRef}
                  type="tel"
                  inputMode="tel"
                  value={formData.phone}
                  onChange={(event) => handleInputChange("phone", event.target.value)}
                  onBlur={() => handleBlur("phone")}
                  aria-invalid={Boolean(formErrors.phone)}
                  aria-describedby={formErrors.phone ? "driver-phone-error" : undefined}
                  placeholder="Ex : 06 12 34 56 78"
                  autoComplete="tel"
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
                  autoComplete="email"
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
                    setFormErrors((prev) => ({
                      ...prev,
                      vehicleType: validateField("vehicleType", value),
                    }));
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
                    {VEHICLE_OPTIONS.map((option) => (
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
                  step="1"
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
                  placeholder="AA-123-AA"
                  autoComplete="off"
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
                onValueChange={(value: DriverStatus) => {
                  handleInputChange("status", value);
                  setTouched((prev) => ({ ...prev, status: true }));
                  setFormErrors((prev) => ({ ...prev, status: validateField("status", value) }));
                }}
                className="grid gap-3 sm:grid-cols-2"
              >
                {(["ACTIF", "INACTIF"] as DriverStatus[]).map((value) => (
                  <div
                    key={value}
                    className="flex items-center gap-2 rounded-lg border border-border bg-white p-3 shadow-sm"
                  >
                    <RadioGroupItem value={value} id={`status-${value}`} />
                    <Label htmlFor={`status-${value}`} className="cursor-pointer text-sm font-medium">
                      {STATUS_LABELS[value]}
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
                onChange={(event) => handleInputChange("comment", event.target.value.slice(0, 500))}
                onBlur={() => handleBlur("comment")}
                placeholder="Informations complémentaires"
                rows={3}
                maxLength={500}
                aria-invalid={Boolean(formErrors.comment)}
                aria-describedby={formErrors.comment ? "driver-comment-error" : undefined}
              />
              {formErrors.comment && (
                <p id="driver-comment-error" className="text-sm text-destructive">
                  {formErrors.comment}
                </p>
              )}
            </div>

            <DialogFooter className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button
                type="submit"
                variant="cta"
                disabled={isSubmitDisabled}
                className="bg-[#FFB800] text-[#1F1F1F] hover:bg-[#ffcb33] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Créer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminDrivers;
