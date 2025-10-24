import { useMemo } from "react";
import { Image, LifeBuoy, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Conversation, Participant } from "@/hooks/useMessagesStore";
import { cn } from "@/lib/utils";

interface ConversationInfoPanelProps {
  participant: Participant | null;
  conversation: Conversation | null;
  className?: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  CLIENT: "Client",
  DRIVER: "Chauffeur",
};

const PlaceholderValue = ({ label }: { label: string }) => (
  <span className="text-sm text-muted-foreground/80">{label}</span>
);

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value?: string | null;
}) => (
  <div className="flex items-start gap-3">
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {value ? <p className="truncate text-sm font-medium text-foreground">{value}</p> : <PlaceholderValue label="Non renseigné" />}
    </div>
  </div>
);

const ConversationInfoPanel = ({ participant, conversation, className }: ConversationInfoPanelProps) => {
  const mediaItems = useMemo(() => {
    if (!conversation) {
      return Array.from({ length: 6 }).map((_, index) => ({ id: `media-placeholder-${index}` }));
    }

    return conversation.messages.slice(0, 9).map((message, index) => ({
      id: `${message.id}-${index}`,
      label: message.subject,
    }));
  }, [conversation]);

  const mediaCount = mediaItems.length;
  const locationValue = useMemo(() => {
    if (!participant?.metadata) {
      return null;
    }

    if (participant.metadata.activeOrderId) {
      return `Commande ${participant.metadata.activeOrderId}`;
    }

    if (participant.metadata.orders?.length) {
      return `Commandes ${participant.metadata.orders.join(", ")}`;
    }

    if (participant.metadata.incidents?.length) {
      return `Incidents ${participant.metadata.incidents.join(", ")}`;
    }

    return null;
  }, [participant]);

  return (
    <aside
      className={cn(
        "hidden border-l bg-card/95 shadow-soft xl:flex xl:h-full xl:min-w-[320px] xl:flex-col",
        className,
      )}
      role="region"
      aria-label="Informations de la conversation"
    >
      <Card className="border-0 rounded-none">
        <div className="flex flex-col gap-6 px-6 py-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarFallback>
                  {participant?.avatarFallback ?? (conversation ? conversation.id.slice(0, 2).toUpperCase() : "--")}
                </AvatarFallback>
              </Avatar>
              <span
                className="absolute bottom-1 right-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-card bg-success"
                aria-hidden="true"
              />
            </div>
            <div className="mt-4 space-y-1">
              <h3 className="text-lg font-semibold leading-tight">
                {participant?.displayName ?? "Destinataire"}
              </h3>
              {participant?.role && (
                <Badge variant="outline" className="text-[11px] uppercase tracking-wide">
                  {ROLE_LABELS[participant.role] ?? participant.role}
                </Badge>
              )}
              {participant?.company && (
                <p className="text-sm text-muted-foreground">{participant.company}</p>
              )}
            </div>
            <Button variant="outline" className="mt-4">Voir le profil</Button>
          </div>

          <div className="space-y-4">
            <InfoRow icon={MapPin} label="Localisation" value={locationValue} />
            <InfoRow icon={Phone} label="Téléphone" value={participant?.phone} />
            <InfoRow icon={Mail} label="Email" value={participant?.email} />
          </div>

          <Separator />

          <details className="group space-y-3 rounded-lg border border-dashed border-border/70 bg-muted/40 px-4 py-3">
            <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Confidentialité & Support
              </span>
              <span className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Vos échanges sont sécurisés. Consultez les ressources d'aide et le support dédié en cas de besoin.
            </p>
            <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
              <LifeBuoy className="h-4 w-4" aria-hidden="true" /> Contacter le support
            </Button>
          </details>

          <details className="group space-y-3 rounded-lg border border-dashed border-border/70 bg-muted/40 px-4 py-3">
            <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold">
              <span className="inline-flex items-center gap-2">
                <Image className="h-4 w-4" aria-hidden="true" /> Média ({mediaCount})
              </span>
              <span className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="grid grid-cols-3 gap-2">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="aspect-square w-full rounded-lg bg-muted shadow-soft"
                  aria-label={item.label ? `Pièce jointe : ${item.label}` : undefined}
                />
              ))}
            </div>
          </details>
        </div>
      </Card>
    </aside>
  );
};

export default ConversationInfoPanel;
