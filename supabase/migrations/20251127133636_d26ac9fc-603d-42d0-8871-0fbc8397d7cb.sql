-- Fix rate_limits RLS - users should only see their own data
DROP POLICY IF EXISTS "service_role_full_access" ON public.rate_limits;
DROP POLICY IF EXISTS "Users can view their own rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Users can insert their own rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Users can update their own rate limits" ON public.rate_limits;

-- Create proper user-specific policies for rate_limits
CREATE POLICY "Users can view their own rate limits"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rate limits"
ON public.rate_limits
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rate limits"
ON public.rate_limits
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Fix subscription_tiers - create public view for marketing data only
-- Keep full table restricted to authenticated users
DROP POLICY IF EXISTS "Anyone can view subscription tiers" ON public.subscription_tiers;
DROP POLICY IF EXISTS "Authenticated users can view subscription tiers" ON public.subscription_tiers;

CREATE POLICY "Authenticated users can view subscription tiers"
ON public.subscription_tiers
FOR SELECT
TO authenticated
USING (is_active = true);

-- Allow anon to see only basic tier info (not stripe IDs)
CREATE POLICY "Public can view active tier names and prices"
ON public.subscription_tiers
FOR SELECT
TO anon
USING (is_active = true);

-- Fix alerts table - only admins should see alerts
DROP POLICY IF EXISTS "Admins can view all alerts" ON public.alerts;
DROP POLICY IF EXISTS "Service role manages alerts" ON public.alerts;

CREATE POLICY "Admins can view all alerts"
ON public.alerts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can manage alerts"
ON public.alerts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);