import { ReactNode } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

export interface AuthLayoutVisualProps {
  label: string;
  headline: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

export interface AuthLayoutProps {
  children: ReactNode;
  visual: AuthLayoutVisualProps;
  brandHref?: string;
  brand?: ReactNode;
  className?: string;
}

const AuthLayout = ({ children, visual, brand, brandHref = "/", className }: AuthLayoutProps) => {
  return (
    <div className={cn("relative flex min-h-screen flex-col bg-background", className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          {brand ?? (
            <Link
              to={brandHref}
              className="flex items-center gap-3 rounded-full bg-white/60 px-4 py-2 text-sm font-semibold text-primary shadow-soft transition-smooth hover:text-primary-dark"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span aria-hidden="true" className="text-base font-bold">
                  OC
                </span>
              </div>
              <span className="tracking-tight">One Connexion</span>
            </Link>
          )}
        </div>

        <div className="grid min-h-[640px] flex-1 overflow-hidden rounded-[42px] border border-border/60 bg-card shadow-large sm:rounded-[48px] md:grid-cols-[0.4fr_0.6fr] lg:grid-cols-[0.45fr_0.55fr]">
          <div className="relative min-h-[220px] bg-primary text-primary-foreground sm:min-h-[260px]">
            <img
              src={visual.imageUrl}
              alt={visual.imageAlt}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-primary/70 mix-blend-multiply" />
            <div aria-hidden="true" className="absolute inset-4 rounded-[32px] border border-white/50 opacity-60 sm:inset-6 sm:rounded-[36px]" />

            <div className="relative z-10 flex h-full flex-col justify-between px-6 py-8 sm:px-10 sm:py-12">
              <span className="text-[11px] font-semibold uppercase tracking-[0.5em] text-white/70">
                {visual.label}
              </span>

              <div className="space-y-4 text-white">
                <h2 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                  {visual.headline}
                </h2>
                <p className="max-w-sm text-sm text-white/80 sm:text-base">
                  {visual.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center bg-card px-6 py-8 sm:px-10 sm:py-12">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
