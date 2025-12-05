import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface ErrorHandlerOptions {
  /**
   * Context identifier for logging (e.g., 'ComponentName:functionName')
   */
  context: string;

  /**
   * User-friendly error title
   */
  title: string;

  /**
   * User-friendly error description
   */
  description: string;

  /**
   * Whether to show toast notification (default: true)
   */
  showToast?: boolean;

  /**
   * Whether to log to console/logger (default: true)
   */
  logError?: boolean;

  /**
   * Optional callback for additional error handling
   */
  onError?: (error: Error | unknown) => void;
}

/**
 * Custom hook for standardized error handling throughout the application.
 * Combines logging, user notifications, and optional custom error handling.
 *
 * @example
 * ```tsx
 * const { handleError } = useErrorHandler();
 *
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   handleError(error, {
 *     context: 'MyComponent:riskyOperation',
 *     title: 'Operation Failed',
 *     description: 'Failed to complete the operation. Please try again.',
 *   });
 * }
 * ```
 */
export function useErrorHandler() {
  /**
   * Handles an error by logging it and optionally showing a toast notification
   */
  const handleError = useCallback((
    error: Error | unknown,
    options: ErrorHandlerOptions
  ) => {
    const {
      context,
      title,
      description,
      showToast = true,
      logError = true,
      onError,
    } = options;

    // Log the error
    if (logError) {
      logger.error(context, error);
    }

    // Show toast notification
    if (showToast) {
      toast({
        title,
        description,
        variant: 'destructive',
      });
    }

    // Call custom error handler if provided
    if (onError) {
      onError(error);
    }
  }, []);

  /**
   * Creates a wrapped async function with automatic error handling
   *
   * @example
   * ```tsx
   * const handleSubmit = wrapAsync(
   *   async () => {
   *     await submitForm();
   *   },
   *   {
   *     context: 'Form:handleSubmit',
   *     title: 'Submission Failed',
   *     description: 'Failed to submit form',
   *   }
   * );
   * ```
   */
  const wrapAsync = useCallback(<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    errorOptions: ErrorHandlerOptions
  ): ((...args: Parameters<T>) => Promise<void>) => {
    return async (...args: Parameters<T>) => {
      try {
        await fn(...args);
      } catch (error) {
        handleError(error, errorOptions);
      }
    };
  }, [handleError]);

  /**
   * Handles an error with success callback
   * Useful for operations that should show success on completion
   *
   * @example
   * ```tsx
   * await handleOperation(
   *   async () => {
   *     await saveData();
   *   },
   *   {
   *     context: 'DataManager:save',
   *     title: 'Save Failed',
   *     description: 'Failed to save data',
   *   },
   *   {
   *     title: 'Success',
   *     description: 'Data saved successfully',
   *   }
   * );
   * ```
   */
  const handleOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    errorOptions: ErrorHandlerOptions,
    successToast?: { title: string; description: string }
  ): Promise<T | undefined> => {
    try {
      const result = await operation();

      if (successToast) {
        toast({
          title: successToast.title,
          description: successToast.description,
        });
      }

      return result;
    } catch (error) {
      handleError(error, errorOptions);
      return undefined;
    }
  }, [handleError]);

  return {
    handleError,
    wrapAsync,
    handleOperation,
  };
}
