-- Create a secure view for user_subscriptions that excludes sensitive Stripe IDs
-- This provides defense-in-depth at the database level

CREATE OR REPLACE VIEW public.user_subscriptions_safe AS
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
COMMENT ON VIEW public.user_subscriptions_safe IS 'Secure view excluding sensitive Stripe IDs (stripe_customer_id, stripe_subscription_id). Use this view for client-facing queries.';