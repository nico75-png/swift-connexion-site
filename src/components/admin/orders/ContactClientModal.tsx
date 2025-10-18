import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface ContactClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: {
    name: string;
    email?: string | null;
    phone?: string | null;
    formattedPhone?: string;
  } | null;
  onSendEmail: (payload: { subject: string; message: string }) => Promise<void>;
  onCallClient: () => void | Promise<void>;
}

const ContactClientModal = ({
  open,
  onOpenChange,
  contact,
  onSendEmail,
  onCallClient,
}: ContactClientModalProps) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const email = contact?.email ?? "";
  const phone = contact?.phone ?? "";
  const formattedPhone = contact?.formattedPhone ?? phone;
  const hasEmail = Boolean(email);
  const hasPhone = Boolean(phone);
  const noContact = !hasEmail && !hasPhone;

  const initialTab = hasEmail ? "email" : "phone";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    if (!open) {
      setSubject("");
      setMessage("");
      setIsSending(false);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  const handleEmailSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setError("Complétez l'objet et le message.");
      return;
    }

    setIsSending(true);
    setError(null);
    try {
      await onSendEmail({ subject: subject.trim(), message: message.trim() });
      onOpenChange(false);
    } catch (caught) {
      const messageError = caught instanceof Error ? caught.message : "Impossible d'envoyer l'email.";
      setError(messageError);
    } finally {
      setIsSending(false);
    }
  };

  const handleCall = () => {
    Promise.resolve(onCallClient()).finally(() => onOpenChange(false));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Contacter le client</DialogTitle>
          <DialogDescription>
            Choisissez un canal pour joindre {contact?.name ?? "le client"}.
          </DialogDescription>
        </DialogHeader>

        {noContact ? (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
            ⚠️ Aucun contact client disponible.
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="email" disabled={!hasEmail}>
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" disabled={!hasPhone}>
                Téléphone
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="contact-email-subject">Objet</Label>
                <Input
                  id="contact-email-subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Objet du message"
                  disabled={!hasEmail || isSending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact-email-message">Message</Label>
                <Textarea
                  id="contact-email-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={5}
                  placeholder="Bonjour..."
                  disabled={!hasEmail || isSending}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Destinataire</span>
                <span>{email}</span>
              </div>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4">
              <div className="space-y-1 text-sm">
                <p className="font-medium">Numéro de téléphone</p>
                <p>{formattedPhone || "—"}</p>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter className="gap-2 sm:gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          {hasEmail && !noContact && activeTab === "email" && (
            <Button onClick={handleEmailSubmit} disabled={isSending || !subject.trim() || !message.trim()}>
              {isSending ? "Envoi..." : "Envoyer"}
            </Button>
          )}
          {hasPhone && !noContact && activeTab === "phone" && (
            <Button asChild variant="secondary" onClick={handleCall}>
              <a href={`tel:${phone}`}>Appeler</a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactClientModal;
