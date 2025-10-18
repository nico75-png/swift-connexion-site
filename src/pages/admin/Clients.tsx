import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  checkDuplicate,
  createClient,
  getClients,
  saveClients,
  type ClientRecord,
  type DuplicateReason,
  type DuplicateCheckResult,
  DuplicateClientError,
} from "@/lib/clientStorage";
import {
  assertUniqueOrderIdOrThrow,
  generateNextOrderNumber,
  reconcileGlobalOrderSeq,
} from "@/lib/orderSequence";
import { estimatePrice, formatCurrencyEUR } from "@/lib/reorder";
import {
  getOrders,
  saveOrders,
  type Order,
  type ZoneCode,
} from "@/lib/stores/driversOrders.store";
import { SECTOR_DISPLAY_MAP } from "@/lib/stores/data/adminOrderSeeds";

const SECTOR_OPTIONS = [
  "Médical",
  "Optique",
  "Événementiel",
  "Juridique",
  "Autre",
];
const STATUS_OPTIONS = ["Actif", "Inactif"];

const EMAIL_REGEX =
  /^(?:[a-zA-Z0-9_'^&/+-])+(?:\.(?:[a-zA-Z0-9_'^&/+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\+?\d[\d\s]{8,16}$/;
const SIRET_REGEX = /^\d{14}$/;
const MIN_ADDRESS_LENGTH = 6;

const ORDER_TYPE_OPTIONS = [
  "Document sécurisé",
  "Colis médical",
  "Colis standard",
  "Pièces urgentes",
] as const;

const DEFAULT_BASE_BY_ZONE: Record<ZoneCode, number> = {
  INTRA_PARIS: 25,
  PETITE_COURONNE: 35,
  GRANDE_COURONNE: 45,
};

const ZONE_LABELS: Record<ZoneCode, string> = {
  INTRA_PARIS: "Intra-Paris",
  PETITE_COURONNE: "Petite couronne",
  GRANDE_COURONNE: "Grande couronne",
};

const POSTAL_CODE_REGEX = /\b(\d{5})\b/;

const extractPostalCode = (value: string): number | null => {
  const match = value.match(POSTAL_CODE_REGEX);
  if (!match) {
    return null;
  }
  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const inferZoneFromAddresses = (pickup: string, dropoff: string): ZoneCode => {
  const codes = [extractPostalCode(pickup), extractPostalCode(dropoff)].filter(
    (code): code is number => code !== null,
  );

  if (codes.length === 0) {
    return "INTRA_PARIS";
  }

  const normalized = codes.map((code) => code.toString().padStart(5, "0"));

  if (normalized.every((code) => code.startsWith("75"))) {
    return "INTRA_PARIS";
  }

  const hasPetiteCouronne = normalized.some((code) => /^(92|93|94)/.test(code));
  const hasGrandeCouronne = normalized.some((code) =>
    /^(77|78|91|95)/.test(code),
  );

  if (hasGrandeCouronne) {
    return "GRANDE_COURONNE";
  }

  if (hasPetiteCouronne) {
    return "PETITE_COURONNE";
  }

  return "INTRA_PARIS";
};

const estimateDistanceKm = (pickup: string, dropoff: string): number => {
  const pickupCode = extractPostalCode(pickup);
  const dropoffCode = extractPostalCode(dropoff);

  if (pickupCode && dropoffCode) {
    if (pickupCode === dropoffCode) {
      return 5;
    }

    const pickupDept = Math.floor(pickupCode / 1000);
    const dropoffDept = Math.floor(dropoffCode / 1000);

    if (pickupDept === dropoffDept) {
      const diff = Math.abs(pickupCode - dropoffCode);
      const estimated = Math.max(6, Math.min(80, diff / 1.5));
      return Number.parseFloat(estimated.toFixed(1));
    }

    const deptGap = Math.max(1, Math.abs(pickupDept - dropoffDept));
    const estimated = Math.max(12, Math.min(220, deptGap * 18));
    return Number.parseFloat(estimated.toFixed(1));
  }

  const normalizedPickup = pickup.trim().toLowerCase();
  const normalizedDropoff = dropoff.trim().toLowerCase();

  if (!normalizedPickup || !normalizedDropoff) {
    return 0;
  }

  if (normalizedPickup === normalizedDropoff) {
    return 5;
  }

  const pickupCity = normalizedPickup.split(",")[0]?.trim();
  const dropoffCity = normalizedDropoff.split(",")[0]?.trim();

  if (pickupCity && dropoffCity && pickupCity === dropoffCity) {
    return 7.5;
  }

  const pickupWords = new Set(normalizedPickup.split(/\s+/).filter(Boolean));
  const dropoffWords = normalizedDropoff.split(/\s+/).filter(Boolean);
  const common = dropoffWords.reduce(
    (count, word) => (pickupWords.has(word) ? count + 1 : count),
    0,
  );

  if (common >= 2) {
    return 9.5;
  }

  return 18;
};

const getDefaultSchedule = () => {
  const base = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const date = base.toISOString().slice(0, 10);
  const time = base.toISOString().slice(11, 16);
  return { date, time };
};

type PriceEstimation = ReturnType<typeof estimatePrice> & {
  zone: ZoneCode;
  km: number;
  base: number;
};

type FormValues = {
  company: string;
  contact: string;
  email: string;
  phone: string;
  sector: string;
  address: string;
  siret: string;
};

type FormErrors = Record<keyof FormValues, string>;

const INITIAL_FORM_VALUES: FormValues = {
  company: "",
  contact: "",
  email: "",
  phone: "",
  sector: "",
  address: "",
  siret: "",
};

const INITIAL_TOUCHED: Record<keyof FormValues, boolean> = {
  company: false,
  contact: false,
  email: false,
  phone: false,
  sector: false,
  address: false,
  siret: false,
};

const DUPLICATE_MESSAGES: Record<DuplicateReason, string> = {
  siret: "Un client avec ce SIRET existe déjà.",
  email: "Un client avec cet email existe déjà.",
  companyAddress:
    "Un client avec la même entreprise et la même adresse existe déjà.",
  companyPhone:
    "Un client avec ce téléphone pour cette entreprise existe déjà.",
};

const DUPLICATE_FIELDS: Record<DuplicateReason, (keyof FormValues)[]> = {
  siret: ["siret"],
  email: ["email"],
  companyAddress: ["company", "address"],
  companyPhone: ["company", "phone"],
};

const validateForm = (values: FormValues): FormErrors => {
  const trimmedCompany = values.company.trim();
  const trimmedContact = values.contact.trim();
  const trimmedEmail = values.email.trim();
  const trimmedPhone = values.phone.trim();
  const trimmedAddress = values.address.trim();
  const trimmedSiret = values.siret.trim();

  const errors: FormErrors = {
    company: "",
    contact: "",
    email: "",
    phone: "",
    sector: "",
    address: "",
    siret: "",
  };

  if (trimmedCompany.length < 2) {
    errors.company = "Ce champ est obligatoire";
  }

  if (trimmedContact.length < 2) {
    errors.contact = "Ce champ est obligatoire";
  }

  if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = "Email invalide";
  }

  if (!trimmedPhone || !PHONE_REGEX.test(trimmedPhone)) {
    errors.phone = "Numéro invalide";
  }

  if (!values.sector || !SECTOR_OPTIONS.includes(values.sector)) {
    errors.sector = "Veuillez sélectionner un secteur";
  }

  if (trimmedAddress.length < 6) {
    errors.address = "Adresse obligatoire (rue + ville/CP)";
  }

  if (!trimmedSiret || !SIRET_REGEX.test(trimmedSiret)) {
    errors.siret = "SIRET invalide (14 chiffres requis)";
  }

  return errors;
};

const AdminClients = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [orderDialogClient, setOrderDialogClient] =
    useState<ClientRecord | null>(null);
  const [orderAlert, setOrderAlert] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const createButtonRef = useRef<HTMLButtonElement | null>(null);
  const wasModalOpenRef = useRef(false);

  useEffect(() => {
    setClients(getClients());
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      wasModalOpenRef.current = true;
      return;
    }

    if (wasModalOpenRef.current) {
      createButtonRef.current?.focus();
      wasModalOpenRef.current = false;
    }
  }, [isModalOpen]);

  const sectorOptions = useMemo(() => {
    const unique = new Set<string>(SECTOR_OPTIONS);
    clients.forEach((client) => {
      if (client.sector) {
        unique.add(client.sector);
      }
    });
    return Array.from(unique);
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contact.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector =
        sectorFilter === "all" || client.sector === sectorFilter;
      const matchesStatus =
        statusFilter === "all" || client.status === statusFilter;
      return matchesSearch && matchesSector && matchesStatus;
    });
  }, [clients, searchTerm, sectorFilter, statusFilter]);

  const totalOrders = useMemo(
    () => clients.reduce((acc, client) => acc + (client.orders ?? 0), 0),
    [clients],
  );
  const activeCount = useMemo(
    () => clients.filter((client) => client.status === "Actif").length,
    [clients],
  );
  const averageOrders =
    clients.length > 0 ? Math.round(totalOrders / clients.length) : 0;

  const handleClientCreated = (client: ClientRecord) => {
    setClients((previous) => [client, ...previous]);
    setIsModalOpen(false);
    toast({
      title: "✅ Client créé avec succès",
      description: `${client.company} a été ajouté à votre portefeuille.`,
    });
  };

  const handleOrderCreated = (updatedClient: ClientRecord) => {
    setClients((previous) => {
      const index = previous.findIndex(
        (entry) => entry.id === updatedClient.id,
      );
      if (index === -1) {
        return previous;
      }
      const next = [...previous];
      next[index] = updatedClient;
      return next;
    });
  };

  const handleOrderDialogOpenChange = (open: boolean) => {
    setIsOrderDialogOpen(open);
    if (!open) {
      setOrderDialogClient(null);
    }
  };

  const handleOrderAlertChange = (open: boolean) => {
    if (!open) {
      setOrderAlert(null);
    }
  };

  const openOrderCreationForClient = (clientId: string) => {
    const storedClients = getClients();
    setClients(storedClients);
    const record = storedClients.find((item) => item.id === clientId);

    if (!record) {
      toast({
        title: "Client introuvable",
        description: "Impossible de charger les informations du client.",
        variant: "destructive",
      });
      return;
    }

    const trimmedSiret = record.siret?.trim() ?? "";
    if (!SIRET_REGEX.test(trimmedSiret)) {
      setOrderAlert({
        title: "Informations client manquantes",
        description:
          "Le SIRET du client est invalide. Corrigez la fiche avant de créer une commande.",
      });
      return;
    }

    const trimmedAddress = record.address?.trim() ?? "";
    if (trimmedAddress.length < MIN_ADDRESS_LENGTH) {
      setOrderAlert({
        title: "Adresse insuffisante",
        description:
          "L'adresse du client est incomplète. Mettez-la à jour avant de créer une commande.",
      });
      return;
    }

    setOrderAlert(null);
    setOrderDialogClient(record);
    setIsOrderDialogOpen(true);
  };

  return (
    <>
      <DashboardLayout
        sidebar={<AdminSidebar />}
        topbar={<Topbar title="Gestion des clients" />}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par entreprise ou contact..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-10 focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556]"
            />
          </div>

          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-full md:w-48 focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556]">
              <Filter className="h-4 w-4 mr-2 text-[#0F3556]" />
              <SelectValue placeholder="Secteur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les secteurs</SelectItem>
              {sectorOptions.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48 focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                id="btn-create-client"
                ref={createButtonRef}
                variant="cta"
                className="bg-[#0F3556] hover:bg-[#0d2b46] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer un client
              </Button>
            </DialogTrigger>
            <CreateClientModal
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              onClientCreated={handleClientCreated}
            />
          </Dialog>
        </div>

        <div className="bg-card rounded-lg border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <Table id="table-clients">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Entreprise</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Secteur</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Téléphone</TableHead>
                  <TableHead className="font-semibold text-center">
                    Commandes
                  </TableHead>
                  <TableHead className="font-semibold">Statut</TableHead>
                  <TableHead className="font-semibold text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-muted/30">
                    <TableCell className="font-semibold">
                      {client.company}
                    </TableCell>
                    <TableCell>{client.contact}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{client.sector}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <a
                        href={`mailto:${client.email}`}
                        className="text-[#0F3556] hover:underline flex items-center gap-2"
                      >
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </a>
                    </TableCell>
                    <TableCell className="text-sm">
                      <a
                        href={`tel:${client.phone.replace(/\s+/g, "")}`}
                        className="text-[#0F3556] hover:underline flex items-center gap-2"
                      >
                        <Phone className="h-3 w-3" />
                        {client.phone}
                      </a>
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {client.orders ?? 0}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          client.status === "Actif"
                            ? "bg-[#0F3556]/10 text-[#0F3556] border-[#0F3556]/20"
                            : "bg-muted text-muted-foreground border-border"
                        }
                      >
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/clients/${client.id}`}>
                          <Button variant="ghost" size="sm">
                            Voir fiche
                          </Button>
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="btn-create-order"
                          data-client-id={client.id}
                          onClick={() => openOrderCreationForClient(client.id)}
                        >
                          Créer commande
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12" role="status">
              <p className="text-muted-foreground">Aucun client trouvé</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-[#F5F7FA] rounded-lg border border-[#0F3556]/10">
            <p className="text-xs text-muted-foreground mb-1">Total clients</p>
            <p className="text-2xl font-bold text-[#0F3556]">
              {clients.length}
            </p>
          </div>
          <div className="p-4 bg-[#0F3556]/10 rounded-lg border border-[#0F3556]/20">
            <p className="text-xs text-[#0F3556] mb-1">Actifs</p>
            <p className="text-2xl font-bold text-[#0F3556]">{activeCount}</p>
          </div>
          <div className="p-4 bg-[#FFB800]/10 rounded-lg border border-[#FFB800]/40">
            <p className="text-xs text-[#FFB800] mb-1">Total commandes</p>
            <p className="text-2xl font-bold text-[#FFB800]">{totalOrders}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-1">
              Moyenne / client
            </p>
            <p className="text-2xl font-bold text-muted-foreground">
              {averageOrders}
            </p>
          </div>
        </div>
      </DashboardLayout>

      <CreateOrderForClientDialog
        client={orderDialogClient}
        open={isOrderDialogOpen && Boolean(orderDialogClient)}
        onOpenChange={handleOrderDialogOpenChange}
        onOrderCreated={handleOrderCreated}
      />

      <AlertDialog
        open={Boolean(orderAlert)}
        onOpenChange={handleOrderAlertChange}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {orderAlert?.title ?? "Action impossible"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {orderAlert?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction autoFocus>Fermer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

interface CreateOrderForClientDialogProps {
  open: boolean;
  client: ClientRecord | null;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: (client: ClientRecord) => void;
}

type OrderFormValues = {
  type: string;
  pickup: string;
  delivery: string;
  date: string;
  time: string;
  weight: string;
  volume: string;
  express: boolean;
  fragile: boolean;
};

type OrderFormErrors = Partial<Record<keyof OrderFormValues, string>>;

const CreateOrderForClientDialog = ({
  open,
  client,
  onOpenChange,
  onOrderCreated,
}: CreateOrderForClientDialogProps) => {
  const { toast } = useToast();
  const [formValues, setFormValues] = useState<OrderFormValues>(() => {
    const defaults = getDefaultSchedule();
    return {
      type: "",
      pickup: "",
      delivery: "",
      date: defaults.date,
      time: defaults.time,
      weight: "",
      volume: "",
      express: false,
      fragile: false,
    };
  });
  const [errors, setErrors] = useState<OrderFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const defaults = getDefaultSchedule();
    setFormValues({
      type: "",
      pickup: client?.address?.trim() ?? "",
      delivery: "",
      date: defaults.date,
      time: defaults.time,
      weight: "",
      volume: "",
      express: false,
      fragile: false,
    });
    setErrors({});
    setIsSubmitting(false);
  }, [open, client]);

  const handleFieldChange =
    (field: keyof OrderFormValues) => (value: string) => {
      setFormValues((previous) => ({ ...previous, [field]: value }));
      setErrors((previous) => {
        const next = { ...previous };
        delete next[field];
        if (field === "date" || field === "time") {
          delete next.time;
        }
        return next;
      });
    };

  const handleCheckboxChange =
    (field: "express" | "fragile") => (checked: boolean | string) => {
      const value = Boolean(checked);
      setFormValues((previous) => ({ ...previous, [field]: value }));
    };

  const validateOrderForm = (values: OrderFormValues): OrderFormErrors => {
    const nextErrors: OrderFormErrors = {};
    if (!values.type) {
      nextErrors.type = "Sélectionnez un type de transport";
    }

    const pickup = values.pickup.trim();
    if (pickup.length < MIN_ADDRESS_LENGTH) {
      nextErrors.pickup = "Adresse de départ invalide";
    }

    const delivery = values.delivery.trim();
    if (delivery.length < MIN_ADDRESS_LENGTH) {
      nextErrors.delivery = "Adresse d'arrivée invalide";
    }

    if (!values.date) {
      nextErrors.date = "Date requise";
    }

    if (!values.time) {
      nextErrors.time = "Heure requise";
    }

    if (values.date && values.time) {
      const scheduled = new Date(`${values.date}T${values.time}`);
      if (Number.isNaN(scheduled.getTime())) {
        nextErrors.time = "Date/heure invalides";
      } else if (scheduled.getTime() <= Date.now()) {
        nextErrors.time = "Planifiez la course dans le futur";
      }
    }

    const weight = Number.parseFloat(values.weight);
    if (!Number.isFinite(weight) || weight <= 0) {
      nextErrors.weight = "Poids supérieur à 0 requis";
    }

    const volume = Number.parseFloat(values.volume);
    if (!Number.isFinite(volume) || volume <= 0) {
      nextErrors.volume = "Volume supérieur à 0 requis";
    }

    return nextErrors;
  };

  const pricePreview = useMemo<PriceEstimation | null>(() => {
    if (!client) {
      return null;
    }

    const pickup = formValues.pickup.trim();
    const delivery = formValues.delivery.trim();
    if (
      pickup.length < MIN_ADDRESS_LENGTH ||
      delivery.length < MIN_ADDRESS_LENGTH
    ) {
      return null;
    }

    const weight = Number.parseFloat(formValues.weight);
    const volume = Number.parseFloat(formValues.volume);
    if (!Number.isFinite(weight) || weight <= 0) {
      return null;
    }
    if (!Number.isFinite(volume) || volume <= 0) {
      return null;
    }

    const zone = inferZoneFromAddresses(pickup, delivery);
    const base = DEFAULT_BASE_BY_ZONE[zone] ?? DEFAULT_BASE_BY_ZONE.INTRA_PARIS;
    const distance = estimateDistanceKm(pickup, delivery);
    const km = distance > 0 ? Number.parseFloat(distance.toFixed(1)) : 1;
    const price = estimatePrice({
      base,
      km,
      express: formValues.express,
      fragile: formValues.fragile,
    });

    return {
      ...price,
      zone,
      km,
      base,
    };
  }, [
    client,
    formValues.delivery,
    formValues.express,
    formValues.fragile,
    formValues.pickup,
    formValues.volume,
    formValues.weight,
  ]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client) {
      return;
    }

    const validation = validateOrderForm(formValues);
    setErrors(validation);
    const hasErrors = Object.values(validation).some(Boolean);
    if (hasErrors) {
      return;
    }

    setIsSubmitting(true);
    try {
      const pickup = formValues.pickup.trim();
      const delivery = formValues.delivery.trim();
      const scheduleStart = new Date(`${formValues.date}T${formValues.time}`);
      const scheduleEnd = new Date(scheduleStart.getTime() + 60 * 60 * 1000);
      const weightNumber = Number.parseFloat(formValues.weight);
      const volumeNumber = Number.parseFloat(formValues.volume);

      const inferredZone = inferZoneFromAddresses(pickup, delivery);
      const zone = pricePreview?.zone ?? inferredZone;
      const base =
        pricePreview?.base ??
        DEFAULT_BASE_BY_ZONE[zone] ??
        DEFAULT_BASE_BY_ZONE.INTRA_PARIS;
      const distance = pricePreview?.km ?? estimateDistanceKm(pickup, delivery);
      const km = distance > 0 ? Number.parseFloat(distance.toFixed(1)) : 1;
      const price =
        pricePreview ??
        estimatePrice({
          base,
          km,
          express: formValues.express,
          fragile: formValues.fragile,
        });

      const orders = getOrders();
      const orderId = generateNextOrderNumber();
      assertUniqueOrderIdOrThrow(orderId);

      const optionsSummary = [
        formValues.express ? "Express" : null,
        formValues.fragile ? "Fragile" : null,
      ]
        .filter(Boolean)
        .join(" · ");

      const sectorLabel =
        SECTOR_DISPLAY_MAP[client.sector?.toUpperCase?.() ?? ""] ?? client.sector ?? "B2B Express";

      const newOrder: Order = {
        id: orderId,
        client: client.company,
        sector: sectorLabel,
        type: formValues.type,
        status: "En attente",
        amount: price.total,
        schedule: {
          start: scheduleStart.toISOString(),
          end: scheduleEnd.toISOString(),
        },
        pickupAddress: pickup,
        dropoffAddress: delivery,
        zoneRequirement: zone,
        volumeRequirement: `${Number.parseFloat(volumeNumber.toFixed(2))} m³`,
        weight: `${Number.parseFloat(weightNumber.toFixed(2))} kg`,
        instructions: optionsSummary || undefined,
        driverId: null,
        driverAssignedAt: null,
      };

      saveOrders([newOrder, ...orders]);
      reconcileGlobalOrderSeq();

      const storedClients = getClients();
      const clientIndex = storedClients.findIndex(
        (entry) => entry.id === client.id,
      );
      let updatedClient = client;
      if (clientIndex !== -1) {
        const nextClient: ClientRecord = {
          ...storedClients[clientIndex],
          orders: (storedClients[clientIndex].orders ?? 0) + 1,
          lastOrder: scheduleStart.toISOString(),
        };
        storedClients[clientIndex] = nextClient;
        saveClients(storedClients);
        updatedClient = nextClient;
      }

      onOrderCreated(updatedClient);
      toast({
        title: "Commande créée",
        description: `Commande ${orderId} enregistrée pour ${client.company}.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create order", error);
      toast({
        title: "Erreur lors de la création",
        description:
          error instanceof Error
            ? error.message
            : "Impossible d'enregistrer la commande.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!client) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[100vh] flex-col overflow-hidden bg-[#F5F7FA] p-0 text-[#1F1F1F] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl"
      >
        <DialogHeader className="px-6 pb-4 pt-6">
          <DialogTitle className="text-xl font-bold text-[#0F3556]">
            Créer une commande
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {client.company} · {client.contact}
          </DialogDescription>
        </DialogHeader>

        <form
          id="form-create-order-client"
          onSubmit={handleSubmit}
          className="flex-1 space-y-4 overflow-y-auto px-6 pb-6"
        >
          <div>
            <Label
              htmlFor="order-type"
              className="text-sm font-semibold text-[#0F3556]"
            >
              Type de transport *
            </Label>
            <Select
              value={formValues.type}
              onValueChange={handleFieldChange("type")}
            >
              <SelectTrigger
                id="order-type"
                className={`mt-1 focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
                  errors.type ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.type}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="order-pickup"
              className="text-sm font-semibold text-[#0F3556]"
            >
              Adresse de départ *
            </Label>
            <Input
              id="order-pickup"
              value={formValues.pickup}
              onChange={(event) =>
                handleFieldChange("pickup")(event.target.value)
              }
              className={`mt-1 focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
                errors.pickup ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
              placeholder="Adresse complète"
              autoComplete="street-address"
            />
            {errors.pickup && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.pickup}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="order-delivery"
              className="text-sm font-semibold text-[#0F3556]"
            >
              Adresse d'arrivée *
            </Label>
            <Input
              id="order-delivery"
              value={formValues.delivery}
              onChange={(event) =>
                handleFieldChange("delivery")(event.target.value)
              }
              className={`mt-1 focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
                errors.delivery
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
              placeholder="Adresse complète"
              autoComplete="street-address"
            />
            {errors.delivery && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.delivery}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label
                htmlFor="order-date"
                className="text-sm font-semibold text-[#0F3556]"
              >
                Date *
              </Label>
              <Input
                id="order-date"
                type="date"
                value={formValues.date}
                onChange={(event) =>
                  handleFieldChange("date")(event.target.value)
                }
                className={`mt-1 focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
                  errors.date ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.date}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="order-time"
                className="text-sm font-semibold text-[#0F3556]"
              >
                Heure *
              </Label>
              <Input
                id="order-time"
                type="time"
                value={formValues.time}
                onChange={(event) =>
                  handleFieldChange("time")(event.target.value)
                }
                className={`mt-1 focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
                  errors.time ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.time}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label
                htmlFor="order-weight"
                className="text-sm font-semibold text-[#0F3556]"
              >
                Poids (kg) *
              </Label>
              <Input
                id="order-weight"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={formValues.weight}
                onChange={(event) =>
                  handleFieldChange("weight")(event.target.value)
                }
                className={`mt-1 focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
                  errors.weight
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                placeholder="Ex : 2.5"
              />
              {errors.weight && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.weight}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="order-volume"
                className="text-sm font-semibold text-[#0F3556]"
              >
                Volume (m³) *
              </Label>
              <Input
                id="order-volume"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={formValues.volume}
                onChange={(event) =>
                  handleFieldChange("volume")(event.target.value)
                }
                className={`mt-1 focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
                  errors.volume
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                placeholder="Ex : 0.8"
              />
              {errors.volume && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.volume}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="order-express"
                checked={formValues.express}
                onCheckedChange={handleCheckboxChange("express")}
              />
              <Label
                htmlFor="order-express"
                className="text-sm font-medium text-[#0F3556]"
              >
                Livraison express (+30%)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="order-fragile"
                checked={formValues.fragile}
                onCheckedChange={handleCheckboxChange("fragile")}
              />
              <Label
                htmlFor="order-fragile"
                className="text-sm font-medium text-[#0F3556]"
              >
                Colis fragile (+15%)
              </Label>
            </div>
          </div>

          {pricePreview && (
            <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Zone estimée</span>
                <span className="font-semibold text-[#0F3556]">
                  {ZONE_LABELS[pricePreview.zone]}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Distance estimée</span>
                <span className="font-semibold">
                  {pricePreview.km.toFixed(1)} km
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Base</span>
                <span className="font-semibold">
                  {formatCurrencyEUR(pricePreview.base)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Distance</span>
                <span className="font-semibold">
                  {formatCurrencyEUR(pricePreview.breakdown.km)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Express</span>
                <span className="font-semibold">
                  {pricePreview.breakdown.express}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fragile</span>
                <span className="font-semibold">
                  {pricePreview.breakdown.fragile}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm font-semibold text-muted-foreground">
                  Estimation
                </span>
                <span className="text-lg font-bold text-[#0F3556]">
                  {formatCurrencyEUR(pricePreview.total)}
                </span>
              </div>
            </div>
          )}
        </form>

        <DialogFooter className="border-t border-border bg-[#F5F7FA] px-6 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              form="form-create-order-client"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-[#0F3556] hover:bg-[#0d2b46] text-white disabled:bg-[#0F3556]/50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Créer la commande"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface CreateClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated: (client: ClientRecord) => void;
}

const CreateClientModal = ({
  open,
  onOpenChange,
  onClientCreated,
}: CreateClientModalProps) => {
  const [values, setValues] = useState<FormValues>(INITIAL_FORM_VALUES);
  const [touched, setTouched] =
    useState<Record<keyof FormValues, boolean>>(INITIAL_TOUCHED);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateErrors, setDuplicateErrors] = useState<
    Partial<Record<keyof FormValues, string>>
  >({});
  const [duplicateBanner, setDuplicateBanner] = useState<{
    reason: DuplicateReason;
    existingId?: string;
  } | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const baseErrors = useMemo(() => validateForm(values), [values]);
  const combinedErrors = useMemo<FormErrors>(() => {
    const merged = { ...baseErrors } as FormErrors;
    (Object.keys(duplicateErrors) as (keyof FormValues)[]).forEach((field) => {
      const message = duplicateErrors[field];
      if (message) {
        merged[field] = message;
      }
    });
    return merged;
  }, [baseErrors, duplicateErrors]);
  const isFormValid = useMemo(
    () => Object.values(baseErrors).every((error) => error === ""),
    [baseErrors],
  );

  useEffect(() => {
    if (open) {
      setValues({ ...INITIAL_FORM_VALUES });
      setTouched({ ...INITIAL_TOUCHED });
      setSubmitAttempted(false);
      setIsSubmitting(false);
      setDuplicateErrors({});
      setDuplicateBanner(null);
      const focusTimer = window.setTimeout(() => {
        firstFieldRef.current?.focus();
      }, 50);
      return () => {
        window.clearTimeout(focusTimer);
      };
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setDuplicateErrors({});
    setDuplicateBanner(null);
    setValues({ ...INITIAL_FORM_VALUES });
    setTouched({ ...INITIAL_TOUCHED });
    setSubmitAttempted(false);
    setIsSubmitting(false);
    return undefined;
  }, [open]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const resetDuplicateForFields = (fields: (keyof FormValues)[]) => {
    setDuplicateErrors((previous) => {
      const next = { ...previous };
      let changed = false;
      fields.forEach((field) => {
        if (next[field]) {
          changed = true;
          delete next[field];
        }
      });
      return changed ? next : previous;
    });
    setDuplicateBanner((previous) => {
      if (!previous) {
        return previous;
      }
      const affected = DUPLICATE_FIELDS[previous.reason];
      if (affected.some((field) => fields.includes(field))) {
        return null;
      }
      return previous;
    });
  };

  const handleFieldChange = (field: keyof FormValues, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    switch (field) {
      case "company":
        resetDuplicateForFields(["company", "address", "phone"]);
        break;
      case "address":
        resetDuplicateForFields(["company", "address"]);
        break;
      case "phone":
        resetDuplicateForFields(["company", "phone"]);
        break;
      case "email":
        resetDuplicateForFields(["email"]);
        break;
      case "siret":
        resetDuplicateForFields(["siret"]);
        break;
      default:
        break;
    }
  };

  const handleBlur = (field: keyof FormValues) => {
    setTouched((previous) => ({ ...previous, [field]: true }));
  };

  const shouldShowError = (field: keyof FormValues) => {
    return (
      (touched[field] || submitAttempted || Boolean(duplicateErrors[field])) &&
      Boolean(combinedErrors[field])
    );
  };

  const getErrorId = (field: keyof FormValues) => `${field}-error`;

  const applyDuplicateResult = (result: DuplicateCheckResult) => {
    if (!result.duplicate || !result.reason) {
      return;
    }

    const fields = DUPLICATE_FIELDS[result.reason];
    const message = DUPLICATE_MESSAGES[result.reason];
    const nextErrors: Partial<Record<keyof FormValues, string>> = {};
    fields.forEach((field) => {
      nextErrors[field] = message;
    });
    setDuplicateErrors(nextErrors);
    setDuplicateBanner({
      reason: result.reason,
      existingId: result.existingId,
    });
    setTouched((previous) => {
      const updated = { ...previous };
      fields.forEach((field) => {
        updated[field] = true;
      });
      return updated;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);

    const hasBaseErrors = Object.values(baseErrors).some(
      (error) => error !== "",
    );
    if (hasBaseErrors) {
      setTouched({
        company: true,
        contact: true,
        email: true,
        phone: true,
        sector: true,
        address: true,
        siret: true,
      });
      setDuplicateErrors({});
      setDuplicateBanner(null);
      return;
    }

    const duplicateCheck = checkDuplicate({
      company: values.company,
      contact: values.contact,
      email: values.email,
      phone: values.phone,
      sector: values.sector,
      address: values.address,
      siret: values.siret,
    });

    if (duplicateCheck.duplicate) {
      applyDuplicateResult(duplicateCheck);
      return;
    }

    setDuplicateErrors({});
    setDuplicateBanner(null);
    setIsSubmitting(true);
    const delay = Math.floor(Math.random() * 301) + 500;
    timeoutRef.current = window.setTimeout(() => {
      try {
        const newClient = createClient({
          company: values.company.trim(),
          contact: values.contact.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          sector: values.sector,
          address: values.address.trim(),
          siret: values.siret.trim(),
        });
        onClientCreated(newClient);
      } catch (error) {
        if (error instanceof DuplicateClientError) {
          applyDuplicateResult(error.result);
        } else {
          console.error("Failed to create client", error);
        }
      } finally {
        setIsSubmitting(false);
        timeoutRef.current = null;
      }
    }, delay);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <DialogContent
      id="modal-create-client"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-client-title"
      className="flex h-[100vh] flex-col overflow-hidden bg-[#F5F7FA] text-[#1F1F1F] p-0 sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-2xl"
    >
      <DialogHeader className="px-6 pt-6 text-left">
        <DialogTitle
          id="create-client-title"
          className="text-xl font-bold text-[#0F3556]"
        >
          Créer un client
        </DialogTitle>
        <DialogDescription className="text-sm text-[#1F1F1F]/70">
          Tous les champs sont obligatoires. Les validations sont appliquées en
          temps réel.
        </DialogDescription>
      </DialogHeader>

      {duplicateBanner && (
        <div
          className="mx-6 mb-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
                aria-hidden="true"
              />
              <p className="font-semibold">
                Doublon détecté : {DUPLICATE_MESSAGES[duplicateBanner.reason]}
              </p>
            </div>
            {duplicateBanner.existingId && (
              <Link
                to={`/admin/clients/${duplicateBanner.existingId}`}
                className="flex-shrink-0"
              >
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-[#0F3556] text-[#0F3556] hover:bg-[#0F3556]/10"
                >
                  Voir la fiche (#{duplicateBanner.existingId})
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      <form
        id="form-create-client"
        className="flex-1 space-y-4 overflow-y-auto px-6 pb-4 pt-4"
        onSubmit={handleSubmit}
      >
        <div>
          <Label
            htmlFor="company"
            className="text-sm font-semibold text-[#0F3556]"
          >
            Entreprise
          </Label>
          <Input
            id="company"
            ref={firstFieldRef}
            value={values.company}
            onChange={(event) =>
              handleFieldChange("company", event.target.value)
            }
            onBlur={() => handleBlur("company")}
            aria-invalid={combinedErrors.company ? "true" : "false"}
            aria-describedby={
              shouldShowError("company") ? getErrorId("company") : undefined
            }
            className={`mt-1 bg-white text-[#1F1F1F] focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
              shouldShowError("company")
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
            autoComplete="organization"
          />
          {shouldShowError("company") && (
            <p
              id={getErrorId("company")}
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {combinedErrors.company}
            </p>
          )}
        </div>

        <div>
          <Label
            htmlFor="contact"
            className="text-sm font-semibold text-[#0F3556]"
          >
            Contact principal
          </Label>
          <Input
            id="contact"
            value={values.contact}
            onChange={(event) =>
              handleFieldChange("contact", event.target.value)
            }
            onBlur={() => handleBlur("contact")}
            aria-invalid={combinedErrors.contact ? "true" : "false"}
            aria-describedby={
              shouldShowError("contact") ? getErrorId("contact") : undefined
            }
            className={`mt-1 bg-white text-[#1F1F1F] focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
              shouldShowError("contact")
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
            autoComplete="name"
          />
          {shouldShowError("contact") && (
            <p
              id={getErrorId("contact")}
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {combinedErrors.contact}
            </p>
          )}
        </div>

        <div>
          <Label
            htmlFor="email"
            className="text-sm font-semibold text-[#0F3556]"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            value={values.email}
            onChange={(event) => handleFieldChange("email", event.target.value)}
            onBlur={() => handleBlur("email")}
            aria-invalid={combinedErrors.email ? "true" : "false"}
            aria-describedby={
              shouldShowError("email") ? getErrorId("email") : undefined
            }
            className={`mt-1 bg-white text-[#1F1F1F] focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
              shouldShowError("email")
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
            autoComplete="email"
          />
          {shouldShowError("email") && (
            <p
              id={getErrorId("email")}
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {combinedErrors.email}
            </p>
          )}
        </div>

        <div>
          <Label
            htmlFor="phone"
            className="text-sm font-semibold text-[#0F3556]"
          >
            Téléphone
          </Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            value={values.phone}
            onChange={(event) => handleFieldChange("phone", event.target.value)}
            onBlur={() => handleBlur("phone")}
            aria-invalid={combinedErrors.phone ? "true" : "false"}
            aria-describedby={
              shouldShowError("phone") ? getErrorId("phone") : undefined
            }
            className={`mt-1 bg-white text-[#1F1F1F] focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
              shouldShowError("phone")
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
            autoComplete="tel"
          />
          {shouldShowError("phone") && (
            <p
              id={getErrorId("phone")}
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {combinedErrors.phone}
            </p>
          )}
        </div>

        <div>
          <Label
            htmlFor="sector"
            className="text-sm font-semibold text-[#0F3556]"
          >
            Secteur
          </Label>
          <Select
            value={values.sector}
            onValueChange={(value) => {
              handleFieldChange("sector", value);
              setTouched((previous) => ({ ...previous, sector: true }));
            }}
          >
            <SelectTrigger
              id="sector"
              onBlur={() => handleBlur("sector")}
              aria-invalid={combinedErrors.sector ? "true" : "false"}
              aria-describedby={
                shouldShowError("sector") ? getErrorId("sector") : undefined
              }
              className={`mt-1 bg-white text-[#1F1F1F] focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
                shouldShowError("sector")
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
            >
              <SelectValue placeholder="Sélectionner un secteur" />
            </SelectTrigger>
            <SelectContent>
              {SECTOR_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {shouldShowError("sector") && (
            <p
              id={getErrorId("sector")}
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {combinedErrors.sector}
            </p>
          )}
        </div>

        <div>
          <Label
            htmlFor="address"
            className="text-sm font-semibold text-[#0F3556]"
          >
            Adresse
          </Label>
          <Input
            id="address"
            value={values.address}
            onChange={(event) =>
              handleFieldChange("address", event.target.value)
            }
            onBlur={() => handleBlur("address")}
            aria-invalid={combinedErrors.address ? "true" : "false"}
            aria-describedby={
              shouldShowError("address") ? getErrorId("address") : undefined
            }
            className={`mt-1 bg-white text-[#1F1F1F] focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
              shouldShowError("address")
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
            autoComplete="street-address"
          />
          {shouldShowError("address") && (
            <p
              id={getErrorId("address")}
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {combinedErrors.address}
            </p>
          )}
        </div>

        <div>
          <Label
            htmlFor="siret"
            className="text-sm font-semibold text-[#0F3556]"
          >
            SIRET
          </Label>
          <Input
            id="siret"
            inputMode="numeric"
            value={values.siret}
            onChange={(event) =>
              handleFieldChange(
                "siret",
                event.target.value.replace(/[^\d]/g, ""),
              )
            }
            onBlur={() => handleBlur("siret")}
            aria-invalid={combinedErrors.siret ? "true" : "false"}
            aria-describedby={
              shouldShowError("siret") ? getErrorId("siret") : undefined
            }
            className={`mt-1 bg-white text-[#1F1F1F] focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
              shouldShowError("siret")
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
            maxLength={14}
            autoComplete="off"
          />
          {shouldShowError("siret") && (
            <p
              id={getErrorId("siret")}
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {combinedErrors.siret}
            </p>
          )}
        </div>
      </form>

      <DialogFooter className="sticky bottom-0 left-0 right-0 gap-3 bg-[#F5F7FA] px-6 pb-6 pt-4 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={handleCancel}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          form="form-create-client"
          disabled={!isFormValid || isSubmitting}
          className="w-full sm:w-auto bg-[#0F3556] hover:bg-[#0d2b46] text-white disabled:bg-[#0F3556]/50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Création en cours...
            </>
          ) : (
            "Créer"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export { CreateOrderForClientDialog };

export default AdminClients;
