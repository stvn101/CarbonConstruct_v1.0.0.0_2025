import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Custom loading text for screen readers */
  loadingText?: string;
}

function Skeleton({ className, loadingText = "Loading...", ...props }: SkeletonProps) {
  return (
    <div 
      className={cn("animate-pulse rounded-md bg-muted", className)} 
      role="status"
      aria-label={loadingText}
      {...props} 
    />
  );
}

export { Skeleton };
