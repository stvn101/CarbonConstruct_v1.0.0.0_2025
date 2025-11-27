-- Ensure rate_limits has no public/anon access (fix any remaining issues)
DROP POLICY IF EXISTS "service_role_full_access" ON public.rate_limits;
DROP POLICY IF EXISTS "Service role can manage all rate limits" ON public.rate_limits;

-- Recreate service role policy for edge functions
CREATE POLICY "Service role can manage all rate limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix error_logs: explicitly deny null user_id access to authenticated users
DROP POLICY IF EXISTS "Users can view their own error logs" ON public.error_logs;
CREATE POLICY "Users can view their own error logs"
ON public.error_logs
FOR SELECT
TO authenticated
USING (user_id IS NOT NULL AND auth.uid() = user_id);

-- Fix performance_metrics: explicitly deny null user_id access
DROP POLICY IF EXISTS "Users can view their own performance metrics" ON public.performance_metrics;
CREATE POLICY "Users can view their own performance metrics"
ON public.performance_metrics
FOR SELECT
TO authenticated
USING (user_id IS NOT NULL AND auth.uid() = user_id);

-- Fix analytics_events: explicitly deny null user_id access
DROP POLICY IF EXISTS "Users can view their own analytics events" ON public.analytics_events;
CREATE POLICY "Users can view their own analytics events"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (user_id IS NOT NULL AND auth.uid() = user_id);

-- Ensure anon role has no access to rate_limits (explicit deny)
REVOKE ALL ON public.rate_limits FROM anon;

-- Ensure subscription_tiers doesn't expose stripe_price_id to anon
-- Drop the overly permissive anon policy
DROP POLICY IF EXISTS "Public can view active tier names and prices" ON public.subscription_tiers;