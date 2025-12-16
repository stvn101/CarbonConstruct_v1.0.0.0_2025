import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-carbon hover:shadow-elevated",
        destructive: "bg-destructive text-destructive-foreground hover:brightness-110 shadow-md",
        outline: "border-2 border-primary bg-card text-primary hover:bg-primary hover:text-primary-foreground shadow-sm",
        secondary: "bg-secondary text-secondary-foreground hover:brightness-110 shadow-md",
        ghost: "hover:bg-accent/20 hover:text-accent",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-hover",
        eco: "bg-gradient-eco text-white hover:shadow-glow hover:scale-105 shadow-md font-semibold",
        carbon: "bg-gradient-carbon text-white hover:shadow-elevated hover:scale-105 shadow-md font-semibold",
        sunset: "bg-gradient-sunset text-white hover:shadow-glow hover:scale-105 shadow-md font-semibold",
        ocean: "bg-gradient-ocean text-white hover:shadow-glow hover:scale-105 shadow-md font-semibold",
        success: "bg-success text-white hover:brightness-110 shadow-md",
        warning: "bg-warning text-white hover:brightness-110 shadow-md",
        glass: "bg-white/15 backdrop-blur-lg border border-white/20 text-white hover:bg-white/25 hover:shadow-[0_0_20px_hsla(156,55%,45%,0.3)] font-medium transition-all",
        glassOutline: "bg-transparent backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-medium transition-all",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface MotionButtonProps
  extends Omit<HTMLMotionProps<"button">, "children">,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
}

const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);
MotionButton.displayName = "MotionButton";

export { MotionButton, buttonVariants };
