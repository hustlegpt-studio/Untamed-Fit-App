import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "premium" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const variants = {
      default: "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,255,122,0.2)] hover:shadow-[0_0_25px_rgba(0,255,122,0.4)] hover:-translate-y-0.5",
      premium: "bg-gradient-to-r from-accent to-orange-400 text-accent-foreground premium-glow hover:scale-[1.02]",
      outline: "border-2 border-primary text-primary hover:bg-primary/10",
      ghost: "hover:bg-accent/10 hover:text-accent",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    };

    const sizes = {
      default: "h-12 px-6 py-2 uppercase tracking-wider font-display font-bold",
      sm: "h-9 px-4 text-xs font-display font-bold uppercase",
      lg: "h-14 px-8 text-lg font-display font-bold uppercase",
      icon: "h-12 w-12 flex items-center justify-center rounded-full",
    };

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center rounded-xl transition-all duration-300 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
