-- Enable RLS on user_subscriptions_safe view
-- Note: Views inherit RLS from underlying tables, but we should ensure proper access control

-- First, let's create RLS policies for the view if it's a materialized view or table
-- If it's a regular view, it already inherits from user_subscriptions table's RLS

-- Check: The user_subscriptions_safe is a view that excludes stripe_customer_id and stripe_subscription_id
-- Views in PostgreSQL inherit security from their underlying tables when security_invoker is set

-- Add security_invoker to the view to ensure RLS from base table is respected
DROP VIEW IF EXISTS public.user_subscriptions_safe;

CREATE VIEW public.user_subscriptions_safe 
WITH (security_invoker = true)
AS SELECT 
  id,
  user_id,
  tier_id,
  status,
  cancel_at_period_end,
  current_period_start,
  current_period_end,
  trial_end,
  created_at,
  updated_at
FROM public.user_subscriptions;

-- Grant appropriate permissions
GRANT SELECT ON public.user_subscriptions_safe TO authenticated;
GRANT SELECT ON public.user_subscriptions_safe TO anon;