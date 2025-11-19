/**
 * Centralized logging service for the application
 * Handles environment-aware logging (development vs production)
 */

interface LogMetadata {
  [key: string]: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  /**
   * Log an error with context
   */
  error(context: string, error: unknown, metadata?: LogMetadata) {
    if (this.isDevelopment) {
      console.error(`[${context}]`, error, metadata || '');
    }
    // In production, errors are silently handled to avoid console pollution
    // Future: integrate with error tracking service (e.g., Sentry)
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
}

export const logger = new Logger();
