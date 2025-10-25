import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft",
        cta:
          "relative isolate overflow-hidden bg-cta text-cta-foreground shadow-medium hover:bg-cta/90 hover:scale-[1.05] hover:shadow-[0_0_35px_rgba(255,204,0,0.45)] focus-visible:ring-cta focus-visible:ring-offset-background before:pointer-events-none before:absolute before:left-1/2 before:top-1/2 before:h-[180%] before:w-[180%] before:-translate-x-1/2 before:-translate-y-1/2 before:scale-0 before:rounded-full before:bg-white before:opacity-0 before:transition before:duration-500 before:ease-out before:content-[''] before:-z-10 active:before:scale-[2.6] active:before:opacity-40 active:before:transition-[transform,opacity]",
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        "outline-light": "border-2 border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-soft",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-md px-4",
        lg: "h-14 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
