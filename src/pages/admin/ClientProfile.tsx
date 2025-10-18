import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Edit, Mail, Phone, MapPin } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { useAuth } from "@/lib/stores/auth.store";
import {
  callCustomer,
  disableCustomerAccount,
  sendEmailToCustomer,
} from "@/lib/services/customer.service";

/**
 * Page admin - Profil détaillé d'un client
 * Données générales, historique commandes, dépenses, factures
 */
const AdminClientProfile = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [client, setClient] = useState(() => ({
    id: id || "1",
    company: "Cabinet Dupont",
    contact: "Jean Dupont",
    sector: "Juridique",
    siret: "123 456 789 00012",
    address: "12 rue de la Paix, 75002 Paris",
    email: "j.dupont@cabinet.fr",
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
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [emailSubject, setEmailSubject] = useState("Suivi de votre compte");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailFormErrors, setEmailFormErrors] = useState<{ email?: string; message?: string }>({});
  const [hasAcknowledgedDisable, setHasAcknowledgedDisable] = useState(false);

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

  const defaultEmailSubject = useMemo(
    () => `Suivi de votre compte ${client.company}`,
    [client.company],
  );

  const statusBadgeClass = useMemo(() => {
    if (client.status === "Actif") {
      return "bg-success/10 text-success border-success/20";
    }
    if (client.status === "Désactivé") {
      return "bg-destructive/10 text-destructive border-destructive/20";
    }
    return "bg-warning/10 text-warning border-warning/20";
  }, [client.status]);

  const isPrivilegedUser = Boolean(
    currentUser && ["admin", "support"].includes(currentUser.role),
  );

  const areQuickActionsDisabled = client.status !== "Actif";

  useEffect(() => {
    if (!isEmailDialogOpen) {
      setEmailSubject(defaultEmailSubject);
      setEmailMessage("");
      setEmailFormErrors({});
    }
  }, [defaultEmailSubject, isEmailDialogOpen]);

  useEffect(() => {
    if (!isDisableDialogOpen) {
      setHasAcknowledgedDisable(false);
    }
  }, [isDisableDialogOpen]);

  const handleOrderDialogChange = (open: boolean) => {
    if (areQuickActionsDisabled) {
      setIsOrderDialogOpen(false);
      return;
    }
    setIsOrderDialogOpen(open);
  };

  const handleOrderCreated = (updatedClient: ClientRecord) => {
    setClient((previous) => ({
      ...previous,
      status: updatedClient.status ?? previous.status,
      totalOrders: updatedClient.orders ?? previous.totalOrders,
      lastOrder: updatedClient.lastOrder ?? previous.lastOrder,
    }));
  };

  const handleEmailDialogChange = (open: boolean) => {
    if (!isPrivilegedUser && open) {
      toast({
        title: "Accès refusé",
        description: "Action réservée aux administrateurs.",
        variant: "destructive",
      });
      setIsEmailDialogOpen(false);
      return;
    }

    if (areQuickActionsDisabled && open) {
      toast({
        title: "Compte désactivé",
        description: "Les actions rapides ne sont plus disponibles pour ce client.",
        variant: "destructive",
      });
      setIsEmailDialogOpen(false);
      return;
    }

    setIsEmailDialogOpen(open);
  };

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isPrivilegedUser || !currentUser) {
      toast({
        title: "Accès refusé",
        description: "Action réservée aux administrateurs.",
        variant: "destructive",
      });
      setIsEmailDialogOpen(false);
      return;
    }

    if (areQuickActionsDisabled) {
      toast({
        title: "Compte désactivé",
        description: "Les actions rapides ne sont plus disponibles pour ce client.",
        variant: "destructive",
      });
      setIsEmailDialogOpen(false);
      return;
    }

    if (isEmailSending) {
      return;
    }

    const emailAddress = (client.email || "").trim();
    const messageContent = emailMessage.trim();
    const subjectContent = emailSubject.trim() || defaultEmailSubject;
    const nextErrors: typeof emailFormErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailAddress) {
      nextErrors.email = "Adresse email manquante.";
    } else if (!emailPattern.test(emailAddress)) {
      nextErrors.email = "Adresse email invalide.";
    }

    if (!messageContent) {
      nextErrors.message = "Le message ne peut pas être vide.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setEmailFormErrors(nextErrors);
      toast({
        title: "Envoi impossible",
        description: nextErrors.email ?? nextErrors.message,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsEmailSending(true);
      await sendEmailToCustomer({
        customerId: client.id,
        to: emailAddress,
        subject: subjectContent,
        message: messageContent,
        adminId: currentUser.id,
      });
      toast({
        title: "Email envoyé",
        description: `Email envoyé avec succès à ${emailAddress}.`,
      });
      setEmailFormErrors({});
      setIsEmailDialogOpen(false);
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
    if (!isPrivilegedUser || !currentUser) {
      toast({
        title: "Accès refusé",
        description: "Action réservée aux administrateurs.",
        variant: "destructive",
      });
      return;
    }

    if (areQuickActionsDisabled) {
      toast({
        title: "Compte désactivé",
        description: "Les actions rapides ne sont plus disponibles pour ce client.",
        variant: "destructive",
      });
      return;
    }

    if (isCalling) {
      return;
    }

    const phoneNumber = (client.phone || "").trim();
    if (!phoneNumber) {
      toast({
        title: "Appel impossible",
        description: "Numéro de téléphone manquant.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCalling(true);
      await callCustomer({
        customerId: client.id,
        phoneNumber,
        adminId: currentUser.id,
      });
      toast({
        title: "Appel lancé",
        description: `Appel en cours vers ${phoneNumber}.`,
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
    if (!isPrivilegedUser || !currentUser) {
      toast({
        title: "Accès refusé",
        description: "Action réservée aux administrateurs.",
        variant: "destructive",
      });
      setIsDisableDialogOpen(false);
      return;
    }

    if (areQuickActionsDisabled) {
      setIsDisableDialogOpen(false);
      return;
    }

    try {
      setIsDisabling(true);
      await disableCustomerAccount({
        customerId: client.id,
        adminId: currentUser.id,
      });
      setClient((previous) => ({ ...previous, status: "Désactivé" }));
      setIsOrderDialogOpen(false);
      setIsEmailDialogOpen(false);
      toast({
        title: "Compte désactivé",
        description: "Le compte a été désactivé avec succès.",
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

  const recentOrders = [
    { id: "010", date: "2025-01-15", status: "En cours", amount: 45.5 },
    { id: "1002", date: "2025-01-14", status: "Livré", amount: 38 },
    { id: "1004", date: "2025-01-12", status: "Livré", amount: 52 },
    { id: "1005", date: "2025-01-10", status: "Livré", amount: 41 },
  ];

  const invoices = [
    {
      id: "FACT-025",
      period: "Janvier 2025",
      amount: 512.5,
      status: "Payée",
      dueDate: "2025-01-31",
    },
    {
      id: "FACT-024",
      period: "Décembre 2024",
      amount: 487.0,
      status: "Payée",
      dueDate: "2024-12-31",
    },
    {
      id: "FACT-023",
      period: "Novembre 2024",
      amount: 445.0,
      status: "Payée",
      dueDate: "2024-11-30",
    },
  ];

  const spendingData = [
    { month: "Juil", amount: 380 },
    { month: "Aoû", amount: 420 },
    { month: "Sep", amount: 395 },
    { month: "Oct", amount: 445 },
    { month: "Nov", amount: 487 },
    { month: "Déc", amount: 512 },
  ];

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

  if (!isPrivilegedUser) {
    return (
      <DashboardLayout
        sidebar={<AdminSidebar />}
        topbar={<Topbar title="Accès restreint" />}
      >
        <div className="flex h-full items-center justify-center">
          <Card className="max-w-lg border-none shadow-soft">
            <CardHeader>
              <CardTitle>Section réservée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>Cette page est réservée aux équipes Admin et Support.</p>
              <p>Veuillez contacter un administrateur pour obtenir l'accès.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

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
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
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
                    {recentOrders.map((order) => (
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
                    ))}
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
                    {invoices.map((invoice) => (
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
                    ))}
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
              <CardContent className="space-y-3">
                {areQuickActionsDisabled ? (
                  <Alert variant="destructive" className="bg-destructive/10">
                    <AlertTitle>Compte désactivé</AlertTitle>
                    <AlertDescription>
                      Les actions rapides sont désactivées pour ce client.
                    </AlertDescription>
                  </Alert>
                ) : null}
                <Button
                  variant="cta"
                  className="w-full gap-2 text-base"
                  onClick={() => {
                    if (areQuickActionsDisabled) return;
                    setIsOrderDialogOpen(true);
                  }}
                  disabled={areQuickActionsDisabled}
                >
                  <span aria-hidden="true">🟡</span>
                  <span>Créer une commande</span>
                </Button>
                <Button
                  variant="secondary"
                  className="w-full gap-2 text-base"
                  onClick={() => handleEmailDialogChange(true)}
                  disabled={areQuickActionsDisabled || isEmailSending}
                >
                  <span aria-hidden="true">📧</span>
                  <span>{isEmailSending ? "Envoi en cours..." : "Envoyer un email"}</span>
                </Button>
                <Button
                  variant="secondary"
                  className="w-full gap-2 text-base"
                  onClick={handleCallCustomer}
                  disabled={areQuickActionsDisabled || isCalling}
                >
                  <span aria-hidden="true">📞</span>
                  <span>{isCalling ? "Appel en cours..." : "Appeler le client"}</span>
                </Button>
                <Button
                  variant="destructive"
                  className="w-full gap-2 text-base"
                  onClick={() => setIsDisableDialogOpen(true)}
                  disabled={areQuickActionsDisabled}
                >
                  <span aria-hidden="true">🔴</span>
                  <span>Désactiver le compte</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>

      <CreateOrderForClientDialog
        client={clientRecord}
        open={isOrderDialogOpen && !areQuickActionsDisabled}
        onOpenChange={handleOrderDialogChange}
        onOrderCreated={handleOrderCreated}
      />

      <Dialog open={isEmailDialogOpen} onOpenChange={handleEmailDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer un email</DialogTitle>
            <DialogDescription>
              Le message sera envoyé à {client.contact} ({client.email}).
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEmailSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email-to">Destinataire</Label>
              <Input
                id="email-to"
                value={client.email}
                disabled
                className={emailFormErrors.email ? "border-destructive" : undefined}
              />
              {emailFormErrors.email ? (
                <p className="text-sm text-destructive">{emailFormErrors.email}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-subject">Objet</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(event) => setEmailSubject(event.target.value)}
                placeholder={defaultEmailSubject}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                value={emailMessage}
                onChange={(event) => setEmailMessage(event.target.value)}
                placeholder="Écrivez votre message..."
                rows={6}
                className={emailFormErrors.message ? "border-destructive" : undefined}
              />
              {emailFormErrors.message ? (
                <p className="text-sm text-destructive">{emailFormErrors.message}</p>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isEmailSending}>
                {isEmailSending ? "Envoi en cours..." : "Envoyer l'email"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDisableDialogOpen}
        onOpenChange={setIsDisableDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Désactiver définitivement ce compte</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                ⚠️ Attention : cette action est irréversible. Le compte client
                sera désactivé définitivement et ne pourra plus jamais être
                réactivé.
              </p>
              <p>
                Une fois confirmé, le client ne pourra plus se connecter ni créer
                de nouvelles commandes.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <Label htmlFor="confirm-disable" className="flex items-start gap-3 text-sm">
              <Checkbox
                id="confirm-disable"
                checked={hasAcknowledgedDisable}
                onCheckedChange={(checked) =>
                  setHasAcknowledgedDisable(checked === true)
                }
              />
              <span>
                Je confirme avoir vérifié la demande et je comprends qu'aucune
                réactivation ne sera possible après cette action.
              </span>
            </Label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDisabling}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableAccount}
              disabled={isDisabling || !hasAcknowledgedDisable}
            >
              {isDisabling ? "Désactivation..." : "Oui, désactiver définitivement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminClientProfile;
