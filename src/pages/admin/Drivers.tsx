import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, Plus, Phone, Car, Mail, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
import {
  Driver,
  DriverLifecycleStatus,
  DriverUnavailability,
  DRIVER_UNAVAILABILITY_TYPES,
  getDrivers,
  mergeUnavailabilitiesByType,
  saveDrivers,
} from "@/lib/stores/driversOrders.store";
import { cancelScheduledAssignmentsForInterval } from "@/lib/services/assign.service";
import { useDriversStore } from "@/providers/AdminDataProvider";

export type DriverStatus = DriverLifecycleStatus;

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
  lifecycleStatus: DriverStatus;
  comment: string;
  createdAt: string;
  updatedAt: string;
  deactivated?: boolean;
  deactivatedAt?: string;
  unavailabilities: DriverUnavailability[];
}

interface DriverSettingsModalProps {
  open: boolean;
  driver: DriverRecord | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (updates: { lifecycleStatus: DriverStatus; unavailabilities: DriverUnavailability[] }) => void;
}

interface UnavailabilityFormState {
  id: string | null;
  type: "" | DriverUnavailability["type"];
  start: string;
  end: string;
  reason: string;
}

type UnavailabilityFormErrors = {
  type?: string;
  start?: string;
  end?: string;
  reason?: string;
  overlap?: string;
};

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

const UNAVAILABILITY_TYPE_LABELS: Record<DriverUnavailability["type"], string> = {
  VACANCES: "Vacances",
  RENDEZ_VOUS: "Rendez-vous",
  MALADIE: "Maladie",
  AUTRE: "Autre",
};

const UNAVAILABILITY_TYPE_OPTIONS = DRIVER_UNAVAILABILITY_TYPES.map((value) => ({
  value,
  label: UNAVAILABILITY_TYPE_LABELS[value],
}));

const VEHICLE_LABEL_BY_VALUE = new Map(VEHICLE_OPTIONS.map((option) => [option.value, option.label]));
const VEHICLE_VALUE_BY_LABEL = new Map(
  VEHICLE_OPTIONS.map((option) => [option.label.toLowerCase(), option.value]),
);
const DEFAULT_VEHICLE_VALUE: VehicleType = "voiture";

const cloneUnavailabilities = (list: DriverUnavailability[] = []) =>
  mergeUnavailabilitiesByType(list.map((item) => ({ ...item })));

const areUnavailabilitiesEqual = (
  a: DriverUnavailability[] = [],
  b: DriverUnavailability[] = [],
) => {
  const left = cloneUnavailabilities(a);
  const right = cloneUnavailabilities(b);
  if (left.length !== right.length) {
    return false;
  }
  return left.every((item, index) => {
    const other = right[index];
    return (
      item.id === other.id &&
      item.type === other.type &&
      item.start === other.start &&
      item.end === other.end &&
      (item.reason ?? "") === (other.reason ?? "")
    );
  });
};

const validateUnavailabilityFormState = (
  state: UnavailabilityFormState,
  list: DriverUnavailability[],
): { errors: UnavailabilityFormErrors; startIso: string | null; endIso: string | null } => {
  const errors: UnavailabilityFormErrors = {};

  if (!state.type) {
    errors.type = "Sélectionnez un type";
  }

  if (!state.start) {
    errors.start = "Renseignez la date de début";
  }
  if (!state.end) {
    errors.end = "Renseignez la date de fin";
  }

  const startIso = toIsoFromLocalValue(state.start);
  const endIso = toIsoFromLocalValue(state.end);

  if (state.start && !startIso) {
    errors.start = "Format de date invalide";
  }
  if (state.end && !endIso) {
    errors.end = "Format de date invalide";
  }

  if (startIso && endIso) {
    if (new Date(startIso).getTime() >= new Date(endIso).getTime()) {
      errors.end = "La fin doit être postérieure au début";
    }
  }

  const reason = state.reason.trim();
  if (reason.length > 200) {
    errors.reason = "200 caractères maximum";
  }

  return { errors, startIso: startIso ?? null, endIso: endIso ?? null };
};

