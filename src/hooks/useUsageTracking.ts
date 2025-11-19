import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';

interface UsageLimits {
  projects: number;
  reports_per_month: number;
  lca_calculations: boolean;
}

export const useUsageTracking = () => {
  const { user } = useAuth();
  const { currentTier } = useSubscription();
  const queryClient = useQueryClient();

  // Get current usage metrics
  const { data: currentUsage, isLoading } = useQuery({
    queryKey: ['current-usage', user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return null;

      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Get or create usage metrics for this period
      const { data: metrics, error } = await supabase
        .from('usage_metrics')
        .select('*')
        .eq('user_id', user.id)
        .gte('period_start', periodStart.toISOString())
        .lte('period_end', periodEnd.toISOString());

      if (error) throw error;

      // Transform to object keyed by metric_type
      const usageMap: Record<string, number> = {};
      metrics?.forEach(metric => {
        usageMap[metric.metric_type] = metric.count;
      });

      return {
        projects: usageMap['projects'] || 0,
        reports_per_month: usageMap['reports_per_month'] || 0,
        lca_calculations: usageMap['lca_calculations'] || 0,
      };
    },
  });

  // Get actual project count
  const { data: projectCount } = useQuery({
    queryKey: ['project-count', user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return 0;
      
      const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      return count || 0;
    },
  });

  // Check if user can perform action
  const canPerformAction = (actionType: keyof UsageLimits): { allowed: boolean; reason?: string } => {
    if (!currentTier || !currentUsage) {
      return { allowed: false, reason: 'Loading...' };
    }

    const limits = currentTier.limits as any;
    const limit = limits[actionType];

    // For boolean limits (like lca_calculations)
    if (typeof limit === 'boolean') {
      if (!limit) {
        return { 
          allowed: false, 
          reason: `${actionType.replace(/_/g, ' ')} is not available on your current plan` 
        };
      }
      return { allowed: true };
    }

    // For numeric limits
    if (typeof limit === 'number') {
      // -1 means unlimited
      if (limit === -1) {
        return { allowed: true };
      }

      // For projects, check actual project count
      if (actionType === 'projects') {
        if ((projectCount || 0) >= limit) {
          return { 
            allowed: false, 
            reason: `You've reached your project limit (${limit}). Upgrade to create more projects.` 
          };
        }
        return { allowed: true };
      }

      // For other metrics, check usage
      const usage = currentUsage[actionType] || 0;
      if (usage >= limit) {
        return { 
          allowed: false, 
          reason: `You've reached your limit for ${actionType.replace(/_/g, ' ')} (${limit}). Upgrade for unlimited access.` 
        };
      }
      return { allowed: true };
    }

    return { allowed: true };
  };

  // Track usage with optimistic locking
  const trackUsage = useMutation({
    mutationFn: async ({ metricType }: { metricType: string }) => {
      if (!user) throw new Error('User not authenticated');

      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Try to find existing metric with version for optimistic locking
      const { data: existing, error: fetchError } = await supabase
        .from('usage_metrics')
        .select('id, count, version')
        .eq('user_id', user.id)
        .eq('metric_type', metricType)
        .gte('period_start', periodStart.toISOString())
        .lte('period_end', periodEnd.toISOString())
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existing) {
        // Update existing record with optimistic locking
        const { error: updateError } = await supabase
          .from('usage_metrics')
          .update({ 
            count: existing.count + 1,
          })
          .eq('id', existing.id)
          .eq('version', existing.version); // Optimistic lock check

        if (updateError) {
          // If version mismatch, retry once
          if (updateError.code === 'PGRST116') {
            // Record was updated by another process, refetch and retry
            const { data: refetched } = await supabase
              .from('usage_metrics')
              .select('id, count, version')
              .eq('id', existing.id)
              .single();

            if (refetched) {
              await supabase
                .from('usage_metrics')
                .update({ count: refetched.count + 1 })
                .eq('id', refetched.id)
                .eq('version', refetched.version);
            }
          } else {
            throw updateError;
          }
        }
      } else {
        // Create new metric record
        const { error: insertError } = await supabase
          .from('usage_metrics')
          .insert([{
            user_id: user.id,
            metric_type: metricType,
            count: 1,
            period_start: periodStart.toISOString(),
            period_end: periodEnd.toISOString(),
            version: 1,
          }]);

        if (insertError && insertError.code !== '23505') {
          // Ignore duplicate key violations (race condition handled by unique index)
          throw insertError;
        }
      }
    },
    onSuccess: () => {
      // Invalidate queries to refetch usage
      queryClient.invalidateQueries({ queryKey: ['current-usage', user?.id] });
    },
    onError: (error) => {
      console.error('Usage tracking error:', error);
      // Don't show error to user - silent fail is acceptable for metrics
    },
  });

  return {
    currentUsage,
    projectCount,
    canPerformAction,
    trackUsage: trackUsage.mutate,
    isTracking: trackUsage.isPending,
    isLoading,
  };
};
