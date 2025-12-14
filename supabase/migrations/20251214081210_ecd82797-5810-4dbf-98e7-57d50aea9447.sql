-- Add INSERT policy for authenticated users to track their own usage
CREATE POLICY "Users can insert their own usage metrics"
ON public.usage_metrics
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add UPDATE policy for authenticated users to update their own usage metrics
CREATE POLICY "Users can update their own usage metrics"
ON public.usage_metrics
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);