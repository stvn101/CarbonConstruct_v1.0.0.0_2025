-- Fix 1: Add RLS policies to user_subscriptions_safe view
-- Views in PostgreSQL don't support RLS directly, so we recreate as SECURITY BARRIER view
-- and add RLS to ensure proper access control

-- Drop the existing view
DROP VIEW IF EXISTS public.user_subscriptions_safe;

-- Recreate with SECURITY BARRIER to prevent data leakage through optimizations
CREATE VIEW public.user_subscriptions_safe WITH (security_barrier = true) AS
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
WHERE user_id = auth.uid();  -- Built-in row filtering

-- Grant access to authenticated users
GRANT SELECT ON public.user_subscriptions_safe TO authenticated;

-- Fix 2: Secure SECURITY DEFINER functions with caller validation

-- Fix get_user_tier to validate caller
CREATE OR REPLACE FUNCTION public.get_user_tier(user_id_param uuid)
RETURNS TABLE(tier_name text, tier_limits jsonb, subscription_status text, trial_active boolean)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Authorization check: users can only query their own tier
  -- Service role and admins can query any user
  IF auth.uid() IS NOT NULL AND auth.uid() != user_id_param AND NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: can only query own subscription tier';
  END IF;

  RETURN QUERY
  SELECT 
    st.name,
    st.limits,
    COALESCE(us.status, 'free'),
    CASE 
      WHEN us.trial_end IS NOT NULL AND us.trial_end > now() THEN true
      ELSE false
    END as trial_active
  FROM public.subscription_tiers st
  LEFT JOIN public.user_subscriptions us ON us.tier_id = st.id AND us.user_id = user_id_param
  WHERE (us.user_id = user_id_param OR st.name = 'Free')
  ORDER BY st.display_order DESC
  LIMIT 1;
END;
$$;

-- Fix can_perform_action to validate caller
CREATE OR REPLACE FUNCTION public.can_perform_action(user_id_param uuid, action_type text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tier_limits jsonb;
  current_usage integer;
  limit_value integer;
BEGIN
  -- Authorization check: users can only check their own actions
  -- Service role and admins can check any user
  IF auth.uid() IS NOT NULL AND auth.uid() != user_id_param AND NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: can only check own action permissions';
  END IF;

  -- Get user's tier limits
  SELECT limits INTO tier_limits
  FROM public.get_user_tier(user_id_param);
  
  -- Get the limit for this action
  limit_value := (tier_limits->>action_type)::integer;
  
  -- -1 means unlimited
  IF limit_value = -1 THEN
    RETURN true;
  END IF;
  
  -- Get current usage
  SELECT count INTO current_usage
  FROM public.usage_metrics
  WHERE user_id = user_id_param
    AND metric_type = action_type
    AND period_start <= now()
    AND period_end >= now();
  
  -- If no usage record, assume 0
  IF current_usage IS NULL THEN
    current_usage := 0;
  END IF;
  
  RETURN current_usage < limit_value;
END;
$$;

-- Fix get_user_preferences to validate caller
CREATE OR REPLACE FUNCTION public.get_user_preferences(p_user_id uuid)
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  analytics_enabled boolean, 
  marketing_enabled boolean, 
  preferences_data jsonb, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  status_changed_at timestamp with time zone,
  deletion_scheduled_at timestamp with time zone, 
  cookie_consent text, 
  account_status text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Authorization check: users can only query their own preferences
  -- Service role and admins can query any user
  IF auth.uid() IS NOT NULL AND auth.uid() != p_user_id AND NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: can only query own preferences';
  END IF;

  RETURN QUERY
  SELECT 
    up.id, 
    up.user_id, 
    up.analytics_enabled, 
    up.marketing_enabled, 
    up.preferences_data, 
    up.created_at, 
    up.updated_at, 
    up.status_changed_at,
    up.deletion_scheduled_at, 
    up.cookie_consent, 
    up.account_status
  FROM public.user_preferences up
  WHERE up.user_id = p_user_id;
END;
$$;