/**
 * Centralized logging service for the application
 * Handles environment-aware logging (development vs production)
 * In production, errors are sent to the backend for tracking
 */

import { supabase } from '@/integrations/supabase/client';

interface LogMetadata {
  [key: string]: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private errorQueue: Array<{
    context: string;
    error: unknown;
    metadata?: LogMetadata;
    timestamp: number;
  }> = [];
  private flushTimeout: NodeJS.Timeout | null = null;

  constructor() {
    // Flush errors on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flushErrors());
    }
  }

  /**
   * Log an error with context
   */
  error(context: string, error: unknown, metadata?: LogMetadata) {
    if (this.isDevelopment) {
      console.error(`[${context}]`, error, metadata || '');
    }
    
    // Queue error for production logging
    this.queueError(context, error, metadata, 'error');
  }

  /**
   * Log a critical error (always sent to backend immediately)
   */
  critical(context: string, error: unknown, metadata?: LogMetadata) {
    console.error(`[CRITICAL][${context}]`, error, metadata || '');
    this.sendErrorToBackend(context, error, metadata, 'critical');
  }

  /**
   * Log a warning
   */
  warn(context: string, message: string, metadata?: LogMetadata) {
    if (this.isDevelopment) {
      console.warn(`[${context}]`, message, metadata || '');
    }
  }

  /**
   * Log informational message
   */
  info(context: string, message: string, metadata?: LogMetadata) {
    if (this.isDevelopment) {
      console.info(`[${context}]`, message, metadata || '');
    }
  }

  /**
   * Log debug information (dev only)
   */
  debug(context: string, message: string, metadata?: LogMetadata) {
    if (this.isDevelopment) {
      console.log(`[${context}]`, message, metadata || '');
    }
  }

  private queueError(
    context: string, 
    error: unknown, 
    metadata?: LogMetadata, 
    severity: string = 'error'
  ) {
    this.errorQueue.push({
      context,
      error,
      metadata: { ...metadata, severity },
      timestamp: Date.now(),
    });

    // Schedule flush
    if (!this.flushTimeout) {
      this.flushTimeout = setTimeout(() => {
        this.flushErrors();
        this.flushTimeout = null;
      }, 5000);
    }

    // Flush immediately if queue is large
    if (this.errorQueue.length >= 10) {
      this.flushErrors();
    }
  }

  private async flushErrors() {
    if (this.errorQueue.length === 0) return;

    const errors = this.errorQueue.splice(0);
    
    for (const { context, error, metadata } of errors) {
      await this.sendErrorToBackend(context, error, metadata, metadata?.severity || 'error');
    }
  }

  private async sendErrorToBackend(
    context: string,
    error: unknown,
    metadata?: LogMetadata,
    severity: string = 'error'
  ) {
    try {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const stackTrace = error instanceof Error ? error.stack : undefined;

      await supabase.functions.invoke('log-error', {
        body: {
          error_type: context,
          error_message: errorMessage,
          stack_trace: stackTrace,
          page_url: typeof window !== 'undefined' ? window.location.href : undefined,
          browser_info: typeof window !== 'undefined' ? {
            userAgent: navigator.userAgent,
            language: navigator.language,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight,
            },
          } : undefined,
          severity,
          metadata,
        },
      });
    } catch {
      // Silently fail - don't cause more errors
    }
  }
}

export const logger = new Logger();
