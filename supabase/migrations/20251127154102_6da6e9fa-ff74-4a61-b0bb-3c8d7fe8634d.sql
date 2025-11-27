-- Fix 1: Enable RLS on the user_subscriptions_safe view
-- Views inherit base table RLS when security_invoker=true, but we need to ensure it's properly configured
-- Drop and recreate with proper security settings

DROP VIEW IF EXISTS public.user_subscriptions_safe;

CREATE VIEW public.user_subscriptions_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  tier_id,
  status,
  trial_end,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  created_at,
  updated_at
FROM public.user_subscriptions;

-- Grant access to authenticated users
GRANT SELECT ON public.user_subscriptions_safe TO authenticated;

-- Add comment for documentation
COMMENT ON VIEW public.user_subscriptions_safe IS 'Secure view excluding sensitive Stripe IDs. Uses security_invoker=true to respect base table RLS policies.';

-- Fix 2: Remove user DELETE policy from rate_limits (prevents rate limit bypass)
DROP POLICY IF EXISTS "Users can delete their own rate limits" ON public.rate_limits;

-- Fix 3: Remove user DELETE policy from usage_metrics (prevents usage limit bypass)
DROP POLICY IF EXISTS "Users can delete their own usage metrics" ON public.usage_metrics;