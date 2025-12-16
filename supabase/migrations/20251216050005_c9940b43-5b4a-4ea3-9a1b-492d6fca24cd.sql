-- Fix the security definer view warning by using SECURITY INVOKER
-- This ensures the view runs with the permissions of the querying user

DROP VIEW IF EXISTS public.user_subscriptions_safe;

-- Recreate with SECURITY INVOKER to run as the querying user
CREATE VIEW public.user_subscriptions_safe 
WITH (security_barrier = true, security_invoker = true) AS
SELECT 
  id,
  user_id,
  tier_id,
  cancel_at_period_end,
  current_period_start,
  current_period_end,
  trial_end,
  created_at,
  updated_at,
  status
FROM public.user_subscriptions
WHERE user_id = auth.uid();

-- Grant access to authenticated users
GRANT SELECT ON public.user_subscriptions_safe TO authenticated;