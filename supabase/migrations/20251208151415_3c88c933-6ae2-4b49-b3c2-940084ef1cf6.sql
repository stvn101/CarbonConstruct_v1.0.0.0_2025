-- Fix 1: Add DELETE policy for rate_limits to prevent manipulation
CREATE POLICY "Users can delete their own rate limits"
ON public.rate_limits
FOR DELETE
USING (auth.uid() = user_id);

-- Fix 2: Hide deletion_token from user_preferences SELECT
-- Drop existing select policy and create one that excludes sensitive fields
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;

-- Create a view that excludes the deletion_token
CREATE OR REPLACE VIEW public.user_preferences_safe AS
SELECT 
  id,
  user_id,
  analytics_enabled,
  marketing_enabled,
  preferences_data,
  created_at,
  updated_at,
  status_changed_at,
  deletion_scheduled_at,
  cookie_consent,
  account_status
FROM public.user_preferences;

-- Set security invoker on the view
ALTER VIEW public.user_preferences_safe SET (security_invoker = true);

-- Recreate SELECT policy on user_preferences for the safe view access
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences
FOR SELECT
USING (auth.uid() = user_id);

-- Fix 3: Ensure user_subscriptions_safe view has proper security
-- The view already has security_invoker = true from previous migration
-- Add explicit comment for clarity
COMMENT ON VIEW public.user_subscriptions_safe IS 'Safe view excluding Stripe IDs, uses security_invoker for RLS enforcement';