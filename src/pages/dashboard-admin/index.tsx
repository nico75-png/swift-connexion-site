import { useCallback, useEffect, useMemo, useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar, { AdminSectionKey } from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import TableauDeBord from "@/components/dashboard-admin/tableau-de-bord";
import Commandes from "@/components/dashboard-admin/commandes";
import Clients from "@/components/dashboard-admin/clients";
import Chauffeurs from "@/components/dashboard-admin/chauffeurs";
import Suivi from "@/components/dashboard-admin/suivi";
import Planification from "@/components/dashboard-admin/planification";
import Factures from "@/components/dashboard-admin/factures";
import Statistiques from "@/components/dashboard-admin/statistiques";
import Messages from "@/components/dashboard-admin/messages";
import Parametres from "@/components/dashboard-admin/parametres";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useOrders } from "@/hooks/useOrders";
import AdminOrderDialog from "@/components/dashboard-admin/AdminOrderDialog";

const notifications = [
  { id: "notif-1", message: "3 commandes express en cours", time: "Il y a 5 min", read: false },
  { id: "notif-2", message: "Nouveau message du dispatch Sud", time: "Il y a 18 min", read: false },
  { id: "notif-3", message: "Facture FAC-2025-125 en retard", time: "Il y a 32 min", read: true },
];

const SECTION_LABELS: Record<AdminSectionKey, string> = {
  dashboard: "Tableau de bord",
  commandes: "Commandes",
  clients: "Clients",
  chauffeurs: "Chauffeurs",
  suivi: "Suivi",
  planification: "Planification",
  factures: "Factures",
  statistiques: "Statistiques",
  messages: "Messages",
  parametres: "Paramètres",
};

const VALID_SECTIONS = new Set<AdminSectionKey>([
  "dashboard",
  "commandes",
  "clients",
  "chauffeurs",
  "suivi",
  "planification",
  "factures",
  "statistiques",
  "messages",
  "parametres",
]);

