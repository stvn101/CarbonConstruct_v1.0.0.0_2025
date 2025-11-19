// Analytics and Performance Monitoring Service

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ErrorEvent {
  message: string;
  stack?: string;
  componentStack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  userAgent: string;
  url: string;
  metadata?: Record<string, any>;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private errors: ErrorEvent[] = [];
  private readonly MAX_QUEUE_SIZE = 100;

  // Track user events
  trackEvent(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(analyticsEvent);
    this.pruneQueue(this.events);

    // Log in development
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event, properties);
    }

    // TODO: Send to analytics service in production
    // Example: sendToService(analyticsEvent);
  }

  // Track performance metrics
  trackPerformance(name: string, value: number, unit: 'ms' | 'bytes' | 'count' = 'ms', metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata,
    };

    this.performanceMetrics.push(metric);
    this.pruneQueue(this.performanceMetrics);

    // Log slow operations in development
    if (import.meta.env.DEV && unit === 'ms' && value > 1000) {
      console.warn('[Performance] Slow operation:', name, `${value}ms`);
    }

    // Alert on critical performance issues
    if (unit === 'ms' && value > 5000) {
      this.trackError({
        message: `Slow operation detected: ${name}`,
        severity: 'medium',
        metadata: { duration: value, ...metadata },
      });
    }
  }

  // Track errors
  trackError({
    message,
    stack,
    componentStack,
    severity = 'medium',
    metadata,
  }: {
    message: string;
    stack?: string;
    componentStack?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    metadata?: Record<string, any>;
  }) {
    const errorEvent: ErrorEvent = {
      message,
      stack,
      componentStack,
      severity,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      metadata,
    };

    this.errors.push(errorEvent);
    this.pruneQueue(this.errors);

    // Always log errors
    console.error('[Error]', message, {
      severity,
      stack,
      componentStack,
      metadata,
    });

    // TODO: Send to error tracking service in production
    // Example: Sentry.captureException(errorEvent);
  }

  // Measure API call performance
  async measureApiCall<T>(
    name: string,
    apiCall: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;
      
      this.trackPerformance(`api_${name}`, duration, 'ms', {
        success: true,
        ...metadata,
      });
      
      return result;
    } catch (error: any) {
      const duration = performance.now() - startTime;
      
      this.trackPerformance(`api_${name}`, duration, 'ms', {
        success: false,
        error: error.message,
        ...metadata,
      });
      
      this.trackError({
        message: `API call failed: ${name}`,
        stack: error.stack,
        severity: 'high',
        metadata: {
          duration,
          errorMessage: error.message,
          ...metadata,
        },
      });
      
      throw error;
    }
  }

  // Measure PDF generation performance
  measurePdfGeneration(callback: () => Promise<void>) {
    return this.measureOperation('pdf_generation', callback, {
      category: 'export',
    });
  }

  // Generic operation measurement
  async measureOperation<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      this.trackPerformance(name, duration, 'ms', {
        success: true,
        ...metadata,
      });
      
      return result;
    } catch (error: any) {
      const duration = performance.now() - startTime;
      
      this.trackError({
        message: `Operation failed: ${name}`,
        stack: error.stack,
        severity: 'medium',
        metadata: {
          duration,
          errorMessage: error.message,
          ...metadata,
        },
      });
      
      throw error;
    }
  }

  // Get performance summary
  getPerformanceSummary(metricName?: string) {
    const metrics = metricName
      ? this.performanceMetrics.filter(m => m.name === metricName)
      : this.performanceMetrics;

    if (metrics.length === 0) return null;

    const values = metrics.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      count: metrics.length,
      avg,
      min,
      max,
      unit: metrics[0].unit,
    };
  }

  // Get error summary
  getErrorSummary() {
    const critical = this.errors.filter(e => e.severity === 'critical').length;
    const high = this.errors.filter(e => e.severity === 'high').length;
    const medium = this.errors.filter(e => e.severity === 'medium').length;
    const low = this.errors.filter(e => e.severity === 'low').length;

    return {
      total: this.errors.length,
      critical,
      high,
      medium,
      low,
    };
  }

  // Export data for dashboard
  exportData() {
    return {
      events: this.events,
      performance: this.performanceMetrics,
      errors: this.errors,
      summary: {
        performance: this.getPerformanceSummary(),
        errors: this.getErrorSummary(),
      },
    };
  }

  // Clear all data
  clear() {
    this.events = [];
    this.performanceMetrics = [];
    this.errors = [];
  }

  // Prune queue to prevent memory issues
  private pruneQueue<T>(queue: T[]) {
    if (queue.length > this.MAX_QUEUE_SIZE) {
      queue.splice(0, queue.length - this.MAX_QUEUE_SIZE);
    }
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

// Convenience functions
export const trackEvent = (event: string, properties?: Record<string, any>) =>
  analytics.trackEvent(event, properties);

export const trackPerformance = (name: string, value: number, unit: 'ms' | 'bytes' | 'count' = 'ms', metadata?: Record<string, any>) =>
  analytics.trackPerformance(name, value, unit, metadata);

export const trackError = (error: {
  message: string;
  stack?: string;
  componentStack?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}) => analytics.trackError(error);

export const measureApiCall = <T,>(
  name: string,
  apiCall: () => Promise<T>,
  metadata?: Record<string, any>
) => analytics.measureApiCall(name, apiCall, metadata);

export const measurePdfGeneration = (callback: () => Promise<void>) =>
  analytics.measurePdfGeneration(callback);

export const measureOperation = <T,>(
  name: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
) => analytics.measureOperation(name, operation, metadata);
