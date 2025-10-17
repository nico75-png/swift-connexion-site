import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMessagesStore } from "@/hooks/useMessagesStore";
import type { Order } from "@/lib/stores/driversOrders.store";
import { createThread } from "@/services/messages.service";

const ADMIN_ID = "admin-1";

interface MessageComposerModalProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const buildDefaultSubject = (orderId: string) => `Suivi commande ${orderId}`;

const buildReference = (orderId: string) => (orderId.startsWith("CMD-") ? orderId : `CMD-${orderId}`);

const MessageComposerModal = ({ order, open, onOpenChange }: MessageComposerModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { participants } = useMessagesStore();
  const [subject, setSubject] = useState(() => buildDefaultSubject(order.id));
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adminParticipant = useMemo(
    () =>
      participants.find((participant) => participant.role === "ADMIN" && participant.id === ADMIN_ID)
        ?? participants.find((participant) => participant.role === "ADMIN")
        ?? null,
    [participants],
  );

  const customerParticipant = useMemo(() => {
    const normalizedClient = order.client.trim().toLowerCase();
    return (
      participants.find((participant) => {
        if (participant.role !== "CLIENT") {
          return false;
        }
        const displayName = participant.displayName?.trim().toLowerCase();
        const company = participant.company?.trim().toLowerCase();
        return displayName === normalizedClient || company === normalizedClient;
      }) ?? null
    );
  }, [participants, order.client]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setSubject(buildDefaultSubject(order.id));
    setMessage("");
    setIsSubmitting(false);
    setError(null);
  }, [open, order.id]);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      onOpenChange(false);
    }
  };

  const handleSubmit = async () => {
    if (!adminParticipant) {
      setError("Aucun expéditeur admin disponible");
      return;
    }
    if (!customerParticipant) {
      setError("Client introuvable pour cette commande");
      return;
    }

    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedSubject) {
      setError("L'objet est obligatoire");
      return;
    }

    if (!trimmedMessage) {
      setError("Le message est obligatoire");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const conversation = await createThread({
        fromId: adminParticipant.id,
        toId: customerParticipant.id,
        toType: "CLIENT",
        context: { type: "ORDER", referenceId: buildReference(order.id) },
        subject: trimmedSubject,
        firstMessage: trimmedMessage,
      });

      toast({
        title: "Message envoyé",
        description: `Le client ${order.client} a été contacté avec succès.`,
      });

      onOpenChange(false);
      navigate(`/admin/messages?thread=${conversation.id}`);
    } catch (caught) {
      const messageText =
        caught instanceof Error ? caught.message : "Impossible d'envoyer le message pour l'instant.";
      setError(messageText);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Contacter le client</DialogTitle>
          <DialogDescription>
            Envoyez un message à <strong>{order.client}</strong> au sujet de la commande {order.id}.
          </DialogDescription>
        </DialogHeader>

        {!customerParticipant && (
          <p className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            Impossible d'identifier le client dans la messagerie. Vérifiez la fiche client avant de réessayer.
          </p>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="composer-subject">Objet</Label>
            <Input
              id="composer-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder={`Suivi commande ${order.id}`}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="composer-message">Message</Label>
            <Textarea
              id="composer-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Bonjour, ..."
              rows={6}
              disabled={isSubmitting}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !customerParticipant}
          >
            {isSubmitting ? "Envoi..." : "Envoyer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageComposerModal;
