import { useEffect, useId, useMemo, useState } from "react";
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

const CONTEXT_OPTION_LABELS: Record<ConversationContextType, string> = {
  SUPPORT: "Support",
  ORDER: "Suivi de commande",
  BILLING: "Facturation",
  INCIDENT: "Incident",
};

const ADMIN_CONTEXT_TYPES: ConversationContextType[] = ["SUPPORT", "ORDER", "BILLING", "INCIDENT"];
const DRIVER_CONTEXT_TYPES: ConversationContextType[] = ["ORDER", "INCIDENT"];

const composerSchema = z
  .object({
    recipientId: z
      .string({ required_error: "Sélectionnez un destinataire" })
      .min(1, "Sélectionnez un destinataire"),
    contextType: z.enum(["SUPPORT", "ORDER", "BILLING", "INCIDENT"] as const),
    contextReference: z.string().optional(),
    subject: z
      .string({ required_error: "L'objet est obligatoire" })
      .trim()
      .min(1, "L'objet est obligatoire"),
    message: z
      .string({ required_error: "Le message est obligatoire" })
      .trim()
      .min(1, "Le message est obligatoire"),
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

  const actor = useMemo(() => participants.find((participant) => participant.id === actorId) ?? null, [participants, actorId]);
  const actorOrders = actor?.metadata?.orders ?? [];
  const actorIncidents = actor?.metadata?.incidents ?? [];
  const activeOrderId = actor?.metadata?.activeOrderId ?? actorOrders[0] ?? null;

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

  const referenceSuggestionsId = useId();
  const referenceSuggestionsListId = useMemo(
    () => `reference-suggestions-${referenceSuggestionsId.replace(/:/g, "")}`,
    [referenceSuggestionsId],
  );
  const recipientId = form.watch("recipientId");
  const contextType = form.watch("contextType");
  const { dirtyFields } = form.formState;

  const selectedRecipient = useMemo(
    () => recipientOptions.find((recipient) => recipient.id === recipientId) ?? null,
    [recipientOptions, recipientId],
  );

  const allowedContextTypes = selectedRecipient?.role === "DRIVER" ? DRIVER_CONTEXT_TYPES : ADMIN_CONTEXT_TYPES;
  const isReferenceRequired = contextType === "ORDER" || contextType === "INCIDENT";

  const referenceSuggestions = useMemo(() => {
    if (contextType === "ORDER") {
      return Array.from(new Set(actorOrders));
    }

    if (contextType === "INCIDENT") {
      return Array.from(new Set(actorIncidents));
    }

    return [];
  }, [contextType, actorOrders, actorIncidents]);

  useEffect(() => {
    if (!open) {
      setDrivers([]);
      form.reset({
        recipientId: "",
        contextType: "SUPPORT",
        contextReference: "",
        subject: "",
        message: "",
      });
      setSubmitError(null);
      setIsSubmitting(false);
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
  }, [open, actorId, form, toast]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const recipientDirty = dirtyFields.recipientId;
    const currentRecipientId = form.getValues("recipientId");

    if (recipientDirty && currentRecipientId) {
      return;
    }

    const driverForActiveOrder = activeOrderId
      ? drivers.find((driver) => driver.metadata?.orders?.includes(activeOrderId))
      : undefined;

    const defaultRecipient = driverForActiveOrder ?? adminRecipients[0] ?? drivers[0] ?? null;

    if (defaultRecipient && currentRecipientId !== defaultRecipient.id) {
      form.setValue("recipientId", defaultRecipient.id, { shouldDirty: false });
    }

    const currentContextType = form.getValues("contextType");

    if (!dirtyFields.contextType) {
      if (defaultRecipient?.role === "DRIVER") {
        if (currentContextType !== "ORDER") {
          form.setValue("contextType", "ORDER", { shouldDirty: false });
        }
      } else if (currentContextType !== "SUPPORT") {
        form.setValue("contextType", "SUPPORT", { shouldDirty: false });
      }
    }

    const updatedContextType = defaultRecipient?.role === "DRIVER" ? "ORDER" : form.getValues("contextType");

    if (!dirtyFields.contextReference) {
      if (defaultRecipient?.role === "DRIVER" && updatedContextType === "ORDER") {
        const driverOrders = defaultRecipient.metadata?.orders ?? [];
        const defaultReference =
          (activeOrderId && driverOrders.includes(activeOrderId) && activeOrderId) || driverOrders[0] || "";
        form.setValue("contextReference", defaultReference, { shouldDirty: false });
      } else if (updatedContextType === "SUPPORT") {
        form.setValue("contextReference", "", { shouldDirty: false });
      }
    }
  }, [
    open,
    drivers,
    adminRecipients,
    dirtyFields.recipientId,
    dirtyFields.contextType,
    dirtyFields.contextReference,
    form,
    activeOrderId,
  ]);

  useEffect(() => {
    if (!open || !selectedRecipient) {
      return;
    }

    if (!allowedContextTypes.includes(contextType)) {
      form.setValue("contextType", allowedContextTypes[0], { shouldDirty: false });
    }

    if (selectedRecipient.role === "ADMIN" && !dirtyFields.contextType) {
      form.setValue("contextType", "SUPPORT", { shouldDirty: false });
    }

    if (selectedRecipient.role === "DRIVER" && contextType === "ORDER" && !dirtyFields.contextReference) {
      const driverOrder = selectedRecipient.metadata?.orders ?? [];
      const preferredOrder =
        activeOrderId && driverOrder.includes(activeOrderId) ? activeOrderId : driverOrder[0] ?? "";
      if (preferredOrder) {
        form.setValue("contextReference", preferredOrder, { shouldDirty: false });
      }
    }

    if (selectedRecipient.role !== "DRIVER" && !dirtyFields.contextReference && contextType === "SUPPORT") {
      form.setValue("contextReference", "", { shouldDirty: false });
    }
  }, [
    open,
    selectedRecipient,
    allowedContextTypes,
    contextType,
    dirtyFields.contextReference,
    dirtyFields.contextType,
    form,
    activeOrderId,
  ]);

  useEffect(() => {
    if (!open || dirtyFields.contextReference) {
      return;
    }

    if (contextType === "ORDER") {
      const preferredOrder =
        (selectedRecipient?.role === "DRIVER" && selectedRecipient.metadata?.orders?.find((order) => order === activeOrderId)) ||
        activeOrderId ||
        actorOrders[0] ||
        "";
      form.setValue("contextReference", preferredOrder ?? "", { shouldDirty: false });
      return;
    }

    if (contextType === "INCIDENT") {
      const incidentRef = actorIncidents[0] ?? "";
      form.setValue("contextReference", incidentRef, { shouldDirty: false });
      return;
    }

    form.setValue("contextReference", "", { shouldDirty: false });
  }, [open, contextType, dirtyFields.contextReference, form, selectedRecipient, activeOrderId, actorOrders, actorIncidents]);

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
      const recipient = recipientOptions.find((option) => option.id === values.recipientId);
      if (!recipient) {
        throw new Error("Le destinataire sélectionné est introuvable");
      }

      const conversation = await createThread({
        fromId: actorId,
        toId: values.recipientId,
        toType: recipient.role,
        context: {
          type: values.contextType,
          referenceId: values.contextReference?.trim() || undefined,
        },
        subject: values.subject.trim(),
        firstMessage: values.message.trim(),
      });

      toast({
        title: "Conversation créée",
        description: "Votre nouveau thread est prêt.",
      });

      form.reset({
        recipientId: "",
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

  const referencePlaceholder = useMemo(() => {
    if (contextType === "ORDER") {
      return "CMD-001";
    }

    if (contextType === "INCIDENT") {
      return "INC-001";
    }

    return "Référence (optionnel)";
  }, [contextType]);

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
                                {recipient.role === "ADMIN" && "Support One Connexion (ADMIN)"}
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
                          {allowedContextTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {CONTEXT_OPTION_LABELS[type]}
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
                      <FormLabel>
                        Référence
                        {isReferenceRequired ? " *" : ""}
                      </FormLabel>
                      <FormControl>
                        <>
                          <Input
                            placeholder={referencePlaceholder}
                            {...field}
                            value={field.value ?? ""}
                            disabled={isSubmitting}
                            list={referenceSuggestions.length > 0 ? referenceSuggestionsListId : undefined}
                          />
                          {referenceSuggestions.length > 0 && (
                            <datalist id={referenceSuggestionsListId}>
                              {referenceSuggestions.map((suggestion) => (
                                <option key={suggestion} value={suggestion} />
                              ))}
                            </datalist>
                          )}
                        </>
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
