-- Restrict INSERT on logging tables to service_role only (these are populated by edge functions)

-- error_logs - only service_role can insert
DROP POLICY IF EXISTS "Service role can manage error logs" ON public.error_logs;
CREATE POLICY "Service role can manage error logs"
ON public.error_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Explicitly deny INSERT from anon and authenticated
CREATE POLICY "Deny insert from non-service users"
ON public.error_logs
FOR INSERT
TO authenticated, anon
WITH CHECK (false);

-- performance_metrics - only service_role can insert
DROP POLICY IF EXISTS "Service role can manage performance metrics" ON public.performance_metrics;
CREATE POLICY "Service role can manage performance metrics"
ON public.performance_metrics
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Deny insert from non-service users on performance"
ON public.performance_metrics
FOR INSERT
TO authenticated, anon
WITH CHECK (false);

-- analytics_events - only service_role can insert
DROP POLICY IF EXISTS "Service role can manage analytics events" ON public.analytics_events;
CREATE POLICY "Service role can manage analytics events"
ON public.analytics_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Deny insert from non-service users on analytics"
ON public.analytics_events
FOR INSERT
TO authenticated, anon
WITH CHECK (false);