-- Fix: Enable RLS on user_subscriptions_safe view with security_invoker
-- This ensures the view respects the base table's RLS policies

-- Drop and recreate the view with security_invoker
DROP VIEW IF EXISTS public.user_subscriptions_safe;

CREATE VIEW public.user_subscriptions_safe 
WITH (security_invoker = true) AS
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
FROM public.user_subscriptions;

-- Add comment for documentation
COMMENT ON VIEW public.user_subscriptions_safe IS 'Safe view excluding Stripe IDs. Uses security_invoker=true so it inherits RLS from user_subscriptions table.';