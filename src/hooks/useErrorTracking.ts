import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ErrorData {
  error_type: string;
  error_message: string;
  stack_trace?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  metadata?: Record<string, unknown>;
}

interface QueuedError extends ErrorData {
  page_url: string;
  browser_info: Record<string, unknown>;
  timestamp: number;
}

const ERROR_BATCH_SIZE = 10;
const ERROR_FLUSH_INTERVAL = 5000; // 5 seconds

export function useErrorTracking() {
  const errorQueue = useRef<QueuedError[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getBrowserInfo = useCallback(() => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      connection: (navigator as any).connection?.effectiveType || 'unknown',
    };
  }, []);

  const flushErrors = useCallback(async () => {
    if (errorQueue.current.length === 0) return;

    const errorsToSend = errorQueue.current.splice(0, ERROR_BATCH_SIZE);
    
    try {
      // Send each error individually (could batch in future)
      for (const error of errorsToSend) {
        await supabase.functions.invoke('log-error', {
          body: {
            error_type: error.error_type,
            error_message: error.error_message,
            stack_trace: error.stack_trace,
            page_url: error.page_url,
            browser_info: error.browser_info,
            severity: error.severity || 'error',
            metadata: error.metadata,
          },
        });
      }
    } catch (e) {
      // Silently fail - don't cause more errors
      console.warn('Failed to send error logs');
    }
  }, []);

  const scheduleFlush = useCallback(() => {
    if (flushTimeoutRef.current) return;
    
    flushTimeoutRef.current = setTimeout(() => {
      flushErrors();
      flushTimeoutRef.current = null;
    }, ERROR_FLUSH_INTERVAL);
  }, [flushErrors]);

  const trackError = useCallback((data: ErrorData) => {
    const queuedError: QueuedError = {
      ...data,
      page_url: window.location.href,
      browser_info: getBrowserInfo(),
      timestamp: Date.now(),
    };

    errorQueue.current.push(queuedError);

    // Flush immediately for critical errors
    if (data.severity === 'critical') {
      flushErrors();
    } else if (errorQueue.current.length >= ERROR_BATCH_SIZE) {
      flushErrors();
    } else {
      scheduleFlush();
    }
  }, [getBrowserInfo, flushErrors, scheduleFlush]);

  // Flush on unmount or when page becomes hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && errorQueue.current.length > 0) {
        // Use sendBeacon for reliability when page is being hidden
        const errors = errorQueue.current.splice(0);
        navigator.sendBeacon?.(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-error`,
          JSON.stringify(errors[0])
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      flushErrors();
    };
  }, [flushErrors]);

  return { trackError };
}

// Singleton for non-hook usage
let globalTrackError: ((data: ErrorData) => void) | null = null;

export function initializeErrorTracking() {
  const getBrowserInfo = () => ({
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  });

  globalTrackError = async (data: ErrorData) => {
    try {
      await supabase.functions.invoke('log-error', {
        body: {
          error_type: data.error_type,
          error_message: data.error_message,
          stack_trace: data.stack_trace,
          page_url: window.location.href,
          browser_info: getBrowserInfo(),
          severity: data.severity || 'error',
          metadata: data.metadata,
        },
      });
    } catch {
      // Silently fail
    }
  };
}

export function trackErrorGlobal(data: ErrorData) {
  globalTrackError?.(data);
}
