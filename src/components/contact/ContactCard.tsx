import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ContactCardProps {
  icon: LucideIcon;
  title: string;
  detail: ReactNode;
  href?: string;
  actionLabel?: string;
  className?: string;
  ariaLabel?: string;
}

const ContactCard = ({ icon: Icon, title, detail, href, actionLabel, className, ariaLabel }: ContactCardProps) => {
  const isExternalLink = href ? href.startsWith("http") && !href.startsWith("mailto") && !href.startsWith("tel") : false;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-background/95 p-6 shadow-soft transition-smooth hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-medium",
        className,
      )}
    >
      <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex flex-col gap-5">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner shadow-primary/10">
            {/* Replace the icon here if you update your contact pictograms */}
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <div className="text-sm text-muted-foreground">{detail}</div>
          </div>
        </div>
        {href ? (
          <a
            href={href}
            className="text-sm font-semibold text-primary transition-smooth hover:text-primary-dark"
            aria-label={ariaLabel ?? `Lien vers ${title}`}
            target={isExternalLink ? "_blank" : undefined}
            rel={isExternalLink ? "noreferrer" : undefined}
          >
            {actionLabel ?? "Ouvrir le lien"}
          </a>
        ) : null}
      </div>
    </Card>
  );
};

export default ContactCard;