const DashboardAdmin = () => {
  const { resolvedDisplayName, fallbackEmail, userRole } = useAuth();
  const navigate = useNavigate();
  const sectionMatch = useMatch("/dashboard-admin/:section");
  const ordersState = useOrders();

  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [recipientType, setRecipientType] = useState<"client" | "chauffeur" | "admin">("client");
  const [messageSubject, setMessageSubject] = useState("Suivi de commande express");
  const [messageEmail, setMessageEmail] = useState("");
  const [messageContent, setMessageContent] = useState(
    "Bonjour,\nVotre commande est en préparation et sera expédiée dans l'heure.\n— Swift Connexion",
  );

  const displayName = resolvedDisplayName ?? fallbackEmail ?? "Administrateur";

  useEffect(() => {
    const verifySession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session || userRole !== "admin") {
        navigate("/login", { replace: true });
      }
    };
    void verifySession();
  }, [navigate, userRole]);

  const sectionParam = sectionMatch?.params?.section ?? null;
  const activeSection: AdminSectionKey = useMemo(() => {
    if (sectionParam && VALID_SECTIONS.has(sectionParam as AdminSectionKey)) {
      return sectionParam as AdminSectionKey;
    }
    return "dashboard";
  }, [sectionParam]);

  const navigateToSection = useCallback(
    (section: AdminSectionKey) => {
      const target = section === "dashboard" ? "/dashboard-admin" : `/dashboard-admin/${section}`;
      navigate(target);
    },
    [navigate],
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  }, []);

  const upcomingMeetings = useMemo(
    () => [
      { id: "meet-1", title: "Point dispatch express", schedule: "15:30 · Salle Horizon" },
      { id: "meet-2", title: "Brief chauffeurs renfort", schedule: "16:15 · Visioconférence" },
    ],
    [],
  );

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  const handleMessageSubmit = useCallback(() => {
    toast({
      title: "Message envoyé",
      description:
        recipientType === "client"
          ? "Le client a été notifié."
          : recipientType === "chauffeur"
            ? "Le chauffeur reçoit votre consigne."
            : "Les administrateurs ont reçu votre message.",
    });
    setIsMessageDialogOpen(false);
    setMessageEmail("");
  }, [recipientType]);

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <TableauDeBord onOpenOrderForm={() => setIsOrderDialogOpen(true)} />;
      case "commandes":
        return <Commandes onCreateOrder={() => setIsOrderDialogOpen(true)} ordersState={ordersState} />;
      case "clients":
        return <Clients />;
      case "chauffeurs":
        return <Chauffeurs />;
      case "suivi":
        return <Suivi onCreateOrder={() => setIsOrderDialogOpen(true)} onSendMessage={() => setIsMessageDialogOpen(true)} />;
      case "planification":
        return <Planification onDispatch={() => navigateToSection("commandes")} />;
      case "factures":
        return <Factures />;
      case "statistiques":
        return <Statistiques />;
      case "messages":
        return <Messages />;
      case "parametres":
        return <Parametres />;
      default:
        return <TableauDeBord onOpenOrderForm={() => setIsOrderDialogOpen(true)} />;
    }
  };

  return (
    <DashboardLayout
      sidebar={
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={navigateToSection}
          unreadMessages={3}
          onLogout={handleLogout}
          adminName={displayName}
          adminRole="Gestion opérationnelle"
          upcomingMeetings={upcomingMeetings}
        />
      }
      topbar={
        <Topbar
          userName={displayName}
          title={`${greeting}, ${displayName}`}
          notifications={notifications}
          onCreateOrder={() => setIsOrderDialogOpen(true)}
          onScheduleReview={() => navigateToSection("statistiques")}
          onSendMessage={() => setIsMessageDialogOpen(true)}
          className="border-none bg-transparent px-0"
        />
      }
    >
      <div className="relative isolate min-h-full bg-gradient-to-br from-[#0B1E3D] via-[#071226] to-[#0B1E3D]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,204,0,0.12),_transparent_58%)]" />
        <div className="mx-auto max-w-[1500px] space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/95 px-6 py-5 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.65)] backdrop-blur">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0B2D55]">Espace administrateur</p>
              <h1 className="mt-2 font-['Inter'] text-3xl font-semibold text-slate-900">{SECTION_LABELS[activeSection]}</h1>
              <p className="mt-2 text-sm text-slate-600">
                Survolez l'activité opérationnelle, gérez les urgences en temps réel et maintenez la qualité de service.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3 text-right">
              <div className="rounded-3xl bg-[#0B2D55]/10 px-4 py-3 text-sm font-semibold text-[#0B2D55]">
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </div>
              <Button
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0B2D55] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#091a33]"
                onClick={() => setIsMessageDialogOpen(true)}
              >
                Envoyer un message
              </Button>
            </div>
          </div>
          <ScrollArea className="max-h-[calc(100vh-220px)] rounded-[32px] border border-white/20 bg-white/80 p-6 shadow-[0_30px_90px_-40px_rgba(7,18,38,0.65)] backdrop-blur">
            <div className="space-y-8 pb-10">{renderSection()}</div>
          </ScrollArea>
        </div>
      </div>

      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle>Envoyer un message</DialogTitle>
            <DialogDescription>
              Contactez instantanément un client, un chauffeur ou un autre administrateur sans quitter le tableau de bord.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="recipient">Destinataire</Label>
              <Select value={recipientType} onValueChange={(value: "client" | "chauffeur" | "admin") => setRecipientType(value)}>
                <SelectTrigger id="recipient" className="rounded-2xl border-slate-200">
                  <SelectValue placeholder="Sélectionner une audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="chauffeur">Chauffeur</SelectItem>
                  <SelectItem value="admin">Autre administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email ou canal</Label>
              <Input
                id="email"
                value={messageEmail}
                onChange={(event) => setMessageEmail(event.target.value)}
                placeholder={
                  recipientType === "client"
                    ? "client@entreprise.fr"
                    : recipientType === "chauffeur"
                      ? "Téléphone, ID chauffeur ou canal radio"
                      : "admin@swift.fr"
                }
                className="rounded-2xl border-slate-200"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Objet</Label>
              <Input
                id="subject"
                value={messageSubject}
                onChange={(event) => setMessageSubject(event.target.value)}
                className="rounded-2xl border-slate-200"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                value={messageContent}
                onChange={(event) => setMessageContent(event.target.value)}
                className="min-h-[160px] rounded-2xl border-slate-200"
              />
            </div>
          </div>
          <DialogFooter className="mt-4 flex items-center justify-between gap-3">
            <Button variant="outline" className="rounded-2xl border-slate-200" onClick={() => setIsMessageDialogOpen(false)}>
              Annuler
            </Button>
            <Button className="rounded-2xl bg-[#0B2D55] text-white hover:bg-[#091a33]" onClick={handleMessageSubmit}>
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AdminOrderDialog
        open={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        clients={ordersState.clients}
        drivers={ordersState.drivers}
        isSubmitting={ordersState.isCreating}
        onSubmit={ordersState.createOrder}
      />
    </DashboardLayout>
  );
};

export default DashboardAdmin;
