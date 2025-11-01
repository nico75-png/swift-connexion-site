import { useCallback, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminSidebar, { AdminSectionKey } from "@/components/dashboard/AdminSidebar";
import Topbar from "@/components/dashboard/Topbar";
import TableauDeBord, { type MessageComposerPreset } from "@/components/dashboard-admin/tableau-de-bord";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { QuickOrderDialog, type QuickOrderFormValues } from "@/components/dashboard-client/QuickOrderDialog";

const notifications = [
  { id: "notif-1", message: "3 commandes express en cours", time: "Il y a 5 min", read: false },
  { id: "notif-2", message: "Nouveau message du dispatch Sud", time: "Il y a 18 min", read: false },
  { id: "notif-3", message: "Facture FAC-2025-125 en retard", time: "Il y a 32 min", read: true },
];

const DEFAULT_MESSAGE_SUBJECT = "Suivi de commande express";
const DEFAULT_MESSAGE_TEMPLATE =
  "Bonjour,\nVotre commande est en préparation et sera expédiée dans l'heure.\n— Swift Connexion";

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

const DashboardAdmin = () => {
  const { resolvedDisplayName, fallbackEmail, session } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSectionKey>("dashboard");
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [recipientType, setRecipientType] = useState<"client" | "chauffeur" | "admin">("client");
  const [messageSubject, setMessageSubject] = useState(DEFAULT_MESSAGE_SUBJECT);
  const [messageEmail, setMessageEmail] = useState("");
  const [messageContent, setMessageContent] = useState(DEFAULT_MESSAGE_TEMPLATE);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const displayName = resolvedDisplayName ?? fallbackEmail ?? "Administrateur";

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  }, []);

  const openMessageComposer = useCallback((preset?: MessageComposerPreset) => {
    setRecipientType(preset?.recipientType ?? "client");
    setMessageSubject(preset?.subject ?? DEFAULT_MESSAGE_SUBJECT);
    setMessageEmail(preset?.email ?? "");
    setMessageContent(preset?.content ?? DEFAULT_MESSAGE_TEMPLATE);
    setIsMessageDialogOpen(true);
  }, []);

  const upcomingMeetings = useMemo(
    () => [
      { id: "meet-1", title: "Point dispatch express", schedule: "15:30 · Salle Horizon" },
      { id: "meet-2", title: "Brief chauffeurs renfort", schedule: "16:15 · Visioconférence" },
    ],
    [],
  );

  const resolveRecipientIdentifier = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();

      if (recipientType === "chauffeur" && !trimmed.includes("@")) {
        return `driver:${trimmed}`;
      }

      if (!trimmed.includes("@")) {
        return `external:${trimmed}`;
      }

      const normalized = trimmed.toLowerCase();
      const { data: userRecord, error } = await supabase
        .from("app_users" as never)
        .select("user_id, metadata")
        .eq("metadata->>email", normalized)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.warn("Impossible de résoudre le destinataire", error);
      }

      if (userRecord && (userRecord as any).user_id) {
        return (userRecord as any).user_id;
      }

      return `external:${normalized}`;
    },
    [recipientType],
  );

  const renderSection = useMemo(() => {
    switch (activeSection) {
      case "dashboard":
        return (
          <TableauDeBord
            onOpenOrderForm={() => setIsOrderDialogOpen(true)}
            onOpenMessageComposer={openMessageComposer}
            onOpenIncidentReport={() => setActiveSection("suivi")}
          />
        );
      case "commandes":
        return <Commandes onCreateOrder={() => setIsOrderDialogOpen(true)} />;
      case "clients":
        return <Clients />;
      case "chauffeurs":
        return <Chauffeurs />;
      case "suivi":
        return <Suivi onCreateOrder={() => setIsOrderDialogOpen(true)} onSendMessage={() => openMessageComposer()} />;
      case "planification":
        return <Planification onDispatch={() => setActiveSection("commandes")} />;
      case "factures":
        return <Factures />;
      case "statistiques":
        return <Statistiques />;
      case "messages":
        return <Messages />;
      case "parametres":
        return <Parametres />;
      default:
        return (
          <TableauDeBord
            onOpenOrderForm={() => setIsOrderDialogOpen(true)}
            onOpenMessageComposer={openMessageComposer}
            onOpenIncidentReport={() => setActiveSection("suivi")}
          />
        );
    }
  }, [activeSection, openMessageComposer]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  const handleMessageSubmit = useCallback(async () => {
    if (isSendingMessage) {
      return;
    }

    const trimmedEmail = messageEmail.trim();
    const trimmedSubject = messageSubject.trim();
    const trimmedContent = messageContent.trim();

    if (!session?.user) {
      toast({
        title: "Session expirée",
        description: "Reconnectez-vous pour envoyer un message.",
        variant: "destructive",
      });
      return;
    }

    if (!trimmedSubject || !trimmedContent) {
      toast({
        title: "Contenu requis",
        description: "Renseignez l'objet et le message avant l'envoi.",
        variant: "destructive",
      });
      return;
    }

    if (!trimmedEmail) {
      toast({
        title: "Destinataire manquant",
        description: "Veuillez préciser un contact ou une adresse.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingMessage(true);

    try {
      const recipientIdentifier = await resolveRecipientIdentifier(trimmedEmail);
      const participants = [session.user.id, recipientIdentifier];

      const threadResponse = await supabase
        .from("message_threads")
        .select("id, participants")
        .contains("participants", participants)
        .order("last_message_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (threadResponse.error && threadResponse.error.code !== "PGRST116") {
        throw threadResponse.error;
      }

      let threadId = threadResponse.data?.id ??
        (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);

      if (!threadResponse.data) {
        const { error: threadInsertError } = await supabase.from("message_threads").insert({
          id: threadId,
          participants,
          last_message_at: new Date().toISOString(),
        });

        if (threadInsertError) {
          if (threadInsertError.code === "23505") {
            const retry = await supabase
              .from("message_threads")
              .select("id")
              .contains("participants", participants)
              .maybeSingle();
            if (retry.data?.id) {
              threadId = retry.data.id;
            } else {
              throw threadInsertError;
            }
          } else {
            throw threadInsertError;
          }
        }
      } else {
        const { error: threadUpdateError } = await supabase
          .from("message_threads")
          .update({ last_message_at: new Date().toISOString() })
          .eq("id", threadId);
        if (threadUpdateError) {
          console.warn("Impossible de mettre à jour le fil de discussion", threadUpdateError);
        }
      }

      const finalContent = `Objet : ${trimmedSubject}\n\n${trimmedContent}`;

      const { data: insertedMessage, error: messageError } = await supabase
        .from("messages")
        .insert({
          thread_id: threadId,
          sender_id: session.user.id,
          recipient_id: recipientIdentifier,
          content: finalContent,
          read: false,
        })
        .select("id")
        .single();

      if (messageError) {
        throw messageError;
      }

      toast({
        title: "Message envoyé",
        description: insertedMessage?.id
          ? `Conversation synchronisée (#${insertedMessage.id.slice(0, 8)})`
          : "Le message a été transmis via Supabase.",
      });

      setIsMessageDialogOpen(false);
      setMessageEmail("");
      setMessageSubject(DEFAULT_MESSAGE_SUBJECT);
      setMessageContent(DEFAULT_MESSAGE_TEMPLATE);
    } catch (error) {
      const message = error instanceof Error ? error.message : "L'envoi a échoué.";
      toast({
        title: "Envoi impossible",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSendingMessage(false);
    }
  }, [
    isSendingMessage,
    messageEmail,
    messageSubject,
    messageContent,
    resolveRecipientIdentifier,
    session,
  ]);

  const handleOrderSubmit = useCallback(
    (values: QuickOrderFormValues) => {
      setIsOrderDialogOpen(false);
      toast({
        title: "Commande créée",
        description: `Course ${values.packageType} programmée pour ${values.deliveryAddress || "destination à confirmer"}.`,
      });
    },
    [],
  );

  return (
    <DashboardLayout
      sidebar={
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
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
          onScheduleReview={() => setActiveSection("statistiques")}
          onSendMessage={() => openMessageComposer()}
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
              <h1 className="mt-2 font-['Inter'] text-3xl font-semibold text-slate-900">
                {SECTION_LABELS[activeSection]}
              </h1>
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
                onClick={() => openMessageComposer()}
              >
                Envoyer un message
              </Button>
            </div>
          </div>
          <ScrollArea className="max-h-[calc(100vh-220px)] rounded-[32px] border border-white/20 bg-white/80 p-6 shadow-[0_30px_90px_-40px_rgba(7,18,38,0.65)] backdrop-blur">
            <div className="space-y-8 pb-10">{renderSection}</div>
          </ScrollArea>
        </div>
      </div>

      <Dialog
        open={isMessageDialogOpen}
        onOpenChange={(open) => {
          setIsMessageDialogOpen(open);
          if (!open) {
            setIsSendingMessage(false);
            setMessageEmail("");
            setMessageSubject(DEFAULT_MESSAGE_SUBJECT);
            setMessageContent(DEFAULT_MESSAGE_TEMPLATE);
            setRecipientType("client");
          }
        }}
      >
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
            <Button
              className="rounded-2xl bg-[#0B2D55] text-white hover:bg-[#091a33]"
              onClick={handleMessageSubmit}
              disabled={isSendingMessage}
            >
              {isSendingMessage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi…
                </>
              ) : (
                "Envoyer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <QuickOrderDialog
        open={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        onSubmit={handleOrderSubmit}
        defaultValues={{ packageType: "standard", pickupAddress: "HUB Paris Nord", serviceLevel: "express" }}
      />
    </DashboardLayout>
  );
};

export default DashboardAdmin;