const computeChangedUnavailabilities = (
  previous: DriverUnavailability[],
  next: DriverUnavailability[],
) => {
  const previousMap = new Map(previous.map((item) => [item.id, item]));
  return next.filter((item) => {
    const existing = previousMap.get(item.id);
    if (!existing) {
      return true;
    }
    return existing.start !== item.start || existing.end !== item.end;
  });
};

const mapDriverToRecord = (driver: Driver): DriverRecord => {
  const lifecycleStatus = driver.lifecycleStatus === "INACTIF" ? "INACTIF" : "ACTIF";
  const vehicleLabel = driver.vehicle?.type ?? VEHICLE_LABEL_BY_VALUE.get(DEFAULT_VEHICLE_VALUE) ?? "Voiture";
  const vehicleValue =
    VEHICLE_VALUE_BY_LABEL.get(vehicleLabel.toLowerCase()) ?? (DEFAULT_VEHICLE_VALUE as VehicleType);
  const phoneNormalized = driver.phoneNormalized ?? normalizePhoneFR06(driver.phone).normalized;
  const plateRaw = driver.vehicle?.registration ?? driver.plate ?? "";
  const plateNormalized = driver.plateNormalized ?? normalizePlate(plateRaw);

  return {
    id: driver.id,
    name: driver.fullname ?? driver.name ?? "Chauffeur",
    phoneRaw: driver.phone ?? formatPhoneFR10(phoneNormalized) ?? phoneNormalized,
    phone: phoneNormalized,
    email: driver.email ?? "",
    vehicleType: vehicleValue,
    capacityKg: (driver.vehicle?.capacityKg ?? Number.parseInt(driver.vehicle?.capacity ?? "0", 10)) || 0,
    plateRaw: plateRaw,
    plate: plateNormalized,
    lifecycleStatus,
    comment: driver.comment ?? "",
    createdAt: driver.createdAt ?? new Date().toISOString(),
    updatedAt: driver.updatedAt ?? driver.createdAt ?? new Date().toISOString(),
    deactivated: driver.deactivated,
    deactivatedAt: driver.deactivatedAt,
    unavailabilities: cloneUnavailabilities(driver.unavailabilities ?? []),
  } satisfies DriverRecord;
};

const resolveVehicleLabel = (value: VehicleType) => VEHICLE_LABEL_BY_VALUE.get(value) ?? "Voiture";

const mapRecordToDriver = (record: DriverRecord, existing?: Driver): Driver => {
  const now = new Date().toISOString();
  const lifecycleStatus = record.lifecycleStatus === "INACTIF" ? "INACTIF" : "ACTIF";
  const status = existing?.status ?? "AVAILABLE";
  const workflowStatus = existing?.workflowStatus ?? (status === "ON_TRIP" ? "EN_COURSE" : status === "PAUSED" ? "EN_PAUSE" : "ACTIF");
  const phoneNormalized = record.phone || normalizePhoneFR06(record.phoneRaw).normalized;
  const phoneDisplay =
    record.phoneRaw || (phoneNormalized ? formatPhoneFR10(phoneNormalized) : phoneNormalized);
  const capacityLabel = new Intl.NumberFormat("fr-FR").format(Math.max(0, record.capacityKg));
  const registration = record.plateRaw || record.plate;
  const existingDeactivated = existing?.deactivated ?? false;
  const isInactive = lifecycleStatus === "INACTIF";
  const deactivated = existingDeactivated || isInactive || record.deactivated === true;
  const deactivatedAt = isInactive
    ? existing?.deactivatedAt ?? record.deactivatedAt ?? now
    : record.deactivatedAt ?? existing?.deactivatedAt;

  return {
    id: record.id,
    name: record.name,
    fullname: record.name,
    phone: phoneDisplay,
    phoneNormalized,
    email: record.email,
    vehicle: {
      type: resolveVehicleLabel(record.vehicleType),
      capacity: `${capacityLabel} kg`,
      capacityKg: record.capacityKg,
      registration,
    },
    plate: record.plate,
    plateNormalized: record.plate,
    status,
    workflowStatus,
    nextFreeSlot: existing?.nextFreeSlot ?? "À planifier",
    active: lifecycleStatus !== "INACTIF" && status !== "PAUSED",
    lifecycleStatus,
    deactivated,
    deactivatedAt,
    unavailabilities: cloneUnavailabilities(record.unavailabilities),
    comment: record.comment,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    zone: existing?.zone,
    coversAllZones: true,
  } satisfies Driver;
};

