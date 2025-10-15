import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useMessagesStore } from "@/hooks/useMessagesStore";
import type { Conversation, ConversationContextType, Participant } from "@/hooks/useMessagesStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { createThread, listRecentDriversForClient } from "@/services/messages.service";

const contextOptions: { label: string; value: ConversationContextType }[] = [
  { label: "Support", value: "SUPPORT" },
  { label: "Suivi commande", value: "ORDER" },
  { label: "Facturation", value: "BILLING" },
  { label: "Incident", value: "INCIDENT" },
];

const composerSchema = z
  .object({
    recipientId: z
      .string({ required_error: "Sélectionnez un destinataire" })
      .min(1, "Sélectionnez un destinataire"),
    contextType: z.enum(["SUPPORT", "ORDER", "BILLING", "INCIDENT"] as const),
    contextReference: z.string().optional(),
    subject: z.string({ required_error: "L'objet est obligatoire" }).min(1, "L'objet est obligatoire"),
    message: z.string({ required_error: "Le message est obligatoire" }).min(1, "Le message est obligatoire"),
  })
  .superRefine((data, ctx) => {
    if ((data.contextType === "ORDER" || data.contextType === "INCIDENT") && !data.contextReference?.trim()) {
      ctx.addIssue({
        path: ["contextReference"],
        code: z.ZodIssueCode.custom,
        message: "Ajoutez une référence pour ce contexte",
      });
    }
  });

type ComposerSchema = z.infer<typeof composerSchema>;

interface MessageComposerFullScreenProps {
  open: boolean;
  actorId: string;
  onClose: () => void;
  onCreated: (conversation: Conversation) => void;
}

const MessageComposerFullScreen = ({ open, actorId, onClose, onCreated }: MessageComposerFullScreenProps) => {
  const isMobile = useIsMobile();
  const { participants } = useMessagesStore();
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<Participant[]>([]);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const adminRecipients = useMemo(
    () => participants.filter((participant) => participant.role === "ADMIN"),
    [participants],
  );

  const recipientOptions = useMemo(() => {
    return [...adminRecipients, ...drivers];
  }, [adminRecipients, drivers]);

  const form = useForm<ComposerSchema>({
    resolver: zodResolver(composerSchema),
    defaultValues: {
      recipientId: "",
      contextType: "SUPPORT",
      contextReference: "",
      subject: "",
      message: "",
    },
  });

  const contextType = form.watch("contextType");

  useEffect(() => {
    if (!open) {
      return;
    }

    let mounted = true;

    const fetchDrivers = async () => {
      setIsLoadingDrivers(true);
      try {
        const result = await listRecentDriversForClient(actorId);
        if (!mounted) {
          return;
        }
        setDrivers(result);
        if (adminRecipients[0]) {
          form.setValue("recipientId", adminRecipients[0].id, { shouldDirty: false });
        } else if (result[0]) {
          form.setValue("recipientId", result[0].id, { shouldDirty: false });
        }
      } catch (error) {
        if (mounted) {
          toast({
            variant: "destructive",
            title: "Chargement impossible",
            description: "Les destinataires n'ont pas pu être chargés.",
          });
        }
      } finally {
        if (mounted) {
          setIsLoadingDrivers(false);
        }
      }
    };

    fetchDrivers();

    return () => {
      mounted = false;
    };
  }, [open, actorId, adminRecipients, form, toast, listRecentDriversForClient]);

  useEffect(() => {
    if (!open) {
      form.reset({
        recipientId: "",
        contextType: "SUPPORT",
        contextReference: "",
        subject: "",
        message: "",
      });
      setSubmitError(null);
      return;
    }

    if (!form.getValues("recipientId")) {
      if (adminRecipients[0]) {
        form.setValue("recipientId", adminRecipients[0].id, { shouldDirty: false });
      } else if (drivers[0]) {
        form.setValue("recipientId", drivers[0].id, { shouldDirty: false });
      }
    }
  }, [open, adminRecipients, drivers, form]);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    onClose();
  };

  const handleSubmit = async (values: ComposerSchema) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const conversation = await createThread({
        fromId: actorId,
        toId: values.recipientId,
        context: {
          type: values.contextType,
          referenceId: values.contextReference?.trim() || undefined,
        },
        subject: values.subject,
        firstMessage: values.message,
      });

      toast({
        title: "Conversation créée", 
        description: "Votre nouveau thread est prêt.",
      });

      form.reset({
        recipientId: adminRecipients[0]?.id ?? "",
        contextType: "SUPPORT",
        contextReference: "",
        subject: "",
        message: "",
      });

      onCreated(conversation);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de créer la conversation.";
      setSubmitError(message);
      toast({
        variant: "destructive",
        title: "Erreur lors de la création",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h2 className="text-xl font-semibold">Nouvelle conversation</h2>
        <p className="text-sm text-muted-foreground">
          Renseignez les informations pour démarrer un échange avec le support ou un chauffeur.
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-6 px-6 py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="recipientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destinataire *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingDrivers || isSubmitting}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un destinataire" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {recipientOptions.map((recipient) => (
                          <SelectItem key={recipient.id} value={recipient.id}>
                            <div className="flex flex-col text-left">
                              <span className="font-medium">{recipient.displayName}</span>
                              <span className="text-xs text-muted-foreground">
                                {recipient.role === "ADMIN" && "Support One Connexion"}
                                {recipient.role === "DRIVER" && "Chauffeur assigné"}
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

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="contextType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contexte *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir un contexte" />
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
                      <FormLabel>Référence</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            contextType === "INCIDENT"
                              ? "INC-001"
                              : contextType === "ORDER"
                                ? "CMD-001"
                                : "Référence (optionnel)"
                          }
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objet *</FormLabel>
                    <FormControl>
                      <Input placeholder="Objet de votre demande" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message *</FormLabel>
                    <FormControl>
                      <Textarea rows={8} placeholder="Décrivez votre demande" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitError && <p className="text-sm text-destructive">{submitError}</p>}

              <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Création..." : "Créer la conversation"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </ScrollArea>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(value) => (value ? undefined : handleClose())}>
        <DrawerContent className="h-[96vh] max-h-[96vh] overflow-hidden">
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? undefined : handleClose())}>
      <DialogContent className="max-w-4xl overflow-hidden p-0">
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default MessageComposerFullScreen;
