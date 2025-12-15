import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-primary/10",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card p-6 shadow", className)}>
      <div className="space-y-4">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <div className="pt-4">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

function SkeletonList({ 
  rows = 5, 
  className 
}: { 
  rows?: number; 
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonTable({ 
  rows = 5, 
  columns = 4,
  className 
}: { 
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex gap-4 border-b pb-3 mb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="h-4 flex-1" 
            style={{ maxWidth: i === 0 ? '30%' : undefined }}
          />
        ))}
      </div>
      {/* Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                className="h-4 flex-1" 
                style={{ maxWidth: colIndex === 0 ? '30%' : undefined }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonForm({ 
  fields = 4,
  className 
}: { 
  fields?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
      <Skeleton className="h-9 w-32 mt-4" />
    </div>
  );
}

function SkeletonStats({ 
  cards = 4,
  className 
}: { 
  cards?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 grid-cols-2 md:grid-cols-4", className)}>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-4 shadow">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card p-6 shadow", className)}>
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48" />
        <div className="flex items-end gap-2 h-48 pt-4">
          {[40, 65, 45, 80, 55, 70, 50].map((height, i) => (
            <Skeleton 
              key={i} 
              className="flex-1 rounded-t-md" 
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonList, 
  SkeletonTable,
  SkeletonForm,
  SkeletonStats,
  SkeletonChart
};
