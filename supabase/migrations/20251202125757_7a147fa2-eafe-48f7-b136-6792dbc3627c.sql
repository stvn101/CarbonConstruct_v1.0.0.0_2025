-- Fix Issue 1: Allow authenticated users to manage their own rate limits
-- This enables the rate-limiter helper to work properly from edge functions

-- Allow authenticated users to insert their own rate limits
CREATE POLICY "Users can insert their own rate limits"
ON public.rate_limits
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own rate limits
CREATE POLICY "Users can update their own rate limits"
ON public.rate_limits
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);