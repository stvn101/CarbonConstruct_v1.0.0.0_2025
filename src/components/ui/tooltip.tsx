import * as React from "react";
import { cn } from "@/lib/utils";

// Lightweight, hook-free tooltip stubs to avoid Radix runtime issues.
// These components preserve the existing API surface so current usages
// (InfoTooltip, Sidebar, future badges) continue to work without
// pulling in @radix-ui/react-tooltip.

const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

const TooltipTrigger = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ children, ...props }, ref) => (
    <span ref={ref} {...props}>
      {children}
    </span>
  ),
);
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn(className)} {...props}>
      {children}
    </div>
  ),
);
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
