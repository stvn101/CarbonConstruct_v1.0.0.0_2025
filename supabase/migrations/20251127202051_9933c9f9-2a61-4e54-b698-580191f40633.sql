-- Fix Security Issues: Restrict write access to sensitive tables

-- 1. Remove user ability to INSERT/UPDATE rate_limits (only service role should write via edge functions)
DROP POLICY IF EXISTS "Users can insert their own rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Users can update their own rate limits" ON public.rate_limits;

-- Create service-role only write policies for rate_limits
CREATE POLICY "Service role can manage rate limits" 
ON public.rate_limits FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 2. Remove user ability to INSERT/UPDATE usage_metrics (prevents usage manipulation)
DROP POLICY IF EXISTS "Users can insert their own usage metrics" ON public.usage_metrics;
DROP POLICY IF EXISTS "Users can update their own usage metrics" ON public.usage_metrics;

-- Create service-role only write policies for usage_metrics
CREATE POLICY "Service role can manage usage metrics" 
ON public.usage_metrics FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 3. Remove user DELETE on user_subscriptions (Stripe webhook handles this)
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON public.user_subscriptions;

-- 4. Restrict user_subscriptions INSERT/UPDATE to service role only (Stripe webhook manages subscriptions)
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;

-- Create service-role only write policies for user_subscriptions
CREATE POLICY "Service role can manage subscriptions" 
ON public.user_subscriptions FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 5. Add admin management policy for user_subscriptions
CREATE POLICY "Admins can manage all subscriptions" 
ON public.user_subscriptions FOR ALL 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role)) 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));