const getNextUnavailability = (list: DriverUnavailability[]) => {
  const nowTime = Date.now();
  return (
    cloneUnavailabilities(list).find((item) => new Date(item.end).getTime() > nowTime) ?? null
  );
};

const formatUnavailabilityLabel = (item: DriverUnavailability | null) => {
  if (!item) return "-";
  const start = format(new Date(item.start), "dd MMM yyyy · HH'h'mm", { locale: fr });
  const end = format(new Date(item.end), "HH'h'mm", { locale: fr });
  const reason = item.reason ? ` — ${item.reason}` : "";
  return `${start} → ${end}${reason}`;
};

const toLocalDateTimeValue = (iso: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const toIsoFromLocalValue = (value: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
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
  lifecycleStatus: DriverStatus;
  comment: string;
}

const initialFormState: FormState = {
  fullname: "",
  phone: "",
  email: "",
  vehicleType: "",
  capacityKg: "",
  plate: "",
  lifecycleStatus: "ACTIF",
  comment: "",
};

const AdminDrivers = () => {
  const { toast } = useToast();
  const { refreshAll } = useDriversStore();
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DriverStatus>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsDriverId, setSettingsDriverId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const addDriverButtonRef = useRef<HTMLButtonElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const phoneFieldRef = useRef<HTMLInputElement>(null);
  const plateFieldRef = useRef<HTMLInputElement>(null);
  const wasOpenRef = useRef(false);
  const driversMapRef = useRef<Record<string, Driver>>({});

  const persistDrivers = useCallback(
    (records: DriverRecord[]) => {
      const driverList = records.map((record) =>
        mapRecordToDriver(record, driversMapRef.current[record.id]),
      );
      saveDrivers(driverList);
      driversMapRef.current = Object.fromEntries(driverList.map((driver) => [driver.id, driver]));
      refreshAll();
    },
    [refreshAll],
  );

  const settingsDriver = useMemo(() => {
    if (!settingsDriverId) {
      return null;
    }
    return drivers.find((driver) => driver.id === settingsDriverId) ?? null;
  }, [drivers, settingsDriverId]);

  const handleSettingsSubmit = useCallback(
    (updates: { lifecycleStatus: DriverStatus; unavailabilities: DriverUnavailability[] }) => {
      if (!settingsDriverId) {
        return;
      }

      const now = new Date().toISOString();
      let previousDriver: DriverRecord | null = null;
      let updatedRecord: DriverRecord | null = null;

      setDrivers((prev) => {
        const target = prev.find((driver) => driver.id === settingsDriverId);
        if (!target) {
          return prev;
        }

        previousDriver = target;
        const nextRecord: DriverRecord = {
          ...target,
          lifecycleStatus: updates.lifecycleStatus,
          deactivated: target.deactivated || updates.lifecycleStatus === "INACTIF",
          deactivatedAt:
            updates.lifecycleStatus === "INACTIF"
              ? target.deactivatedAt ?? now
              : target.deactivatedAt,
          unavailabilities: cloneUnavailabilities(updates.unavailabilities),
          updatedAt: now,
        };

        updatedRecord = nextRecord;
        const nextList = prev.map((driver) =>
          driver.id === nextRecord.id ? nextRecord : driver,
        );
        persistDrivers(nextList);
        return nextList;
      });

      if (!previousDriver || !updatedRecord) {
        setIsSettingsModalOpen(false);
        setSettingsDriverId(null);
        return;
      }

      setIsSettingsModalOpen(false);
      setSettingsDriverId(null);

      const changed = computeChangedUnavailabilities(
        previousDriver.unavailabilities,
        updatedRecord.unavailabilities,
      );

      let cancelledCount = 0;
      changed.forEach((item) => {
        const cancelled = cancelScheduledAssignmentsForInterval(updatedRecord!.id, {
          start: item.start,
          end: item.end,
        });
        cancelledCount += cancelled.length;
      });

      const updatesMessages: string[] = [];
      if (previousDriver.lifecycleStatus !== updates.lifecycleStatus) {
        updatesMessages.push(
          updates.lifecycleStatus === "INACTIF"
            ? "Statut mis à jour : INACTIF — ce chauffeur ne sera plus assigné automatiquement."
            : "Statut mis à jour : ACTIF.",
        );
      }
      if (cancelledCount > 0) {
        updatesMessages.push(`${cancelledCount} affectation(s) planifiée(s) annulée(s).`);
      }

      toast({
        title: "✅ Chauffeur mis à jour",
        description: updatesMessages.length
          ? updatesMessages.join(" ")
          : "Modifications enregistrées.",
      });
    },
    [settingsDriverId, persistDrivers, toast],
  );

  useEffect(() => {
    const storedDrivers = getDrivers();
    driversMapRef.current = Object.fromEntries(storedDrivers.map((driver) => [driver.id, driver]));
    setDrivers(storedDrivers.map(mapDriverToRecord));
  }, []);

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
      case "lifecycleStatus":
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
    "lifecycleStatus",
  ];

  const isSubmitDisabled = useMemo(() => {
    const hasEmptyRequired = requiredFields.some((field) => {
      const value = formData[field];
      return field === "lifecycleStatus" ? !value : value.trim() === "";
    });
    if (hasEmptyRequired) {
      return true;
    }
    const hasErrors = [...requiredFields, "comment" as keyof FormState].some((field) =>
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
        const displayPhone = driver.phoneRaw || formatPhoneFR10(driver.phone) || driver.phone;
        const nextUnavailability = getNextUnavailability(driver.unavailabilities);
        const vehicleLabel = VEHICLE_LABEL_BY_VALUE.get(driver.vehicleType) ?? driver.vehicleType;
        return {
          ...driver,
          createdAtTime,
          displayCapacity,
          displayPlate,
          displayPhone,
          vehicleLabel,
          nextUnavailability,
          nextUnavailabilityLabel: formatUnavailabilityLabel(nextUnavailability),
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
      const matchesStatus = statusFilter === "all" || driver.lifecycleStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enhancedDrivers, searchTerm, statusFilter]);

  const statusCounts = useMemo(
    () => ({
      ACTIF: enhancedDrivers.filter((driver) => driver.lifecycleStatus === "ACTIF").length,
      INACTIF: enhancedDrivers.filter((driver) => driver.lifecycleStatus === "INACTIF").length,
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
    [...requiredFields, "comment" as keyof FormState].forEach((field) => {
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
    const lifecycleStatus = formData.lifecycleStatus;
    const commentValue = formData.comment.trim().slice(0, 500);
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
      lifecycleStatus,
      comment: commentValue,
      createdAt: timestamp,
      updatedAt: timestamp,
      deactivated: lifecycleStatus === "INACTIF",
      deactivatedAt: lifecycleStatus === "INACTIF" ? timestamp : undefined,
      unavailabilities: [],
    };

    setDrivers((prev) => {
      const next = [newDriver, ...prev];
      persistDrivers(next);
      return next;
    });

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
                  <TableHead className="font-semibold text-[#1F1F1F]">
                    Prochaine indisponibilité
                  </TableHead>
                  <TableHead className="font-semibold text-[#1F1F1F] text-right">Actions</TableHead>
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
                        <span className="capitalize">{driver.vehicleLabel}</span>
                        <span className="text-sm text-muted-foreground">{driver.displayCapacity}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm uppercase text-[#1F1F1F]">
                      {driver.displayPlate}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${STATUS_BADGE_CLASSES[driver.lifecycleStatus]} border`}
                      >
                        {STATUS_LABELS[driver.lifecycleStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {driver.nextUnavailabilityLabel}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        data-action="settings"
                        aria-haspopup="dialog"
                        aria-controls="modal-driver-settings"
                        aria-label={`Ouvrir les paramètres du chauffeur ${driver.name}`}
                        title="Paramètres chauffeur"
                        onClick={() => {
                          setSettingsDriverId(driver.id);
                          setIsSettingsModalOpen(true);
                        }}
                      >
                        <span aria-hidden className="mr-2 flex items-center justify-center text-base">
                          <span role="img" aria-hidden>
                            👁️
                          </span>
                        </span>
                        <span className="sr-only md:not-sr-only">Paramètres</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredDrivers.length === 0 && (
            <div className="bg-white py-12 text-center">
              <p className="text-muted-foreground">
                {drivers.length === 0
                  ? "Aucun chauffeur actif pour le moment."
                  : "Aucun chauffeur ne correspond à vos filtres."}
              </p>
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
              aria-describedby={formErrors.lifecycleStatus ? "driver-status-error" : undefined}
            >
              <legend className="text-sm font-medium text-[#1F1F1F]">Statut</legend>
              <RadioGroup
                value={formData.lifecycleStatus}
                onValueChange={(value: DriverStatus) => {
                  handleInputChange("lifecycleStatus", value);
                  setTouched((prev) => ({ ...prev, lifecycleStatus: true }));
                  setFormErrors((prev) => ({ ...prev, lifecycleStatus: validateField("lifecycleStatus", value) }));
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
              {formErrors.lifecycleStatus && (
                <p id="driver-status-error" className="text-sm text-destructive">{formErrors.lifecycleStatus}</p>
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
      <DriverSettingsModal
        open={isSettingsModalOpen && Boolean(settingsDriver)}
        driver={settingsDriver}
        onOpenChange={(open) => {
          if (!open) {
            setIsSettingsModalOpen(false);
            setSettingsDriverId(null);
          } else {
            setIsSettingsModalOpen(true);
          }
        }}
        onSubmit={handleSettingsSubmit}
      />
    </DashboardLayout>
  );
};

const DriverSettingsModal = ({ open, driver, onOpenChange, onSubmit }: DriverSettingsModalProps) => {
  const [status, setStatus] = useState<DriverStatus>("ACTIF");
  const [items, setItems] = useState<DriverUnavailability[]>([]);
  const [form, setForm] = useState<UnavailabilityFormState>({
    id: null,
    type: "",
    start: "",
    end: "",
    reason: "",
  });
  const [formTouched, setFormTouched] = useState(false);
  const [formErrors, setFormErrors] = useState<UnavailabilityFormErrors>({});
  const statusTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open && driver) {
      const nextItems = cloneUnavailabilities(driver.unavailabilities);
      setStatus(driver.lifecycleStatus);
      setItems(nextItems);
      setForm({ id: null, type: "", start: "", end: "", reason: "" });
      setFormTouched(false);
      setFormErrors({});
      window.setTimeout(() => statusTriggerRef.current?.focus(), 50);
    }
    if (!open) {
      setForm({ id: null, type: "", start: "", end: "", reason: "" });
      setFormTouched(false);
      setFormErrors({});
    }
  }, [open, driver]);

  const validation = useMemo(
    () => validateUnavailabilityFormState(form, items),
    [form, items],
  );

  useEffect(() => {
    if (formTouched) {
      setFormErrors(validation.errors);
    }
  }, [formTouched, validation]);

  const isFormEmpty =
    !form.type && !form.start && !form.end && form.reason.trim().length === 0;
  const addDisabled = isFormEmpty || Object.keys(validation.errors).length > 0;

  const handleAddOrUpdate = () => {
    setFormTouched(true);
    setFormErrors(validation.errors);
    if (Object.keys(validation.errors).length > 0 || !validation.startIso || !validation.endIso) {
      return;
    }
    const reasonValue = form.reason.trim();
    const now = new Date().toISOString();
    if (form.id) {
      setItems((prev) =>
        cloneUnavailabilities(
          prev.map((item) =>
            item.id === form.id
              ? {
                  ...item,
                  type: form.type as DriverUnavailability["type"],
                  start: validation.startIso!,
                  end: validation.endIso!,
                  reason: reasonValue ? reasonValue : undefined,
                  updatedAt: now,
                }
              : item,
          ),
        ),
      );
    } else {
      const newItem: DriverUnavailability = {
        id: `UNAV-${Date.now()}`,
        type: form.type as DriverUnavailability["type"],
        start: validation.startIso!,
        end: validation.endIso!,
        reason: reasonValue ? reasonValue : undefined,
        createdAt: now,
        updatedAt: now,
      };
      setItems((prev) => cloneUnavailabilities([...prev, newItem]));
    }
    setForm({ id: null, type: "", start: "", end: "", reason: "" });
    setFormTouched(false);
    setFormErrors({});
  };

  const handleEditItem = (item: DriverUnavailability) => {
    setForm({
      id: item.id,
      type: item.type,
      start: toLocalDateTimeValue(item.start),
      end: toLocalDateTimeValue(item.end),
      reason: item.reason ?? "",
    });
    setFormTouched(false);
    setFormErrors({});
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => cloneUnavailabilities(prev.filter((item) => item.id !== id)));
    if (form.id === id) {
      setForm({ id: null, type: "", start: "", end: "", reason: "" });
      setFormTouched(false);
      setFormErrors({});
    }
  };

  const hasStatusChanged = driver ? status !== driver.lifecycleStatus : false;
  const hasUnavailabilityChanges = driver
    ? !areUnavailabilitiesEqual(items, driver.unavailabilities)
    : false;
  const hasChanges = hasStatusChanged || hasUnavailabilityChanges;
  const pendingInvalid = !isFormEmpty && Object.keys(validation.errors).length > 0;
  const canSave = Boolean(driver) && hasChanges && !pendingInvalid;

  const handleSave = () => {
    if (!driver) {
      onOpenChange(false);
      return;
    }
    if (!canSave) {
      setFormTouched(true);
      setFormErrors(validation.errors);
      return;
    }
    onSubmit({ lifecycleStatus: status, unavailabilities: items });
  };

  return (
    <Dialog open={open && Boolean(driver)} onOpenChange={onOpenChange}>
      <DialogContent
        id="modal-driver-settings"
        role="dialog"
        aria-modal="true"
        aria-labelledby="driver-settings-title"
        aria-describedby="driver-settings-description"
        className="flex max-h-screen w-full max-w-4xl flex-col overflow-hidden rounded-none border-none bg-[#F5F7FA] p-0 shadow-2xl focus:outline-none sm:rounded-2xl"
      >
        <DialogHeader className="bg-[#0F3556] px-6 py-5 text-white">
          <DialogTitle id="driver-settings-title" className="text-2xl font-semibold">
            Paramètres chauffeur
          </DialogTitle>
          <DialogDescription id="driver-settings-description" className="text-white/80">
            {driver
              ? `${driver.name} · ${driver.phoneRaw || formatPhoneFR10(driver.phone)}`
              : "Aucun chauffeur sélectionné."}
            <span className="mt-1 block text-sm text-white/70">
              Consultez et ajustez le statut ainsi que les indisponibilités (vacances, rendez-vous, maladie ou autre motif).
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 overflow-y-auto px-6 py-6">
          <section className="space-y-3">
            <Label htmlFor="driver-settings-status" className="text-base font-medium text-[#1F1F1F]">
              Statut
            </Label>
            <Select value={status} onValueChange={(value: DriverStatus) => setStatus(value)}>
              <SelectTrigger
                id="driver-settings-status"
                ref={statusTriggerRef}
                className="bg-white"
                aria-describedby="driver-settings-status-help"
              >
                <SelectValue placeholder="Sélectionnez un statut" />
              </SelectTrigger>
              <SelectContent>
                {(["ACTIF", "INACTIF"] as DriverStatus[]).map((value) => (
                  <SelectItem key={value} value={value}>
                    {STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p id="driver-settings-status-help" className="text-sm text-muted-foreground">
              INACTIF ⇒ ne sera plus jamais assigné automatiquement.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-[#1F1F1F]">Indisponibilités</h3>
              <span className="text-sm text-muted-foreground">
                {items.length} enregistrée{items.length > 1 ? "s" : ""}
              </span>
            </div>

            {items.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-white/70 p-4 text-sm text-muted-foreground">
                Aucune indisponibilité enregistrée.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Du</th>
                      <th className="px-4 py-3 font-semibold">Au</th>
                      <th className="px-4 py-3 font-semibold">Raison</th>
                      <th className="px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t border-border/60">
                        <td className="px-4 py-3 font-medium text-[#1F1F1F]">
                          {UNAVAILABILITY_TYPE_LABELS[item.type]}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {format(new Date(item.start), "dd MMM yyyy · HH'h'mm", { locale: fr })}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {format(new Date(item.end), "dd MMM yyyy · HH'h'mm", { locale: fr })}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.reason ? item.reason : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditItem(item)}
                              aria-label="Modifier cette indisponibilité"
                            >
                              <Pencil className="h-4 w-4" aria-hidden />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteItem(item.id)}
                              aria-label="Supprimer cette indisponibilité"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="space-y-3 rounded-lg border border-dashed border-border bg-white/80 p-4">
              <h4 className="text-sm font-semibold text-[#1F1F1F]">
                {form.id ? "Modifier l'indisponibilité" : "Ajouter une indisponibilité"}
              </h4>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="driver-settings-unav-type">Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(value: DriverUnavailability["type"]) => {
                      setForm((prev) => ({ ...prev, type: value }));
                    }}
                  >
                    <SelectTrigger
                      id="driver-settings-unav-type"
                      aria-invalid={Boolean(formErrors.type)}
                      aria-describedby={formErrors.type ? "driver-settings-unav-type-error" : undefined}
                      className="bg-white"
                    >
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNAVAILABILITY_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.type && (
                    <p id="driver-settings-unav-type-error" className="text-sm text-destructive">
                      {formErrors.type}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driver-settings-unav-start">Début</Label>
                  <Input
                    id="driver-settings-unav-start"
                    type="datetime-local"
                    value={form.start}
                    onChange={(event) => setForm((prev) => ({ ...prev, start: event.target.value }))}
                    aria-invalid={Boolean(formErrors.start)}
                    aria-describedby={formErrors.start ? "driver-settings-unav-start-error" : undefined}
                  />
                  {formErrors.start && (
                    <p id="driver-settings-unav-start-error" className="text-sm text-destructive">
                      {formErrors.start}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driver-settings-unav-end">Fin</Label>
                  <Input
                    id="driver-settings-unav-end"
                    type="datetime-local"
                    value={form.end}
                    onChange={(event) => setForm((prev) => ({ ...prev, end: event.target.value }))}
                    aria-invalid={Boolean(formErrors.end)}
                    aria-describedby={formErrors.end ? "driver-settings-unav-end-error" : undefined}
                  />
                  {formErrors.end && (
                    <p id="driver-settings-unav-end-error" className="text-sm text-destructive">
                      {formErrors.end}
                    </p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="driver-settings-unav-reason">Raison (200 caractères max)</Label>
                  <Textarea
                    id="driver-settings-unav-reason"
                    rows={2}
                    value={form.reason}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, reason: event.target.value.slice(0, 200) }))
                    }
                    aria-invalid={Boolean(formErrors.reason)}
                    aria-describedby={formErrors.reason ? "driver-settings-unav-reason-error" : undefined}
                  />
                  {formErrors.reason && (
                    <p id="driver-settings-unav-reason-error" className="text-sm text-destructive">
                      {formErrors.reason}
                    </p>
                  )}
                </div>
              </div>
              {formErrors.overlap && (
                <p className="text-sm text-destructive">{formErrors.overlap}</p>
              )}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                {form.id && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setForm({ id: null, type: "", start: "", end: "", reason: "" });
                      setFormTouched(false);
                      setFormErrors({});
                    }}
                  >
                    Annuler l'édition
                  </Button>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddOrUpdate}
                  disabled={addDisabled}
                  className="self-end"
                >
                  {form.id ? "Mettre à jour" : "Ajouter"}
                </Button>
              </div>
            </div>
          </section>
        </div>
        <DialogFooter className="flex flex-col gap-3 border-t border-border bg-white px-6 py-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            type="button"
            variant="cta"
            onClick={handleSave}
            disabled={!canSave}
            className="bg-[#FFB800] text-[#1F1F1F] hover:bg-[#ffcb33] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminDrivers;
