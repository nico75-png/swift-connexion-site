import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CreditCard, Download, Euro, MoveLeft, Shield, Wallet } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/stores/auth.store";
import { getNotifications } from "@/lib/stores/driversOrders.store";
import type { NotificationEntry } from "@/lib/stores/driversOrders.store";
import { getClientInvoiceById, type ClientInvoiceSnapshot } from "@/lib/stores/data/clientInvoices";

const formatCurrency = (value: number) => new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
}).format(value);

const ClientInvoicePayment = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const params = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useMemo<NotificationEntry[]>(() => getNotifications(), []);

  const formattedNotifications = useMemo(
    () =>
      notifications.map((notif) => ({
        id: notif.id,
        message: notif.message,
        time: new Intl.DateTimeFormat("fr-FR", {
          day: "2-digit",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(notif.createdAt)),
        read: notif.read,
      })),
    [notifications],
  );

  const invoice = useMemo(() => {
    const fromState = (location.state as { invoice?: ClientInvoiceSnapshot } | null)?.invoice;
    if (fromState) {
      return fromState;
    }
    if (params.invoiceId) {
      return getClientInvoiceById(params.invoiceId);
    }
    return undefined;
  }, [location.state, params.invoiceId]);

  const handlePayByCard = () => {
    if (!invoice || typeof window === "undefined") return;
    const url = `https://paiement.one-connexion.test/card?invoice=${invoice.id}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadRib = () => {
    if (typeof window === "undefined") return;
    const ribContent = [
      "One Connexion",
      "IBAN : FR76 3000 4005 5000 0100 6754 321",
      "BIC : BNPAFRPP",
      "Banque : BNP Paribas",
    ].join("\n");
    const blob = new Blob([ribContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rib-one-connexion.txt";
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: "RIB téléchargé",
      description: "Les coordonnées bancaires ont été téléchargées.",
    });
  };

  const handleCopyReference = () => {
    if (!invoice) return;
    if (!navigator?.clipboard) {
      toast({
        variant: "destructive",
        title: "Copie impossible",
        description: "La référence n'a pas pu être copiée sur cet appareil.",
      });
      return;
    }
    navigator.clipboard
      .writeText(invoice.id)
      .then(() => {
        toast({
          title: "Référence copiée",
          description: "La référence de la facture est copiée dans le presse-papiers.",
        });
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Copie impossible",
          description: "La référence n'a pas pu être copiée.",
        });
      });
  };

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={<Topbar userName={currentUser?.name ?? undefined} notifications={formattedNotifications} />}
      showProfileReminder
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button variant="ghost" className="mb-2 pl-0" onClick={() => navigate(-1)}>
              <MoveLeft className="mr-2 h-4 w-4" /> Retour aux factures
            </Button>
            <h1 className="text-3xl font-bold">Modalités de paiement</h1>
            <p className="text-muted-foreground">Choisissez votre mode de règlement pour finaliser la facture.</p>
          </div>
          {invoice && (
            <Badge variant={invoice.statusColor === "success" ? "secondary" : "outline"} className="self-start">
              {invoice.status}
            </Badge>
          )}
        </div>

        {invoice ? (
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Facture {invoice.id}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Période</p>
                  <p className="font-medium">{invoice.period}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Montant TTC</p>
                  <p className="text-2xl font-semibold">{formatCurrency(invoice.amount)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Échéance</p>
                  <p className="font-medium">{invoice.dueDate}</p>
                </div>
                <Button variant="outline" onClick={handleCopyReference}>
                  <Shield className="mr-2 h-4 w-4" /> Copier la référence
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <CreditCard className="h-5 w-5" /> Paiement par carte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Réglez votre facture en quelques clics sur notre plateforme sécurisée.
                  </p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Traitement immédiat du paiement</li>
                    <li>Support des cartes Visa, Mastercard et American Express</li>
                    <li>Reçu automatique envoyé à votre adresse email</li>
                  </ul>
                  <Button variant="cta" onClick={handlePayByCard}>
                    <Euro className="mr-2 h-4 w-4" /> Régler par carte
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Wallet className="h-5 w-5" /> Paiement par virement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Utilisez vos coordonnées bancaires habituelles pour effectuer un virement en mentionnant la référence de la facture.
                  </p>
                  <div className="rounded-lg border p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bénéficiaire</span>
                      <span className="font-medium">One Connexion</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IBAN</span>
                      <span className="font-medium">FR76 3000 4005 5000 0100 6754 321</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">BIC</span>
                      <span className="font-medium">BNPAFRPP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Référence</span>
                      <span className="font-medium">{invoice.id}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={handleDownloadRib}>
                      <Download className="mr-2 h-4 w-4" /> Télécharger le RIB
                    </Button>
                    <Button variant="ghost" onClick={handleCopyReference}>
                      <Shield className="mr-2 h-4 w-4" /> Copier la référence
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              <p>La facture demandée est introuvable.</p>
              <Button className="mt-4" variant="cta" onClick={() => navigate("/espace-client/factures")}>Retour aux factures</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientInvoicePayment;
