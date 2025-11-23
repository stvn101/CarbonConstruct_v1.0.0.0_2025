-- Fix security findings from scan

-- 1. Fix user_subscriptions INSERT policy to validate user_id matches auth.uid()
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can insert their own subscription"
ON public.user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Add UPDATE policy for materials_import_jobs so users can update their own jobs
CREATE POLICY "Users can update their own import jobs"
ON public.materials_import_jobs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Add INSERT and UPDATE policies for rate_limits to allow rate limiting system to work
CREATE POLICY "Users can insert their own rate limits"
ON public.rate_limits
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rate limits"
ON public.rate_limits
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Add DELETE policy for usage_metrics for data cleanup
CREATE POLICY "Users can delete their own usage metrics"
ON public.usage_metrics
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Add DELETE policy for user_subscriptions for cleanup scenarios
CREATE POLICY "Users can delete their own subscriptions"
ON public.user_subscriptions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);