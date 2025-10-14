import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Search, Filter, Plus, Mail, Phone, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  checkDuplicate,
  createClient,
  getClients,
  type ClientRecord,
  type DuplicateReason,
  type DuplicateCheckResult,
  DuplicateClientError,
} from "@/lib/clientStorage";

const SECTOR_OPTIONS = ["Médical", "Optique", "Événementiel", "Juridique", "Autre"];
const STATUS_OPTIONS = ["Actif", "Inactif"];

const EMAIL_REGEX = /^(?:[a-zA-Z0-9_'^&/+-])+(?:\.(?:[a-zA-Z0-9_'^&/+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\+?\d[\d\s]{8,16}$/;
const SIRET_REGEX = /^\d{14}$/;

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
  companyAddress: "Un client avec la même entreprise et la même adresse existe déjà.",
  companyPhone: "Un client avec ce téléphone pour cette entreprise existe déjà.",
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
      const matchesSector = sectorFilter === "all" || client.sector === sectorFilter;
      const matchesStatus = statusFilter === "all" || client.status === statusFilter;
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
  const averageOrders = clients.length > 0 ? Math.round(totalOrders / clients.length) : 0;

  const handleClientCreated = (client: ClientRecord) => {
    setClients((previous) => [client, ...previous]);
    setIsModalOpen(false);
    toast({
      title: "✅ Client créé avec succès",
      description: `${client.company} a été ajouté à votre portefeuille.`,
    });
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />} topbar={<Topbar title="Gestion des clients" />}>
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
                <TableHead className="font-semibold text-center">Commandes</TableHead>
                <TableHead className="font-semibold">Statut</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id} className="hover:bg-muted/30">
                  <TableCell className="font-semibold">{client.company}</TableCell>
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
                  <TableCell className="text-center font-semibold">{client.orders ?? 0}</TableCell>
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
                      <Button variant="ghost" size="sm">
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
          <p className="text-2xl font-bold text-[#0F3556]">{clients.length}</p>
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
          <p className="text-xs text-muted-foreground mb-1">Moyenne / client</p>
          <p className="text-2xl font-bold text-muted-foreground">{averageOrders}</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

interface CreateClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated: (client: ClientRecord) => void;
}

