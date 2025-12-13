import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { RETRY } from '@/lib/constants';

export interface SubscriptionStatus {
  subscribed: boolean;
  tier_name: string;
  product_id: string | null;
  price_id: string | null;
  subscription_end: string | null;
  trial_end: string | null;
  is_trialing: boolean;
}

export const useSubscriptionStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    tier_name: 'Free',
    product_id: null,
    price_id: null,
    subscription_end: null,
    trial_end: null,
    is_trialing: false,
  });
  const [loading, setLoading] = useState(true);

  /**
   * Checks the user's subscription status via Supabase Edge Function with automatic retry logic.
   *
   * This function invokes the 'check-subscription' edge function to verify the user's current
   * subscription tier and status with Stripe. Network failures are automatically retried with
   * linear backoff to improve reliability in unstable network conditions.
   *
   * ## Retry Strategy
   * - **Maximum Attempts**: 3 retries (defined by `RETRY.MAX_ATTEMPTS`)
   * - **Backoff Calculation**: Linear backoff with `RETRY.SUBSCRIPTION_CHECK_DELAY` (1000ms) multiplied by attempt number
   *   - Attempt 1: 1000ms delay (1s)
   *   - Attempt 2: 2000ms delay (2s)
   *   - Attempt 3: 3000ms delay (3s)
   * - **Retriable Errors**: Network failures, fetch errors, or "Failed to send" messages
   * - **Non-Retriable**: Authentication errors, invalid responses (fail immediately)
   *
   * ## Error Handling
   * - Network errors trigger automatic retry with linear backoff delay
   * - Toast notification only shown after final retry failure (prevents notification spam)
   * - All errors logged via `logger.error` for debugging
   * - Non-authenticated users skip subscription check (set to Free tier)
   *
   * ## Toast Notification
   * Displayed only after exhausting all retry attempts with:
   * - Error title: "Connection Issue"
   * - Retry count in message
   * - Support contact link
   *
   * @param retryCount - Internal counter for retry attempts (0-indexed). Do not pass manually.
   * @returns {Promise<void>} Resolves when subscription status is updated or all retries exhausted.
   *
   * @example
   * ```typescript
   * // Called automatically on mount and user change
   * useEffect(() => {
   *   checkSubscription();
   * }, [user]);
   *
   * // Manual refresh (e.g., after checkout)
   * const { refetch } = useSubscriptionStatus();
   * await refetch();
   * ```
   */
  const checkSubscription = async (retryCount = 0): Promise<void> => {
    if (!user) {
      setStatus({
        subscribed: false,
        tier_name: 'Free',
        product_id: null,
        price_id: null,
        subscription_end: null,
        trial_end: null,
        is_trialing: false,
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get the current session to pass the user's JWT token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        logger.warn('SubscriptionStatus:checkSubscription', 'No active session');
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });
      
      if (error) {
        // Check if it's a network error that should be retried
        const isNetworkError = error.message?.includes('Failed to send') || 
                               error.message?.includes('NetworkError') ||
                               error.message?.includes('fetch');
        
        if (isNetworkError && retryCount < RETRY.MAX_ATTEMPTS) {
          logger.warn('SubscriptionStatus:checkSubscription', `Network error, retrying (${retryCount + 1}/${RETRY.MAX_ATTEMPTS})...`);
          await new Promise(resolve => setTimeout(resolve, RETRY.SUBSCRIPTION_CHECK_DELAY * (retryCount + 1)));
          return checkSubscription(retryCount + 1);
        }
        
        logger.error('SubscriptionStatus:checkSubscription', error);
        // Only show toast on final failure after retries
        if (retryCount >= RETRY.MAX_ATTEMPTS) {
          toast({
            title: 'Connection Issue',
            description: `Unable to verify your subscription after ${RETRY.MAX_ATTEMPTS} attempts. Please check your internet connection and try again.`,
            variant: 'destructive',
          });
        }
        return;
      }

      if (data) {
        // Check if currently in trial period
        const isTrialing = data.trial_end 
          ? new Date(data.trial_end) > new Date() 
          : false;
        setStatus({
          ...data,
          is_trialing: isTrialing,
        });
      }
    } catch (error) {
      // Handle unexpected errors with retry logic
      if (retryCount < RETRY.MAX_ATTEMPTS) {
        logger.warn('SubscriptionStatus:checkSubscription', `Unexpected error, retrying (${retryCount + 1}/${RETRY.MAX_ATTEMPTS})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY.SUBSCRIPTION_CHECK_DELAY * (retryCount + 1)));
        return checkSubscription(retryCount + 1);
      }
      logger.error('SubscriptionStatus:checkSubscription', error);
    } finally {
      setLoading(false);
    }
  };

  // Check on mount and when user changes
  useEffect(() => {
    checkSubscription();
  }, [user]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user]);

  return {
    ...status,
    loading,
    refetch: checkSubscription,
  };
};
