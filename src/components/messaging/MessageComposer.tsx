import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMessagesStore } from "@/hooks/useMessagesStore";
import type { Conversation, ConversationContextType, Participant, UserRole } from "@/hooks/useMessagesStore";

const contextOptions: { label: string; value: ConversationContextType }[] = [
  { label: "Support", value: "SUPPORT" },
  { label: "Commande", value: "ORDER" },
  { label: "Incident", value: "INCIDENT" },
];

const composerSchema = z
  .object({
    recipientId: z.string({ required_error: "Sélectionnez un destinataire" }).min(1, "Sélectionnez un destinataire"),
    subject: z.string({ required_error: "L'objet est obligatoire" }).min(1, "L'objet est obligatoire"),
    content: z.string({ required_error: "Le message est obligatoire" }).min(1, "Le message est obligatoire"),
    contextType: z.enum(["SUPPORT", "ORDER", "INCIDENT"] as const),
    contextReference: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if ((data.contextType === "ORDER" || data.contextType === "INCIDENT") && !data.contextReference?.trim()) {
      ctx.addIssue({
        path: ["contextReference"],
        code: z.ZodIssueCode.custom,
        message: "Ajoutez une référence pour la commande ou l'incident",
      });
    }
  });

type ComposerSchema = z.infer<typeof composerSchema>;

interface MessageComposerProps {
  actorId: string;
  actorRole: UserRole;
  conversation?: Conversation | null;
  recipients: Participant[];
  onMessageSent?: (conversationId: string) => void;
}

const resolveDefaultSubject = (conversation?: Conversation | null) => {
  if (!conversation || conversation.messages.length === 0) {
    return "";
  }

  return conversation.messages[conversation.messages.length - 1]?.subject ?? "";
};

const MessageComposer = ({ actorId, actorRole, conversation, recipients, onMessageSent }: MessageComposerProps) => {
  const { sendMessage } = useMessagesStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otherParticipantId = useMemo(() => {
    if (!conversation) {
      return "";
    }

    return conversation.participants.find((participantId) => participantId !== actorId) ?? "";
  }, [conversation, actorId]);

  const form = useForm<ComposerSchema>({
    resolver: zodResolver(composerSchema),
    defaultValues: {
      recipientId: otherParticipantId || recipients[0]?.id || "",
      subject: resolveDefaultSubject(conversation),
      content: "",
      contextType: conversation?.context.type ?? "SUPPORT",
      contextReference: conversation?.context.reference ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      recipientId: otherParticipantId || recipients[0]?.id || "",
      subject: resolveDefaultSubject(conversation),
      content: "",
      contextType: conversation?.context.type ?? "SUPPORT",
      contextReference: conversation?.context.reference ?? "",
    });
  }, [conversation, otherParticipantId, recipients, form]);

  const recipientId = form.watch("recipientId");

  const selectedRecipient = useMemo(
    () => recipients.find((recipient) => recipient.id === recipientId) ?? null,
    [recipientId, recipients],
  );

  const handleSubmit = async (values: ComposerSchema) => {
    setIsSubmitting(true);
    try {
      const targetContextType = conversation ? conversation.context.type : values.contextType;
      const targetContextReference = conversation ? conversation.context.reference : values.contextReference;

      const updatedConversation = await sendMessage({
        conversationId: conversation?.id,
        subject: values.subject,
        content: values.content,
        fromId: actorId,
        toId: values.recipientId,
        contextType: targetContextType,
        contextReference: targetContextReference,
      });

      form.reset({
        recipientId: conversation ? values.recipientId : values.recipientId,
        subject: conversation ? values.subject : "",
        content: "",
        contextType: updatedConversation.context.type,
        contextReference: updatedConversation.context.reference ?? "",
      });

      onMessageSent?.(updatedConversation.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showContextFields = !conversation;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold">Composer un message</h3>
            <p className="text-sm text-muted-foreground">
              {actorRole === "ADMIN"
                ? "Contactez un client ou un chauffeur avec un objet clair."
                : "Échangez avec l'équipe support ou votre chauffeur."}
            </p>
          </div>
          {selectedRecipient && (
            <Badge variant="secondary">{selectedRecipient.role}</Badge>
          )}
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="recipientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destinataire *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={Boolean(conversation)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un destinataire" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {recipients.map((recipient) => (
                      <SelectItem key={recipient.id} value={recipient.id}>
                        <div className="flex flex-col text-left">
                          <span className="font-medium">{recipient.displayName}</span>
                          <span className="text-xs text-muted-foreground">
                            {recipient.role === "ADMIN" && "Administrateur"}
                            {recipient.role === "CLIENT" && "Client"}
                            {recipient.role === "DRIVER" && "Chauffeur"}
                            {recipient.metadata?.orders?.length
                              ? ` • Commandes ${recipient.metadata.orders.join(", ")}`
                              : ""}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {showContextFields && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="contextType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contexte *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le contexte" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contextOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contextReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Référence (commande ou incident)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: CMD-010" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objet *</FormLabel>
                <FormControl>
                  <Input placeholder="Objet du message" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message *</FormLabel>
                <FormControl>
                  <Textarea rows={6} placeholder="Votre message" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MessageComposer;
