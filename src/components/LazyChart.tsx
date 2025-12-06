import { lazy, Suspense, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Lazy-loaded chart components to reduce initial bundle size.
 * Charts are only loaded when they're actually rendered.
 */

// Lazy load the EmissionsChart component
export const LazyEmissionsChart = lazy(() =>
  import('@/components/EmissionsChart').then((module) => ({
    default: module.EmissionsChart,
  }))
);

// Lazy load Recharts components (used in various dashboards)
export const LazyBarChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.BarChart as ComponentType<unknown> }))
);

export const LazyPieChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.PieChart as ComponentType<unknown> }))
);

export const LazyLineChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.LineChart as ComponentType<unknown> }))
);

export const LazyAreaChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.AreaChart as ComponentType<unknown> }))
);

/**
 * Loading skeleton for charts
 */
function ChartSkeleton({ title, description }: { title?: string; description?: string }) {
  return (
    <Card>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

/**
 * Wrapper component that adds loading state to lazy-loaded charts
 *
 * @example
 * ```tsx
 * <LazyChartWrapper title="Emissions Overview" description="Total emissions by scope">
 *   <LazyEmissionsChart
 *     type="bar"
 *     title="Emissions"
 *     description="By scope"
 *     data={data}
 *   />
 * </LazyChartWrapper>
 * ```
 */
export function LazyChartWrapper({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <Suspense fallback={<ChartSkeleton title={title} description={description} />}>
      {children}
    </Suspense>
  );
}

/**
 * Preload charts for better UX
 * Call this on route changes or user actions that will likely need charts
 */
export function preloadCharts() {
  // Preload chart components by triggering the lazy imports
  import('@/components/EmissionsChart').catch(() => {});
  import('recharts').catch(() => {});
}
