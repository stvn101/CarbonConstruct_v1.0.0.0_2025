import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "glassLight";
}

function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  const variantClasses = {
    default: "animate-pulse rounded-md bg-muted",
    glass: "skeleton-glass",
    glassLight: "skeleton-glass-light",
  };

  return (
    <div 
      className={cn(variantClasses[variant], className)} 
      aria-hidden="true"
      {...props} 
    />
  );
}

// Glass skeleton card - prebuilt loading component
function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "skeleton-glass p-6 space-y-4",
        className
      )}
      aria-hidden="true"
      {...props}
    >
      <div className="skeleton-glass h-12 w-12 rounded-xl" />
      <div className="space-y-2">
        <div className="skeleton-glass h-4 w-3/4 rounded" />
        <div className="skeleton-glass h-3 w-full rounded" />
        <div className="skeleton-glass h-3 w-5/6 rounded" />
      </div>
    </div>
  );
}

// Glass skeleton for text lines
function SkeletonText({ 
  lines = 3, 
  className,
  ...props 
}: { lines?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true" {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i}
          className={cn(
            "skeleton-glass h-3 rounded",
            i === lines - 1 ? "w-4/5" : "w-full"
          )}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonText };
