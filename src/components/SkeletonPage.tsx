import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/skeleton";

interface SkeletonPageProps {
  variant?: "dashboard" | "form" | "list" | "cards";
}

export function SkeletonPage({ variant = "dashboard" }: SkeletonPageProps) {
  if (variant === "form") {
    return (
      <div className="min-h-screen bg-background p-6 md:p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <Skeleton variant="glass" className="h-10 w-64" />
            <Skeleton variant="glass" className="h-4 w-96" />
          </div>

          {/* Form Card */}
          <div className="glass rounded-xl p-6 space-y-6">
            {/* Form Fields */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2" style={{ animationDelay: `${i * 0.1}s` }}>
                <Skeleton variant="glass" className="h-4 w-24" />
                <Skeleton variant="glass" className="h-10 w-full" />
              </div>
            ))}

            {/* Submit Button */}
            <div className="pt-4">
              <Skeleton variant="glass" className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="min-h-screen bg-background p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <Skeleton variant="glass" className="h-10 w-48" />
            <Skeleton variant="glass" className="h-10 w-32" />
          </div>

          {/* Search Bar */}
          <Skeleton variant="glass" className="h-12 w-full" />

          {/* List Items */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className="glass rounded-lg p-4 flex items-center gap-4"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <Skeleton variant="glass" className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="glass" className="h-5 w-48" />
                  <Skeleton variant="glass" className="h-4 w-72" />
                </div>
                <Skeleton variant="glass" className="h-8 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className="min-h-screen bg-background p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Skeleton variant="glass" className="h-12 w-64 mx-auto" />
            <Skeleton variant="glass" className="h-6 w-96 mx-auto" />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard 
                key={i} 
                className="h-64"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default: Dashboard variant
  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <Skeleton variant="glass" className="h-10 w-56" />
            <Skeleton variant="glass" className="h-5 w-80" />
          </div>
          <div className="flex gap-3">
            <Skeleton variant="glass" className="h-10 w-32" />
            <Skeleton variant="glass" className="h-10 w-32" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="glass rounded-xl p-5 space-y-3"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex justify-between items-start">
                <Skeleton variant="glass" className="h-10 w-10 rounded-lg" />
                <Skeleton variant="glass" className="h-5 w-16" />
              </div>
              <Skeleton variant="glass" className="h-8 w-24" />
              <Skeleton variant="glass" className="h-4 w-32" />
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Large Chart Area */}
          <div className="lg:col-span-2 glass rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton variant="glass" className="h-6 w-40" />
              <Skeleton variant="glass" className="h-8 w-24" />
            </div>
            <Skeleton variant="glass" className="h-64 w-full" />
          </div>

          {/* Sidebar */}
          <div className="glass rounded-xl p-6 space-y-4">
            <Skeleton variant="glass" className="h-6 w-32" />
            <SkeletonText lines={4} />
            <div className="pt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton variant="glass" className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton variant="glass" className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton variant="glass" className="h-6 w-48" />
            <Skeleton variant="glass" className="h-8 w-28" />
          </div>
          
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 py-3 border-b border-white/10">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="glass" className="h-4 w-full" />
            ))}
          </div>
          
          {/* Table Rows */}
          {[1, 2, 3, 4, 5].map((row) => (
            <div 
              key={row} 
              className="grid grid-cols-5 gap-4 py-3"
              style={{ animationDelay: `${row * 0.05}s` }}
            >
              {[1, 2, 3, 4, 5].map((col) => (
                <Skeleton key={col} variant="glass" className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
