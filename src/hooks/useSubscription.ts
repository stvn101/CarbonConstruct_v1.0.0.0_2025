import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionTier {
  id: string;
  name: string;
  stripe_price_id: string | null;
  price_monthly: number;
  price_annual: number | null;
  features: string[];
  limits: {
    projects: number;
    reports_per_month: number;
    lca_calculations: boolean;
    team_collaboration: boolean;
    [key: string]: any;
  };
  display_order: number;
}

export interface UserSubscription {
  id: string;
  tier_id: string;
  status: string;
  trial_end: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all available tiers
  const { data: tiers, isLoading: tiersLoading } = useQuery({
    queryKey: ['subscription-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      
      // Transform Json types to proper TypeScript types
      return data?.map(tier => ({
        ...tier,
        features: Array.isArray(tier.features) ? tier.features as string[] : [],
        limits: tier.limits as SubscriptionTier['limits'],
      })) as SubscriptionTier[];
    },
  });

  // Fetch user's current subscription (excluding sensitive Stripe IDs for security)
  const { data: userSubscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['user-subscription', user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return null;
      
      // Explicitly select only needed columns - exclude stripe_customer_id, stripe_subscription_id
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          user_id,
          tier_id,
          status,
          trial_end,
          current_period_start,
          current_period_end,
          cancel_at_period_end,
          created_at,
          updated_at,
          subscription_tiers(*)
        `)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Get current tier (defaults to Free if no subscription)
  const currentTier = userSubscription?.subscription_tiers || 
    tiers?.find(t => t.name === 'Free');

  // Check if user is on trial
  const isOnTrial = userSubscription?.trial_end 
    ? new Date(userSubscription.trial_end) > new Date()
    : false;

  // Check if user can perform action
  const canPerformAction = (actionType: string): boolean => {
    if (!currentTier) return false;
    
    const limit = currentTier.limits[actionType];
    // -1 means unlimited
    if (limit === -1) return true;
    if (typeof limit === 'boolean') return limit;
    
    return false; // Will be enhanced with usage tracking
  };

  // Get user's usage metrics
  const { data: usageMetrics } = useQuery({
    queryKey: ['usage-metrics', user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('usage_metrics')
        .select('*')
        .eq('user_id', user.id)
        .gte('period_end', new Date().toISOString());
      
      if (error) throw error;
      return data;
    },
  });

  // Increment usage
  const incrementUsage = useMutation({
    mutationFn: async ({ metricType }: { metricType: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const periodStart = new Date();
      periodStart.setDate(1); // Start of month
      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      periodEnd.setDate(0); // End of month

      // Check if metric exists
      const { data: existing } = await supabase
        .from('usage_metrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('metric_type', metricType)
        .gte('period_end', new Date().toISOString())
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('usage_metrics')
          .update({ count: existing.count + 1 })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('usage_metrics')
          .insert({
            user_id: user.id,
            metric_type: metricType,
            count: 1,
            period_start: periodStart.toISOString(),
            period_end: periodEnd.toISOString(),
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usage-metrics', user?.id] });
    },
  });

  return {
    tiers,
    currentTier,
    userSubscription,
    isOnTrial,
    canPerformAction,
    usageMetrics,
    incrementUsage: incrementUsage.mutate,
    loading: tiersLoading || subscriptionLoading,
  };
};
