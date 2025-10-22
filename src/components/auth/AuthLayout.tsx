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
  contentPosition?: "left" | "right";
}
const AuthLayout = ({
  children,
  visual,
  brand,
  brandHref = "/",
  className,
  contentPosition = "right"
}: AuthLayoutProps) => {
  const isContentLeft = contentPosition === "left";
  return <div className={cn("relative flex min-h-screen flex-col bg-background", className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          {brand ?? <Link to={brandHref} className="flex items-center gap-3 rounded-full bg-white/60 px-4 py-2 text-sm font-semibold text-primary shadow-soft transition-smooth hover:text-primary-dark">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span aria-hidden="true" className="text-base font-bold">
                  OC
                </span>
              </div>
              <span className="tracking-tight">One Connexion</span>
            </Link>}
        </div>

        <div className="grid min-h-[640px] flex-1 overflow-hidden rounded-[48px] border border-border/60 bg-card shadow-large sm:rounded-[56px] lg:grid-cols-[0.4fr_0.6fr] xl:grid-cols-[1fr_1fr]">
          <div className={cn("flex flex-col justify-center bg-card px-6 py-8 sm:px-10 sm:py-12", isContentLeft ? "order-1" : "order-2", isContentLeft ? "lg:order-1" : "lg:order-2")}>
            {children}
          </div>

          <div className={cn("relative min-h-[260px] bg-primary text-primary-foreground", isContentLeft ? "order-2" : "order-1", isContentLeft ? "lg:order-2" : "lg:order-1")}>
            
            
            <div aria-hidden="true" className="absolute inset-5 rounded-[36px] border border-white/50 opacity-60 sm:inset-8 sm:rounded-[44px]" />

            
          </div>
        </div>
      </div>
    </div>;
};
export default AuthLayout;