import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
export interface AuthLayoutVisualProps {
  label: string;
  headline: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  imageSrcSet?: string;
  imageSizes?: string;
}
export interface AuthLayoutProps {
  children: ReactNode;
  visual?: AuthLayoutVisualProps;
  brandHref?: string;
  brand?: ReactNode;
  className?: string;
}
const AuthLayout = ({
  children,
  visual,
  brand,
  brandHref = "/",
  className
}: AuthLayoutProps) => {
  const hasVisual = Boolean(visual);
  return <div className={cn("relative flex min-h-screen flex-col bg-muted/30", className)}>
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between">
          <div />
          {brand ?? <Link to={brandHref} className="flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-primary shadow-soft transition-smooth hover:text-primary-dark">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span aria-hidden="true" className="text-base font-bold">
                  OC
                </span>
              </div>
              <span className="tracking-tight">One Connexion</span>
            </Link>}
        </div>

        <div
          className={cn(
            "grid min-h-[680px] flex-1 overflow-hidden rounded-[44px] border border-border/60 bg-card shadow-large sm:rounded-[52px]",
            hasVisual ? "md:grid-cols-[0.95fr_1.05fr]" : ""
          )}
        >
          <div className="order-2 flex flex-col justify-center bg-card px-6 py-10 sm:px-10 md:order-1">
            <div className="mx-auto w-full max-w-md">{children}</div>
          </div>

          {hasVisual ? (
            <div className="relative order-1 overflow-hidden bg-gradient-to-br from-primary/40 via-primary-dark/60 to-background md:order-2">
              {visual?.imageUrl ? (
                <img
                  src={visual.imageUrl}
                  srcSet={visual.imageSrcSet}
                  sizes={visual.imageSizes}
                  alt={visual.imageAlt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
              <div aria-hidden="true" className="absolute inset-x-4 inset-y-3 rounded-[36px] border border-white/40 opacity-40 sm:inset-x-6 sm:inset-y-4 sm:rounded-[40px]" />
            </div>
          ) : null}
        </div>
      </div>
    </div>;
};
export default AuthLayout;