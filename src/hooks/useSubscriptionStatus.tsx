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
  });
  const [loading, setLoading] = useState(true);

  const checkSubscription = async (retryCount = 0): Promise<void> => {
    if (!user) {
      setStatus({
        subscribed: false,
        tier_name: 'Free',
        product_id: null,
        price_id: null,
        subscription_end: null,
        trial_end: null,
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
            description: (
              <>
                Unable to verify your subscription after {RETRY.MAX_ATTEMPTS} attempts.<br />
                Please check your internet connection and try again. If the problem persists,&nbsp;
                <a
                  href="mailto:support@carboncompass.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary font-medium"
                >
                  contact support
                </a>
                .
              </>
            ),
            variant: 'destructive',
          });
        }
        return;
      }

      if (data) {
        setStatus(data);
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
