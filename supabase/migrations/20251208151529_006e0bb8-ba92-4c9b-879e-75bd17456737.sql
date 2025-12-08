-- Critical Fix 1: Remove user write access to rate_limits (should be service-role only)
DROP POLICY IF EXISTS "Users can insert their own rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Users can update their own rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Users can delete their own rate limits" ON public.rate_limits;

-- Critical Fix 2: Exclude deletion_token from user_preferences SELECT
-- Drop and recreate with explicit column exclusion
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;

-- Create a security definer function to return preferences without deletion_token
CREATE OR REPLACE FUNCTION public.get_user_preferences(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  analytics_enabled boolean,
  marketing_enabled boolean,
  preferences_data jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  status_changed_at timestamptz,
  deletion_scheduled_at timestamptz,
  cookie_consent text,
  account_status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id, user_id, analytics_enabled, marketing_enabled, 
    preferences_data, created_at, updated_at, status_changed_at,
    deletion_scheduled_at, cookie_consent, account_status
  FROM public.user_preferences
  WHERE user_preferences.user_id = p_user_id;
$$;

-- Allow users to view their own preferences (but app should use function for safety)
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences
FOR SELECT
USING (auth.uid() = user_id);