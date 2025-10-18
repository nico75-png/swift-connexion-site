import { FormEvent, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Edit, Mail, Phone, MapPin } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CreateOrderForClientDialog } from "@/pages/admin/Clients";
import { type ClientRecord } from "@/lib/clientStorage";
import {
  callCustomer,
  disableCustomerAccount,
  sendEmailToCustomer,
} from "@/lib/services/customer.service";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

/**
 * Page admin - Profil détaillé d'un client
 * Données générales, historique commandes, dépenses, factures
 */
const ADMIN_ID = "admin-1";

const SECTOR_OPTIONS = [
  "Santé & Médical",
  "Juridique",
  "Optique",
  "Logistique",
  "Retail",
  "Technologie",
  "Autre",
];

const extractContactNames = (fullName: string) => {
  if (!fullName.trim()) {
    return { firstName: "", lastName: "" };
  }

  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

const formatSiret = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  const first = digits.slice(0, 3);
  const second = digits.slice(3, 6);
  const third = digits.slice(6, 9);
  const rest = digits.slice(9);

  return [first, second, third, rest].filter(Boolean).join(" ").trim();
};

const AdminClientProfile = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [client, setClient] = useState(() => ({
    id: id || "1",
    company: "Cabinet client",
    contact: "Contact client",
    sector: "Juridique",
    siret: "123 456 789 00012",
    address: "12 rue de la Paix, 75002 Paris",
    email: "contact@cabinet.fr",
    phone: "01 23 45 67 89",
    status: "Actif",
    signupDate: "2024-03-15",
    totalOrders: 47,
    totalSpent: 2234.5,
    lastOrder: null as string | null,
  }));
  const [notes, setNotes] = useState(
    "Client fidèle et régulier. Préfère les livraisons matinales.",
  );
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formValues, setFormValues] = useState(() => {
    const contact = extractContactNames(client.contact);

    return {
      company: client.company,
      contactFirstName: contact.firstName,
      contactLastName: contact.lastName,
      email: client.email,
      phone: client.phone,
      address: client.address,
      siret: client.siret.replace(/\D/g, ""),
      sector: client.sector,
      isActive: client.status === "Actif",
    };
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const clientRecord = useMemo<ClientRecord>(
    () => ({
      id: client.id,
      company: client.company,
      contact: client.contact,
      email: client.email,
      phone: client.phone,
      sector: client.sector,
      address: client.address,
      siret: client.siret.replace(/\D/g, ""),
      createdAt: client.signupDate,
      orders: client.totalOrders,
      status: client.status,
      lastOrder: client.lastOrder ?? null,
    }),
    [client],
  );

  const statusBadgeClass =
    client.status === "Actif"
      ? "bg-success/10 text-success border-success/20"
      : "bg-warning/10 text-warning border-warning/20";

  const handleOrderDialogChange = (open: boolean) => {
    setIsOrderDialogOpen(open);
  };

  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open);
    if (open) {
      const contact = extractContactNames(client.contact);
      setFormValues({
        company: client.company,
        contactFirstName: contact.firstName,
        contactLastName: contact.lastName,
        email: client.email,
        phone: client.phone,
        address: client.address,
        siret: client.siret.replace(/\D/g, ""),
        sector: client.sector,
        isActive: client.status === "Actif",
      });
      setFormErrors({});
    } else {
      setFormErrors({});
    }
  };

  const handleOrderCreated = (updatedClient: ClientRecord) => {
    setClient((previous) => ({
      ...previous,
      status: updatedClient.status ?? previous.status,
      totalOrders: updatedClient.orders ?? previous.totalOrders,
      lastOrder: updatedClient.lastOrder ?? previous.lastOrder,
    }));
  };

  const handleSendEmail = async () => {
    if (isEmailSending) {
      return;
    }

    try {
      setIsEmailSending(true);
      await sendEmailToCustomer(client.id);
      toast({
        title: "Email envoyé",
        description: `Un email a été envoyé à ${client.contact}.`,
      });
    } catch (error) {
      console.error("Failed to send email", error);
      toast({
        title: "Échec de l'envoi",
        description: "Impossible d'envoyer l'email. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleCallCustomer = async () => {
    if (isCalling) {
      return;
    }

    try {
      setIsCalling(true);
      await callCustomer(client.phone);
      toast({
        title: "Appel en cours",
        description: `Appel vers ${client.phone} déclenché.`,
      });
    } catch (error) {
      console.error("Failed to initiate call", error);
      toast({
        title: "Appel impossible",
        description: "Impossible de lancer l'appel pour le moment.",
        variant: "destructive",
      });
    } finally {
      setIsCalling(false);
    }
  };

  const handleDisableAccount = async () => {
    if (client.status !== "Actif") {
      setIsDisableDialogOpen(false);
      return;
    }

    const companyName = client.company;
    try {
      setIsDisabling(true);
      await disableCustomerAccount(client.id);
      setClient((previous) => ({ ...previous, status: "Inactif" }));
      toast({
        title: "Compte désactivé",
        description: `${companyName} a été désactivé.`,
      });
    } catch (error) {
      console.error("Failed to disable account", error);
      toast({
        title: "Action impossible",
        description:
          "La désactivation du compte a échoué. Réessayez plus tard.",
        variant: "destructive",
      });
    } finally {
      setIsDisabling(false);
      setIsDisableDialogOpen(false);
    }
  };

  const recentOrders: Array<{ id: string; date: string; status: string; amount: number }> = [];

  const invoices: Array<{ id: string; period: string; amount: number; status: string; dueDate: string }> = [];

  const spendingData: Array<{ month: string; amount: number }> = [];

  const handleSaveNotes = () => {
    toast({
      title: "Notes enregistrées",
      description: "Les notes ont été mises à jour.",
    });
  };

  const handleDownloadSummary = () => {
    toast({
      title: "Téléchargement",
      description: "Génération de la synthèse client en cours...",
    });
  };

  const handleFormChange = (field: string, value: string | boolean) => {
    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = formValues.phone.replace(/\D/g, "");
    const siretDigits = formValues.siret.replace(/\D/g, "");

    if (!formValues.company.trim()) {
      errors.company = "Le nom de l'entreprise est requis";
    }
    if (!formValues.contactFirstName.trim()) {
      errors.contactFirstName = "Le prénom est requis";
    }
    if (!formValues.contactLastName.trim()) {
      errors.contactLastName = "Le nom est requis";
    }
    if (!formValues.email.trim() || !emailRegex.test(formValues.email)) {
      errors.email = "Email invalide";
    }
    if (!formValues.phone.trim() || phoneDigits.length < 10) {
      errors.phone = "Téléphone invalide";
    }
    if (!formValues.address.trim()) {
      errors.address = "L'adresse postale est requise";
    }
    if (!siretDigits) {
      errors.siret = "Le SIRET est requis";
    } else if (!/^[0-9]+$/.test(siretDigits) || siretDigits.length !== 14) {
      errors.siret = "Le SIRET doit contenir 14 chiffres";
    }
    if (!formValues.sector.trim()) {
      errors.sector = "Le secteur est requis";
    }

    return errors;
  };

  const handleSubmitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const formattedSiret = formatSiret(formValues.siret);
    const updatedClient = {
      ...client,
      company: formValues.company.trim(),
      contact: `${formValues.contactFirstName.trim()} ${formValues.contactLastName.trim()}`.trim(),
      email: formValues.email.trim(),
      phone: formValues.phone.trim(),
      address: formValues.address.trim(),
      siret: formattedSiret,
      sector: formValues.sector,
      status: formValues.isActive ? "Actif" : "Inactif",
    };

    const changes = Object.entries(updatedClient).reduce<Record<string, { before: unknown; after: unknown }>>(
      (acc, [key, value]) => {
        const previousValue = (client as Record<string, unknown>)[key];
        if (previousValue !== value) {
          acc[key] = { before: previousValue, after: value };
        }
        return acc;
      },
      {},
    );

    setClient(updatedClient);
    setIsEditOpen(false);
    setFormErrors({});
    toast({
      title: "Modification enregistrée",
      description: "✅ Les informations du client ont été mises à jour avec succès.",
    });

    if (Object.keys(changes).length > 0) {
      const auditLog = {
        adminId: ADMIN_ID,
        timestamp: new Date().toISOString(),
        clientId: client.id,
        changes,
      };
      console.info("[AUDIT] Client update", auditLog);
    }
  };

  const handleCancelEdit = () => {
    setIsEditOpen(false);
    setFormErrors({});
  };

  return (
    <>
      <DashboardLayout
        sidebar={<AdminSidebar />}
        topbar={<Topbar title={client.company} />}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/admin/clients">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux clients
            </Button>
          </Link>
          <div className="flex gap-2">
            <Sheet open={isEditOpen} onOpenChange={handleEditOpenChange}>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
                <form onSubmit={handleSubmitForm} className="space-y-6">
                  <SheetHeader>
                    <SheetTitle>Modifier les informations du client</SheetTitle>
                    <SheetDescription>
                      Cette interface est réservée aux administrateurs et permet de mettre à jour les
                      données du client sans quitter la page.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="company">Nom de l'entreprise</Label>
                      <Input
                        id="company"
                        value={formValues.company}
                        onChange={(event) => handleFormChange("company", event.target.value)}
                      />
                      {formErrors.company && (
                        <p className="text-sm text-destructive">{formErrors.company}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="contact-first">Prénom</Label>
                        <Input
                          id="contact-first"
                          value={formValues.contactFirstName}
                          onChange={(event) => handleFormChange("contactFirstName", event.target.value)}
                        />
                        {formErrors.contactFirstName && (
                          <p className="text-sm text-destructive">{formErrors.contactFirstName}</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="contact-last">Nom</Label>
                        <Input
                          id="contact-last"
                          value={formValues.contactLastName}
                          onChange={(event) => handleFormChange("contactLastName", event.target.value)}
                        />
                        {formErrors.contactLastName && (
                          <p className="text-sm text-destructive">{formErrors.contactLastName}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formValues.email}
                        onChange={(event) => handleFormChange("email", event.target.value)}
                      />
                      {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={formValues.phone}
                        onChange={(event) => handleFormChange("phone", event.target.value)}
                      />
                      {formErrors.phone && <p className="text-sm text-destructive">{formErrors.phone}</p>}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="address">Adresse postale</Label>
                      <Textarea
                        id="address"
                        value={formValues.address}
                        onChange={(event) => handleFormChange("address", event.target.value)}
                        rows={3}
                      />
                      {formErrors.address && <p className="text-sm text-destructive">{formErrors.address}</p>}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="siret">SIRET</Label>
                      <Input
                        id="siret"
                        value={formValues.siret}
                        onChange={(event) =>
                          handleFormChange("siret", event.target.value.replace(/\D/g, ""))
                        }
                        inputMode="numeric"
                        maxLength={14}
                      />
                      {formErrors.siret && <p className="text-sm text-destructive">{formErrors.siret}</p>}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="sector">Secteur</Label>
                      <Select
                        value={formValues.sector}
                        onValueChange={(value) => handleFormChange("sector", value)}
                      >
                        <SelectTrigger id="sector">
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
                      {formErrors.sector && <p className="text-sm text-destructive">{formErrors.sector}</p>}
                    </div>

                    <div className="flex items-center justify-between rounded-md border p-4">
                      <div>
                        <p className="font-medium">Statut du compte</p>
                        <p className="text-sm text-muted-foreground">
                          Accessible uniquement aux administrateurs : Actif / Désactivé
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Désactivé</span>
                        <Switch
                          checked={formValues.isActive}
                          onCheckedChange={(checked) => handleFormChange("isActive", checked)}
                          aria-label="Statut du compte"
                        />
                        <span className="text-sm font-medium">Actif</span>
                      </div>
                    </div>
                  </div>

                  <SheetFooter className="flex sm:flex-row sm:justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                      Annuler
                    </Button>
                    <Button type="submit">Enregistrer les modifications</Button>
                  </SheetFooter>
                </form>
              </SheetContent>
            </Sheet>
            <Button variant="outline" onClick={handleDownloadSummary}>
              <Download className="h-4 w-4 mr-2" />
              Synthèse PDF
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <Card className="border-none shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Informations générales</CardTitle>
                  <Badge variant="outline" className={statusBadgeClass}>
                    {client.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Entreprise
                    </p>
                    <p className="font-semibold">{client.company}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Contact principal
                    </p>
                    <p className="font-semibold">{client.contact}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Secteur
                    </p>
                    <Badge variant="outline">{client.sector}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">SIRET</p>
                    <p className="font-mono text-sm">{client.siret}</p>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <a
                      href={`mailto:${client.email}`}
                      className="text-primary hover:underline"
                    >
                      {client.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <a
                      href={`tel:${client.phone}`}
                      className="text-primary hover:underline"
                    >
                      {client.phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <p>{client.address}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {client.totalOrders}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Commandes
                    </p>
                  </div>
                  <div className="text-center p-3 bg-success/10 rounded-lg">
                    <p className="text-2xl font-bold text-success">
                      {client.totalSpent}€
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total dépensé
                    </p>
                  </div>
                  <div className="text-center p-3 bg-info/10 rounded-lg">
                    <p className="text-2xl font-bold text-info">
                      {Math.round(client.totalSpent / client.totalOrders)}€
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Panier moyen
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Graphique dépenses */}
            <Card className="border-none shadow-soft">
              <CardHeader>
                <CardTitle>Évolution des dépenses (6 derniers mois)</CardTitle>
              </CardHeader>
              <CardContent>
                {spendingData.length === 0 ? (
                  <div className="flex h-[250px] items-center justify-center rounded-lg border border-dashed border-muted-foreground/40 text-sm text-muted-foreground">
                    Aucune donnée de dépenses disponible.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={spendingData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="month"
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="hsl(var(--success))"
                        fill="hsl(var(--success) / 0.2)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Historique commandes */}
            <Card className="border-none shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Dernières commandes</CardTitle>
                  <Link to="/admin/commandes">
                    <Button variant="ghost" size="sm">
                      Voir tout
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Commande</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                          Aucune commande récente.
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono font-semibold">
                            {order.id}
                          </TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{order.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {order.amount}€
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Factures */}
            <Card className="border-none shadow-soft">
              <CardHeader>
                <CardTitle>Factures</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Facture</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Échéance</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                          Aucune facture disponible.
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-mono font-semibold">
                            {invoice.id}
                          </TableCell>
                          <TableCell>{invoice.period}</TableCell>
                          <TableCell className="font-semibold">
                            {invoice.amount}€
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {invoice.dueDate}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-success/10 text-success border-success/20"
                            >
                              {invoice.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Notes internes */}
            <Card className="border-none shadow-soft">
              <CardHeader>
                <CardTitle>Notes internes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ajoutez des notes sur ce client..."
                  rows={6}
                />
                <Button onClick={handleSaveNotes} className="w-full">
                  Enregistrer les notes
                </Button>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card className="border-none shadow-soft">
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="cta"
                  className="w-full justify-start"
                  onClick={() => setIsOrderDialogOpen(true)}
                >
                  Créer une commande
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleSendEmail}
                  disabled={isEmailSending}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {isEmailSending ? "Envoi en cours..." : "Envoyer un email"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleCallCustomer}
                  disabled={isCalling}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {isCalling ? "Appel..." : "Appeler le client"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-warning hover:text-warning"
                  onClick={() => setIsDisableDialogOpen(true)}
                  disabled={client.status !== "Actif"}
                >
                  Désactiver le compte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>

      <CreateOrderForClientDialog
        client={clientRecord}
        open={isOrderDialogOpen}
        onOpenChange={handleOrderDialogChange}
        onOrderCreated={handleOrderCreated}
      />

      <AlertDialog
        open={isDisableDialogOpen}
        onOpenChange={setIsDisableDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la désactivation</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action désactivera l'accès du client. Confirmez-vous la
              désactivation ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDisabling}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableAccount}
              disabled={isDisabling}
            >
              {isDisabling ? "Désactivation..." : "Désactiver"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminClientProfile;
