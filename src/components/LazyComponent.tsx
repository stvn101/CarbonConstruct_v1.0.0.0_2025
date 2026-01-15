import { useInViewAnimation } from "@/hooks/useInViewAnimation";
import { Suspense, lazy, ComponentType, ReactNode } from "react";

interface LazyComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
}

/**
 * Wrapper component that only renders children when they enter the viewport.
 * Reduces initial JavaScript execution by deferring below-the-fold content.
 */
export function LazyComponent({ 
  children, 
  fallback = null,
  rootMargin = "200px",
  threshold = 0
}: LazyComponentProps) {
  const { ref, isInView } = useInViewAnimation<HTMLDivElement>({
    rootMargin,
    threshold,
    triggerOnce: true
  });

  return (
    <div ref={ref}>
      {isInView ? children : fallback}
    </div>
  );
}

/**
 * Creates a lazy-loaded version of a component that only loads when in viewport.
 * Use for below-the-fold components to reduce initial JS execution.
 * 
 * @example
 * const LazyFooter = createLazyComponent(() => import('./Footer'), <div>Loading...</div>);
 */
export function createLazyComponent<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyLoadedComponent = lazy(importFn);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    const { ref, isInView } = useInViewAnimation<HTMLDivElement>({
      rootMargin: "200px",
      threshold: 0,
      triggerOnce: true
    });

    return (
      <div ref={ref}>
        {isInView ? (
          <Suspense fallback={fallback || <div className="min-h-[100px]" />}>
            {/* @ts-expect-error - dynamic props spreading */}
            <LazyLoadedComponent {...props} />
          </Suspense>
        ) : (
          fallback || <div className="min-h-[100px]" />
        )}
      </div>
    );
  };
}
