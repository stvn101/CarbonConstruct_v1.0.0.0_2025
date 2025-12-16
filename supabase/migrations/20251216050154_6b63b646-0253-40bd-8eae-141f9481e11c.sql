-- Fix user_preferences_safe view with SECURITY INVOKER and proper filtering
DROP VIEW IF EXISTS public.user_preferences_safe;

-- Recreate with SECURITY INVOKER to run as the querying user
CREATE VIEW public.user_preferences_safe 
WITH (security_barrier = true, security_invoker = true) AS
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
FROM public.user_preferences
WHERE user_id = auth.uid();

-- Grant access to authenticated users
GRANT SELECT ON public.user_preferences_safe TO authenticated;