const CreateClientModal = ({ open, onOpenChange, onClientCreated }: CreateClientModalProps) => {
  const [values, setValues] = useState<FormValues>(INITIAL_FORM_VALUES);
  const [touched, setTouched] = useState<Record<keyof FormValues, boolean>>(INITIAL_TOUCHED);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateErrors, setDuplicateErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [duplicateBanner, setDuplicateBanner] = useState<{ reason: DuplicateReason; existingId?: string } | null>(null);
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
  const isFormValid = useMemo(() => Object.values(baseErrors).every((error) => error === ""), [baseErrors]);

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
    return (touched[field] || submitAttempted || Boolean(duplicateErrors[field])) && Boolean(combinedErrors[field]);
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
    setDuplicateBanner({ reason: result.reason, existingId: result.existingId });
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

    const hasBaseErrors = Object.values(baseErrors).some((error) => error !== "");
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
        <DialogTitle id="create-client-title" className="text-xl font-bold text-[#0F3556]">
          Créer un client
        </DialogTitle>
        <DialogDescription className="text-sm text-[#1F1F1F]/70">
          Tous les champs sont obligatoires. Les validations sont appliquées en temps réel.
        </DialogDescription>
      </DialogHeader>

    {duplicateBanner && (
      <div
        className="mx-6 mb-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        role="alert"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" aria-hidden="true" />
            <p className="font-semibold">
              Doublon détecté : {DUPLICATE_MESSAGES[duplicateBanner.reason]}
            </p>
          </div>
          {duplicateBanner.existingId && (
            <Link to={`/admin/clients/${duplicateBanner.existingId}`} className="flex-shrink-0">
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
          <Label htmlFor="company" className="text-sm font-semibold text-[#0F3556]">
            Entreprise
          </Label>
          <Input
            id="company"
            ref={firstFieldRef}
            value={values.company}
            onChange={(event) => handleFieldChange("company", event.target.value)}
            onBlur={() => handleBlur("company")}
            aria-invalid={combinedErrors.company ? "true" : "false"}
            aria-describedby={shouldShowError("company") ? getErrorId("company") : undefined}
            className={`mt-1 bg-white text-[#1F1F1F] focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
              shouldShowError("company") ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            autoComplete="organization"
          />
          {shouldShowError("company") && (
            <p id={getErrorId("company")} className="mt-1 text-sm text-red-600" role="alert">
              {combinedErrors.company}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="contact" className="text-sm font-semibold text-[#0F3556]">
            Contact principal
          </Label>
          <Input
            id="contact"
            value={values.contact}
            onChange={(event) => handleFieldChange("contact", event.target.value)}
            onBlur={() => handleBlur("contact")}
            aria-invalid={combinedErrors.contact ? "true" : "false"}
            aria-describedby={shouldShowError("contact") ? getErrorId("contact") : undefined}
            className={`mt-1 bg-white text-[#1F1F1F] focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
              shouldShowError("contact") ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            autoComplete="name"
          />
          {shouldShowError("contact") && (
            <p id={getErrorId("contact")} className="mt-1 text-sm text-red-600" role="alert">
              {combinedErrors.contact}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-semibold text-[#0F3556]">
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
            aria-describedby={shouldShowError("email") ? getErrorId("email") : undefined}
            className={`mt-1 bg-white text-[#1F1F1F] focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
              shouldShowError("email") ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            autoComplete="email"
          />
          {shouldShowError("email") && (
            <p id={getErrorId("email")} className="mt-1 text-sm text-red-600" role="alert">
              {combinedErrors.email}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm font-semibold text-[#0F3556]">
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
            aria-describedby={shouldShowError("phone") ? getErrorId("phone") : undefined}
            className={`mt-1 bg-white text-[#1F1F1F] focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
              shouldShowError("phone") ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            autoComplete="tel"
          />
          {shouldShowError("phone") && (
            <p id={getErrorId("phone")} className="mt-1 text-sm text-red-600" role="alert">
              {combinedErrors.phone}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="sector" className="text-sm font-semibold text-[#0F3556]">
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
              aria-describedby={shouldShowError("sector") ? getErrorId("sector") : undefined}
              className={`mt-1 bg-white text-[#1F1F1F] focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
                shouldShowError("sector") ? "border-red-500 focus-visible:ring-red-500" : ""
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
            <p id={getErrorId("sector")} className="mt-1 text-sm text-red-600" role="alert">
              {combinedErrors.sector}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="address" className="text-sm font-semibold text-[#0F3556]">
            Adresse
          </Label>
          <Input
            id="address"
            value={values.address}
            onChange={(event) => handleFieldChange("address", event.target.value)}
            onBlur={() => handleBlur("address")}
            aria-invalid={combinedErrors.address ? "true" : "false"}
            aria-describedby={shouldShowError("address") ? getErrorId("address") : undefined}
            className={`mt-1 bg-white text-[#1F1F1F] focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
              shouldShowError("address") ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            autoComplete="street-address"
          />
          {shouldShowError("address") && (
            <p id={getErrorId("address")} className="mt-1 text-sm text-red-600" role="alert">
              {combinedErrors.address}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="siret" className="text-sm font-semibold text-[#0F3556]">
            SIRET
          </Label>
          <Input
            id="siret"
            inputMode="numeric"
            value={values.siret}
            onChange={(event) => handleFieldChange("siret", event.target.value.replace(/[^\d]/g, ""))}
            onBlur={() => handleBlur("siret")}
            aria-invalid={combinedErrors.siret ? "true" : "false"}
            aria-describedby={shouldShowError("siret") ? getErrorId("siret") : undefined}
            className={`mt-1 bg-white text-[#1F1F1F] focus-visible:ring-[#FFB800] focus-visible:border-[#0F3556] ${
              shouldShowError("siret") ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            maxLength={14}
            autoComplete="off"
          />
          {shouldShowError("siret") && (
            <p id={getErrorId("siret")} className="mt-1 text-sm text-red-600" role="alert">
              {combinedErrors.siret}
            </p>
          )}
        </div>
      </form>

      <DialogFooter className="sticky bottom-0 left-0 right-0 gap-3 bg-[#F5F7FA] px-6 pb-6 pt-4 sm:flex-row">
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleCancel}>
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

export default AdminClients;
