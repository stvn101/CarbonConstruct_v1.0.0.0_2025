import * as React from 'react';
import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetric {
  metric_name: string;
  metric_value: number;
  metadata?: Record<string, unknown>;
}

const METRICS_BATCH_SIZE = 20;
const METRICS_FLUSH_INTERVAL = 10000; // 10 seconds

export function usePerformanceMonitor() {
  const metricsQueue = useRef<PerformanceMetric[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getDeviceType = useCallback(() => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, []);

  const flushMetrics = useCallback(async () => {
    if (metricsQueue.current.length === 0) return;

    const metricsToSend = metricsQueue.current.splice(0, METRICS_BATCH_SIZE);
    
    try {
      await supabase.functions.invoke('log-performance', {
        body: {
          metrics: metricsToSend.map(m => ({
            ...m,
            page_url: window.location.href,
            device_type: getDeviceType(),
          })),
        },
      });
    } catch {
      // Silently fail
    }
  }, [getDeviceType]);

  const scheduleFlush = useCallback(() => {
    if (flushTimeoutRef.current) return;
    
    flushTimeoutRef.current = setTimeout(() => {
      flushMetrics();
      flushTimeoutRef.current = null;
    }, METRICS_FLUSH_INTERVAL);
  }, [flushMetrics]);

  const trackMetric = useCallback((name: string, value: number, metadata?: Record<string, unknown>) => {
    metricsQueue.current.push({
      metric_name: name,
      metric_value: value,
      metadata,
    });

    if (metricsQueue.current.length >= METRICS_BATCH_SIZE) {
      flushMetrics();
    } else {
      scheduleFlush();
    }
  }, [flushMetrics, scheduleFlush]);

  // Track Core Web Vitals
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Track LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      trackMetric('LCP', lastEntry.startTime);
    });

    // Track FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        trackMetric('FID', entry.processingStart - entry.startTime);
      });
    });

    // Track CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
    });

    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      fidObserver.observe({ type: 'first-input', buffered: true });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch {
      // PerformanceObserver not supported
    }

    // Track navigation timing
    const handleLoad = () => {
      setTimeout(() => {
        const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (timing) {
          trackMetric('TTFB', timing.responseStart - timing.requestStart);
          trackMetric('FCP', timing.domContentLoadedEventEnd - timing.fetchStart);
          trackMetric('PageLoad', timing.loadEventEnd - timing.fetchStart);
        }
        
        // Send CLS after page load settles
        if (clsValue > 0) {
          trackMetric('CLS', clsValue);
        }
      }, 1000);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      window.removeEventListener('load', handleLoad);
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      flushMetrics();
    };
  }, [trackMetric, flushMetrics]);

  return { trackMetric };
}
