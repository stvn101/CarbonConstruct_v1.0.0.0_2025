// Global Error Monitoring and Reporting
import { trackError } from './analytics';

export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    trackError({
      message: event.reason?.message || 'Unhandled Promise Rejection',
      stack: event.reason?.stack,
      severity: 'high',
      metadata: {
        type: 'unhandledRejection',
        reason: String(event.reason),
        promise: event.promise,
      },
    });

    // Prevent default error handling
    event.preventDefault();
  });

  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    trackError({
      message: event.message || 'Global JavaScript Error',
      stack: event.error?.stack,
      severity: 'high',
      metadata: {
        type: 'globalError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });

    // Don't prevent default to allow normal error logging
  });

  // Monitor console errors (for third-party libraries)
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    // Call original console.error
    originalConsoleError.apply(console, args);

    // Track if it looks like a real error
    const errorMessage = args
      .map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
      .join(' ');

    // Only track if it contains error-like keywords
    if (
      errorMessage.toLowerCase().includes('error') ||
      errorMessage.toLowerCase().includes('failed') ||
      errorMessage.toLowerCase().includes('exception')
    ) {
      trackError({
        message: errorMessage,
        severity: 'low',
        metadata: {
          type: 'consoleError',
          source: 'console.error',
        },
      });
    }
  };

  if (import.meta.env.DEV) {
    console.log('[Error Monitoring] Global error handlers initialized');
  }
}

// Error reporting utilities
export function reportError(error: Error | unknown, context?: Record<string, any>) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  trackError({
    message: errorMessage,
    stack: errorStack,
    severity: 'medium',
    metadata: {
      ...context,
      manualReport: true,
    },
  });
}

// Create error boundaries for specific sections
export function withErrorBoundary<T extends (...args: any[]) => any>(
  fn: T,
  context: string
): T {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          reportError(error, { context, async: true });
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      reportError(error, { context, async: false });
      throw error;
    }
  }) as T;
}
