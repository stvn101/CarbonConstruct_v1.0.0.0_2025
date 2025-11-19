import * as React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  content: string;
  className?: string;
}

export function InfoTooltip({ content, className }: InfoTooltipProps) {
  return (
    <span
      className="inline-flex items-center align-middle"
      aria-label={content}
      title={content}
    >
      <Info
        className={cn(
          "h-4 w-4 text-muted-foreground hover:text-foreground cursor-help transition-colors ml-1",
          className,
        )}
      />
    </span>
  );
}
